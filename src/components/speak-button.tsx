'use client'

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { Volume2 } from 'lucide-react'

const noopSubscribe = () => () => {}
function useSpeechSupported() {
  return useSyncExternalStore(
    noopSubscribe,
    () => 'speechSynthesis' in window,
    () => false
  )
}

export function SpeakButton({
  text,
  lang,
  className,
}: {
  text: string
  lang?: string
  className?: string
}) {
  const [speaking, setSpeaking] = useState(false)
  const supported = useSpeechSupported()

  const handleSpeak = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang || 'en-US'
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [text, lang])

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  if (!supported) return null

  return (
    <button
      onClick={handleSpeak}
      className={
        className ||
        'p-2 rounded-lg text-ink-secondary hover:text-accent hover:bg-accent-subtle transition-colors'
      }
      title="Listen"
      aria-label={`Listen to ${text}`}
    >
      <Volume2
        size={18}
        className={speaking ? 'animate-pulse text-accent' : ''}
      />
    </button>
  )
}
