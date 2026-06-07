import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import bookingRouter from './routes/bookings'
import authRouter from './routes/auth'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Activate cross-origin permissions to communicate with your standalone Frontend folder
app.use(cors({
  origin: 'http://localhost:3000', // Matches your Next.js development server URL
  credentials: true
}))

app.use(express.json())
app.use(cookieParser())

// Bind your application route configurations
app.use('/api/auth', authRouter)
app.use('/api/bookings', bookingRouter)

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', platform: 'TruckHub Engine' })
})

app.listen(PORT, () => {
  console.log(`🚀 Standalone TruckHub Backend Server listening smoothly on port: ${PORT}`)
})