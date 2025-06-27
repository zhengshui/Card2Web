'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseTypewriterOptions {
  speed?: number
  startDelay?: number
}

export function useTypewriter(text: string, options: UseTypewriterOptions = {}) {
  const { speed = 30, startDelay = 0 } = options
  
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isStarted, setIsStarted] = useState(false)

  const start = useCallback(() => {
    setIsStarted(true)
    setCurrentIndex(0)
    setDisplayedText('')
    setIsComplete(false)
  }, [])

  const skip = useCallback(() => {
    setDisplayedText(text)
    setCurrentIndex(text.length)
    setIsComplete(true)
  }, [text])

  const reset = useCallback(() => {
    setIsStarted(false)
    setCurrentIndex(0)
    setDisplayedText('')
    setIsComplete(false)
  }, [])

  useEffect(() => {
    if (!isStarted || isComplete || currentIndex >= text.length) {
      if (currentIndex >= text.length && !isComplete) {
        setIsComplete(true)
      }
      return
    }

    const timeout = setTimeout(() => {
      setDisplayedText(prev => prev + text[currentIndex])
      setCurrentIndex(prev => prev + 1)
    }, currentIndex === 0 ? startDelay : speed)

    return () => clearTimeout(timeout)
  }, [isStarted, currentIndex, text, speed, startDelay, isComplete])

  const progress = text.length > 0 ? (currentIndex / text.length) * 100 : 0

  return {
    displayedText,
    isComplete,
    isStarted,
    progress,
    start,
    skip,
    reset
  }
}