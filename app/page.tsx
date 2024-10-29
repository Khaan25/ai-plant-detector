'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

type Result = {
  commonName: string
  scientificName: string
  otherCommonNames: string[]
  description: string
  wikipediaLink: string
}

export default function ImageAnalyzer() {
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [image, setImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function handleSubmit() {
    setResult(null)
    setError(null)

    if (!image) {
      return alert('Image Not Selected')
    }

    setIsLoading(true)

    const response = await fetch('/api/identify', {
      method: 'POST',
      body: JSON.stringify({ image }),
    })

    const data = await response.json()

    if (data.error) {
      setError(data.error as string)
    } else {
      setResult(data.result)
    }

    setIsLoading(false)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
        e.target.value = '' // Clear the input value to remove the previous image selection
      }
      reader.readAsDataURL(file)
    } else {
      setImage(null)
      e.target.value = '' // Clear the input value to remove the previous image selection
    }
  }

  function handleClear() {
    setImage(null)
    setResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Image Analyzer</CardTitle>
          <CardDescription>Upload an image to analyze using Gemini AI</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <Input id="image" name="image" type="file" accept="image/*" required onChange={handleImageChange} />
            </div>
            {image && (
              <div className="mt-4">
                <Image width={500} height={500} src={image} alt="Preview" className="max-w-full h-auto rounded-md" />
              </div>
            )}
            <div className="flex justify-between">
              <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Image'
                )}
              </Button>
              {result && (
                <Button onClick={handleClear} variant="secondary">
                  Clear
                </Button>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {result && (
            <div className="w-full">
              <h3 className="font-semibold mb-2">Analysis Result:</h3>
              <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto w-full">
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </pre>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
