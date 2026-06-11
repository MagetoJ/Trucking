'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, RefreshCw, X } from 'lucide-react'

export default function PWAManager() {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    // 1. Intercept native install criteria metrics
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
      setIsInstallable(true)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // 2. Poll production Service Workers for background updates
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.ready.then((registration) => {
        // Re-check service worker hashes every 5 minutes
        setInterval(() => {
          registration.update()
        }, 1000 * 60 * 5)

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true)
              }
            })
          }
        })
      })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstallable(false)
    }
  }

  const handleUpdateClick = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.waiting?.postMessage({ type: 'SKIP_WAITING' })
        }
      })
    }
    window.location.reload()
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0">
      {/* App Installation Action Banner */}
      {isInstallable && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-2xl flex flex-col gap-3 text-slate-100 animate-in fade-in duration-200">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-sm">Install TruckHub Web App</h4>
              <p className="text-xs text-slate-400 mt-0.5">Add to your home screen for immediate logistics manifest access.</p>
            </div>
            <button onClick={() => setIsInstallable(false)} className="text-slate-500 hover:text-slate-300 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <Button onClick={handleInstallClick} className="w-full bg-orange-500 hover:bg-orange-600 text-slate-950 text-xs font-black py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer">
            <Download className="w-3.5 h-3.5" /> Install Platform
          </Button>
        </div>
      )}

      {/* Hotfix/Update Deployment Alert Banner */}
      {updateAvailable && (
        <div className="bg-indigo-950 border border-indigo-900/60 p-4 rounded-xl shadow-2xl flex flex-col gap-3 text-slate-100 animate-bounce">
          <div>
            <h4 className="font-bold text-sm flex items-center gap-1.5 text-indigo-400">
              <RefreshCw className="w-4 h-4 animate-spin" /> Optimization Update Ready
            </h4>
            <p className="text-xs text-slate-300 mt-1">A new version of the control console is ready. Apply to ingest changes.</p>
          </div>
          <Button onClick={handleUpdateClick} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-lg cursor-pointer">
            Apply Platform Update
          </Button>
        </div>
      )}
    </div>
  )
}