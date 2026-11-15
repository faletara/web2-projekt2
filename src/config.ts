import dotenv from 'dotenv'
dotenv.config()

export const port = process.env.PORT ? parseInt(process.env.PORT) : 4080
export const baseURL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`

export const onRender = Boolean(process.env.RENDER_EXTERNAL_URL)

if (!process.env.COOKIE_KEY) {
  throw new Error('COOKIE_KEY nije postavljen')
}
export const cookieKey = process.env.COOKIE_KEY
