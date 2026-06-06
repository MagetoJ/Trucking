import { initializeApp, getApps, getApp } from 'firebase/app'
import { getDatabase, ref, set, onValue } from 'firebase/database'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Initialize safe runtime instance
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
const rtdb = getDatabase(app)

/**
 * Driver Pings location change to cache coordinates node
 */
export function emitDriverCoordinates(bookingId: string, lat: number, lng: number, eta: string, progress: number) {
  set(ref(rtdb, `tracking/${bookingId}`), {
    lat,
    lng,
    eta,
    progress,
    updatedAt: Date.now()
  })
}

/**
 * Shipper hooks state stream listeners on tracking view dashboards
 */
export function listenToTripTelemetry(bookingId: string, callback: (data: any) => void) {
  const channelRef = ref(rtdb, `tracking/${bookingId}`)
  return onValue(channelRef, (snapshot) => {
    callback(snapshot.val())
  })
}