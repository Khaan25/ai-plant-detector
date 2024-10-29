import { redis } from '@/lib/redis'
import { unkey } from '@/lib/unkey'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { nanoid } from 'nanoid'
import { NextRequest, NextResponse } from 'next/server'

const unkeyApiKey = process.env.UNKEY_API_KEY

if (!unkeyApiKey) {
  throw new Error('UNKEY_API_KEY is not set')
}

const getClientIp = (req: NextRequest): string => {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  return ip.startsWith('::ffff:') ? ip.slice(7) : ip
}

async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')

  return `data:${response.headers.get('content-type')};base64,${base64}`
}

export async function POST(request: NextRequest) {
  // Get the client's IP address
  const ip = getClientIp(request)

  // Check the rate limit
  const rateLimitResponse = await unkey.limit(ip, { cost: 2 })

  // If the rate limit is exceeded, respond with an error
  if (!rateLimitResponse.success) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 })
  }

  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    throw new Error('GOOGLE_GEMINI_API_KEY is not set')
  }

  const requestBody = await request.json()

  if (!requestBody || typeof requestBody !== 'object' || requestBody === null) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const image = requestBody.image
    let imageData: string

    if (image.startsWith('http://') || image.startsWith('https://')) {
      imageData = await fetchImageAsBase64(image)
    } else if (image.startsWith('data:')) {
      imageData = image
    } else {
      return NextResponse.json({ error: 'Invalid image format provided' }, { status: 400 })
    }

    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Prepare the image for the API
    const base64Data = imageData.split(',')[1] // Remove the data URL prefix

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: 'image/jpeg',
      },
    }

    // Generate content using the Gemini API
    const result = await model.generateContent([
      'Analyze this plant image and provide the following information in JSON format:\n{\n  "commonName": "...",\n  "scientificName": "...",\n  "otherCommonNames": ["...", "..."],\n  "description": "...",\n  "wikipediaLink": "..."\n}\n\nIf it is not a plant, respond with: {"error": "Please upload plant images ONLY"}\n\nProvide ONLY the JSON output, nothing else.',
      imagePart,
    ])

    const response = await result.response
    const generatedText = response.text()
    const generatedJson = JSON.parse(generatedText)
    console.log('generatedJson :', generatedJson)

    // Check if the image is a plant
    if (!generatedText.includes('Please upload plant images ONLY')) {
      // Save to Database
      const shortCode = nanoid(6)
      const plants = (await redis.get('plants')) as Record<string, string>

      if (plants) {
        plants[shortCode] = JSON.stringify(generatedJson)
        await redis.set('plants', JSON.stringify(plants))
      } else {
        await redis.set(
          'plants',
          JSON.stringify({
            [shortCode]: JSON.stringify(generatedJson),
          })
        )
      }

      return NextResponse.json({ result: generatedJson }, { status: 200 })
    } else {
      return NextResponse.json({ error: 'Please upload plant images ONLY' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error identifying plant:', error)
    return NextResponse.json({ error: 'Error identifying plant. Please try again.' }, { status: 500 })
  }
}
