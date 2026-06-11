import './env'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import bookingRouter from './routes/bookings'
import authRouter from './routes/auth'
import adminRouter from './routes/admin'
import adminDashboardRouter from './routes/adminDashboard'
import kycRouter from './routes/kyc'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Dynamic CORS registration: uses FRONTEND_URL environment variable in production,
// falling back to local port 3000 during development workflows.
// Sanitized code that removes any accidental trailing slash to prevent CORS mismatches
const rawOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
const allowedOrigin = rawOrigin.endsWith('/') ? rawOrigin.slice(0, -1) : rawOrigin;

app.use(cors({
  origin: allowedOrigin,
  credentials: true
}))

app.use(express.json())
app.use(cookieParser())

// Bind your application route configurations
app.use('/api/auth', authRouter)
app.use('/api/bookings', bookingRouter)
app.use('/api/admin', adminRouter)
app.use('/api/admin-dashboard', adminDashboardRouter)
app.use('/api/kyc', kycRouter)

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', platform: 'TruckHub Engine' })
})

app.listen(PORT, () => {
  console.log(`🚀 Standalone TruckHub Backend Server listening smoothly on port: ${PORT}`)
})