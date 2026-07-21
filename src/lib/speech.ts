/**
 * Text-to-speech via the browser's built-in Web Speech API — no
 * external service, no API key, works natively in Safari on iOS.
 * `lang` picks the closest available voice (e.g. 'es-ES' for Spanish,
 * 'en-US' for English) — actual voice quality depends on what's
 * installed on the device, not something this app controls.
 */
export function speak(text: string, lang: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel() // stop anything already playing
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  window.speechSynthesis.speak(utterance)
}

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}
