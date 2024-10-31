# AI Plant Detector with Next.js 15 and Shadcn UI

**Live Link:** [https://ai-plant-detector-zia-unkey.vercel.app/](https://ai-plant-detector-zia-unkey.vercel.app/)

This project showcases an AI-powered plant detector service built with Next.js 15, leveraging the new App Router and the shadcn/ui component library. Additionally, it integrates with Unkey.com for enforcing rate limits (3 requests per 10 minutes).

## Key Features

- Next.js 15 with the new App Router
- AI-powered plant detection (Google Gemini)
- Rate limiting based on Unkey configurations
- UI components from the shadcn/ui library

## Setup and Configuration

1. Install project dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```
   or
   ```
   bun install
   ```

2. Configure environment variables:
   Create a `.env` file in the project root with the following content:
   ```
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   UNKEY_API_KEY=unkey_some_token
   UNKEY_API_ID=api_some_id
   REDIS_URL=https://some-redis-url.upstash.io
   REDIS_TOKEN=some-redis-token
   GOOGLE_GEMINI_API_KEY=some-gemini-key
   ```

3. Set up Unkey:
   - Register at [unkey.com](https://unkey.com)
   - Create a new API.
   - Add the API key and API ID to the `.env` file.

4. Set up Upstash:
   - Register at [upstash.com](https://upstash.com)
   - Create a new Redis database.
   - Add the Redis URL and token to the `.env` file.

5. Launch the development server:
   ```
   npm run dev
   ```
   or
   ```
   yarn dev
   ```
   or
   ```
   bun dev
   ```

## Using the AI Plant Detector

- Head over to `http://localhost:3000` and upload the image of the plant you want to identify.
- View the generated identification result.
