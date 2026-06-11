'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { BACKEND_BASE_URL } from '@/lib/fetcher'
import { useAuthStore, AuthState } from '@/lib/store' // Import AuthState
import { Mail, ShieldCheck, FileText, Camera, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react'

export default function DriverKycOnboardingHub() {
  // Explicitly type the state parameter for better type safety
  const token = useAuthStore((state: AuthState) => state.token)
  const user = useAuthStore((state: AuthState) => state.user)
  
  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([])
  
  // Local Form Buffer Mappings
  const [enteredOtp, setEnteredOtp] = useState('')
  const [nationalIdNum, setNationalIdNum] = useState('')
  const [carrierLicenseRef, setCarrierLicenseRef] = useState('')
  const [licensePlateString, setLicensePlateString] = useState('')

  const logEvent = (message: string) => setTelemetryLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev])

  const requestEmailVerificationCode = async () => {
    setIsProcessing(true)
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/kyc/step1-send-email-otp`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        logEvent(`SMTP Server Handshake: Code dispatched to ${user?.email}. Hint code simulation token => ${data.stubbedOtp}`)
        setStep(2)
      }
    } catch { logEvent('SMTP network pipeline connection error.') }
    finally { setIsProcessing(false) }
  }

  const verifyEmailOtpHandshake = async () => {
    setIsProcessing(true)
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/kyc/step2-verify-email-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ otp: enteredOtp, idNumber: nationalIdNum })
      })
      if (res.ok) {
        logEvent('Identity context validated and locked onto onboarding tracking matrices.')
        setStep(3)
      } else { logEvent('Verification failed: Invalid token string.') }
    } catch { logEvent('Handshake execution exception.') }
    finally { setIsProcessing(false) }
  }

  const runIntelligentOcrCheck = async () => {
    setIsProcessing(true)
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/kyc/step3-process-ocr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ idPhotoUrl: "national_id_front.jpg" })
      })
      const data = await res.json()
      logEvent(`OCR Pipeline: Extracting text lines. Confidence: ${data.ocrConfidence}. Match: ${data.autoApproved}`)
      setStep(4)
    } catch { logEvent('OCR module response timeout exception.') }
    finally { setIsProcessing(false) }
  }

  const saveFleetCredentials = async () => {
    setIsProcessing(true)
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/kyc/step4-fleet-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ licenseNumber: carrierLicenseRef, truckPlate: licensePlateString })
      })
      if (res.ok) {
        logEvent('Fleet asset records securely tied into user data profile ledger.')
        setStep(5)
      }
    } catch { logEvent('Credential database post error.') }
    finally { setIsProcessing(false) }
  }

  const processFacialCrossMatch = async () => {
    setIsProcessing(true)
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/kyc/step5-facial-biometrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ selfieUrl: "driver_selfie.jpg" })
      })
      const data = await res.json()
      logEvent(`Biometrics Engine: Similarity analysis score output => ${data.similarityScore}`)
      setStep(6)
    } catch { logEvent('Biometric pipeline lookup crashed.') }
    finally { setIsProcessing(false) }
  }

  const executePayoutTestPush = async () => {
    setIsProcessing(true)
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/kyc/step6-wallet-test-deposit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        logEvent(`Daraja Gateway Clear: Transaction Trace Ref => ${data.checkoutTraceId}. Wallet channel verified and verified state flag pushed globally.`)
        setStep(7)
      }
    } catch { logEvent('M-Pesa system timeout exception error.') }
    finally { setIsProcessing(false) }
  }

  const triggerIsolatedNodeReset = async (nodeKey: string) => {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/kyc/reset-isolated-document-node`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ documentTargetKey: nodeKey })
      })
      if (res.ok) logEvent(`Resiliency Override Engine: Cleared single database matrix state cell ['${nodeKey}'] back to PENDING. Flow sequence remains un-purged.`)
    } catch { logEvent('Override exception.') }
  }

  return (
    <div className="grid lg:grid-cols-5 gap-6 max-w-6xl mx-auto items-start pb-12">
      
      {/* PHONE DRAWER SIMULATOR COMPONENT PANEL */}
      <div className="lg:col-span-2 flex justify-center">
        <div className="w-[315px] h-[630px] bg-slate-950 border-8 border-slate-900 rounded-[38px] shadow-2xl overflow-hidden flex flex-col relative">
          
          {/* Mock Screen Header Bar */}
          <div className="h-6 bg-slate-900 w-full flex justify-between items-center px-6 text-[9px] font-mono text-slate-400 select-none">
            <span>Carrier Secure</span>
            <div className="w-16 h-3 bg-black rounded-full mx-auto absolute left-0 right-0 top-1"></div>
            <span>Step {step}/7</span>
          </div>

          {/* Core Interactive Screen Canvas viewport */}
          <div className="flex-1 p-5 space-y-4 flex flex-col justify-between bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
            <div>
              {/* Load bearing responsive progress indicators */}
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-5">
                <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${(step / 7) * 100}%` }}></div>
              </div>

              {step === 1 && (
                <div className="space-y-4 text-center pt-6 animate-fade-in">
                  <Mail className="w-12 h-12 text-orange-500 mx-auto" />
                  <h3 className="font-bold text-sm tracking-tight">Email Inbox Verification</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">We will dispatch a secure 6-digit cryptographic verification pass token straight to your registered corporate communication destination point:</p>
                  <div className="text-xs font-mono font-bold text-orange-400 bg-slate-900/60 border border-slate-800 p-2 rounded-lg truncate">{user?.email}</div>
                  <Button onClick={requestEmailVerificationCode} disabled={isProcessing} className="w-full bg-orange-500 hover:bg-orange-600 text-slate-950 text-xs font-black py-2.5 rounded-xl cursor-pointer">
                    {isProcessing ? 'Transmitting Token...' : 'Request Email Code'}
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3 pt-2 animate-fade-in">
                  <h4 className="text-xs font-bold tracking-wide">Validate Secure Token Handshake</h4>
                  <p className="text-[10px] text-slate-400">Check your inbox at <strong>{user?.email}</strong> and transcribe the registration token code digits below:</p>
                  <input type="text" maxLength={6} placeholder="Enter 6-Digit Email OTP" value={enteredOtp} onChange={e => setEnteredOtp(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-center tracking-widest outline-none text-white focus:border-orange-500" />
                  <input type="text" placeholder="National Identification Card Number" value={nationalIdNum} onChange={e => setNationalIdNum(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs outline-none text-white focus:border-orange-500" />
                  <Button onClick={verifyEmailOtpHandshake} disabled={isProcessing || enteredOtp.length !== 6 || !nationalIdNum} className="w-full bg-orange-500 text-slate-950 text-xs font-black py-2.5 rounded-xl mt-1 cursor-pointer">
                    Verify Registration Assets
                  </Button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 text-center pt-4 animate-fade-in">
                  <FileText className="w-12 h-12 text-indigo-400 mx-auto" />
                  <h3 className="font-bold text-sm">Scan Identification Card Front</h3>
                  <p className="text-[10px] text-slate-400 leading-relaxed">System runs automated extraction matches directly comparing scan lines with your transcribed step 2 attributes.</p>
                  <div className="border-2 border-dashed border-slate-800 p-6 rounded-xl bg-slate-900/40 text-[10px] font-mono text-slate-500">national_id_card_scan.jpg</div>
                  <Button onClick={runIntelligentOcrCheck} disabled={isProcessing} className="w-full bg-orange-500 text-slate-950 text-xs font-black py-2.5 rounded-xl cursor-pointer">
                    Execute Automated OCR Matrix
                  </Button>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-3 pt-2 animate-fade-in">
                  <h4 className="text-xs font-bold">Log Fleet Carrier Attributes</h4>
                  <input type="text" placeholder="Commercial Driver's License Number" value={carrierLicenseRef} onChange={e => setCarrierLicenseRef(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs outline-none text-white focus:border-orange-500" />
                  <input type="text" placeholder="Truck License Plate (e.g. KAA 104Z)" value={licensePlateString} onChange={e => setLicensePlateString(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs outline-none text-white focus:border-orange-500" />
                  <Button onClick={saveFleetCredentials} disabled={isProcessing || !carrierLicenseRef || !licensePlateString} className="w-full bg-orange-500 text-slate-950 text-xs font-black py-2.5 rounded-xl mt-1 cursor-pointer">
                    Save Specifications
                  </Button>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4 text-center pt-6 animate-fade-in">
                  <Camera className="w-12 h-12 text-teal-400 mx-auto" />
                  <h3 className="font-bold text-sm">Anti-Fraud Facial Geometry Matching</h3>
                  <p className="text-[10px] text-slate-400 leading-relaxed">AWS Rekognition service pipelines map face dimensions cross-comparing similarity with your step 3 scan properties.</p>
                  <Button onClick={processFacialCrossMatch} disabled={isProcessing} className="w-full bg-orange-500 text-slate-950 text-xs font-black py-2.5 rounded-xl cursor-pointer">
                    Perform Identity Comparison Check
                  </Button>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-4 text-center pt-6 animate-fade-in">
                  <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h3 className="font-bold text-sm">Payout Channel Authorization</h3>
                  <p className="text-[10px] text-slate-400 leading-relaxed">Triggers an automated KES 1 STK Push test deposit. Prevents payout support tickets from corrupted mobile wallet records.</p>
                  <Button onClick={executePayoutTestPush} disabled={isProcessing} className="w-full bg-orange-500 text-slate-950 text-xs font-black py-2.5 rounded-xl cursor-pointer">
                    Authorize Billing Verification Check
                  </Button>
                </div>
              )}

              {step === 7 && (
                <div className="space-y-4 text-center pt-10 animate-fade-in">
                  <CheckCircle className="w-12 h-12 text-orange-500 mx-auto" />
                  <h3 className="font-bold text-sm">Onboarding Pipeline Concluded</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Verification vectors matched. Your master profile verified state flag has been pushed onto live operational tables.</p>
                </div>
              )}
            </div>

            <p className="text-[8px] font-mono text-slate-500 text-center select-none">Powered by TruckHub Transactional Mailers</p>
          </div>

        </div>
      </div>

      {/* RIGHT DIAGNOSTIC PANEL: REAL-TIME LIFECYCLE TELEMETRY WATCHERS */}
      <div className="lg:col-span-3 flex flex-col justify-between bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl min-h-[630px]">
        <div className="space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-xl font-black text-white">Ecosystem KYC Control Ledger</h2>
            <p className="text-xs text-slate-400 mt-1 font-mono">Observe automated background verification logs and database status updates live.</p>
          </div>

          {/* Resiliency Override Controller Dashboard Box */}
          <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wide text-orange-400 flex items-center gap-1.5 font-mono">
              <AlertCircle className="w-4 h-4" /> Multi-Resiliency Recovery Matrix
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">If a supervisor reallocates or flags an obscured record (e.g., an unreadable insurance file), click a node context override below to instantly reset just that row element while preserving the remaining flow data state entries:</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {[
                { label: "Reset ID Scan", key: "idCardStatus" },
                { label: "Reset License Credentials", key: "licenseStatus" },
                { label: "Reset Insurance Form", key: "insuranceStatus" },
                { label: "Reset Biometric Selfie", key: "selfieStatus" }
              ].map((node) => (
                <button
                  key={node.key}
                  onClick={() => triggerIsolatedNodeReset(node.key)}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg font-mono text-[10px] text-slate-200 hover:border-orange-500 transition cursor-pointer"
                >
                  {node.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Active Streaming Log Output Shell */}
        <div className="mt-4 flex-1 bg-slate-950 border border-slate-850 p-4 rounded-xl font-mono text-[11px] overflow-y-auto max-h-[220px] space-y-1.5 text-slate-300">
          <p className="text-slate-600 select-none">// Intercepting system telemetry actions pipeline hooks...</p>
          {telemetryLogs.map((log, index) => (
            <p key={index} className="text-indigo-400 leading-tight">➔ {log}</p>
          ))}
        </div>
      </div>

    </div>
  )
}