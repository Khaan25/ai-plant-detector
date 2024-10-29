import { Ratelimit } from '@unkey/ratelimit'

if (!process.env.UNKEY_API_KEY) {
  throw new Error('UNKEY_API_KEY is not set')
}

export const unkey = new Ratelimit({
  rootKey: process.env.UNKEY_API_KEY,
  namespace: 'plant.identifier',
  limit: 3,
  duration: '10m',
  async: true,
})
