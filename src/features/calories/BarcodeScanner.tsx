import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import type { IScannerControls } from '@zxing/browser'

/**
 * Camera-based barcode scanning via ZXing's pure-JS decoder rather than
 * the browser's native BarcodeDetector API — Safari on iOS doesn't
 * support BarcodeDetector (Chrome/Android only), so a JS library that
 * decodes frames from the camera video feed directly is the only
 * approach that actually works on the primary device this app targets.
 */
export default function BarcodeScanner({
  onDetected,
  onClose,
}: {
  onDetected: (code: string) => void
  onClose: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    let cancelled = false

    reader
      .decodeFromVideoDevice(undefined, videoRef.current ?? undefined, (result, _err, controls) => {
        if (cancelled) return
        controlsRef.current = controls
        if (result) {
          controls.stop()
          onDetected(result.getText())
        }
        // NotFoundException fires continuously while no barcode is in
        // frame yet — that's normal scanning, not an error to surface.
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? `Camera access failed: ${err.message}`
              : 'Camera access failed — check permissions in Settings.',
          )
        }
      })

    return () => {
      cancelled = true
      controlsRef.current?.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between p-4">
        <p className="text-sm font-medium text-white">Scan a barcode</p>
        <button onClick={onClose} className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white">
          Cancel
        </button>
      </div>

      <div className="relative flex-1">
        <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-32 w-64 rounded-lg border-2 border-rdp-signal" />
        </div>
      </div>

      {error && (
        <div className="p-4">
          <p className="text-sm text-rdp-risk">{error}</p>
        </div>
      )}

      <p className="p-4 text-center text-xs text-white/60">Point your camera at a barcode</p>
    </div>
  )
}
