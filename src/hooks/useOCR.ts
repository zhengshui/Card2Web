'use client'

import { useState, useCallback } from 'react'
import { visionService } from '@/services/ai/visionService'
import type { BusinessCard } from '@/types'

export interface UseOCRResult {
  isLoading: boolean
  error: string | null
  businessCard: Partial<BusinessCard> | null
  processImage: (file: File, useAI?: boolean) => Promise<void>
  reset: () => void
}

export function useOCR(): UseOCRResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [businessCard, setBusinessCard] = useState<Partial<BusinessCard> | null>(null)

  const processImage = useCallback(async (file: File, useAI?: boolean) => {
    setIsLoading(true)
    setError(null)
    setBusinessCard(null)

    try {
      let parsedCard: Partial<BusinessCard>
      parsedCard = await visionService.extractBusinessCardInfo(file)
      setBusinessCard(parsedCard)
    } catch (err) {
      console.error('名片识别失败:', err)
      setError(err instanceof Error ? err.message : '处理失败')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
    setBusinessCard(null)
  }, [])

  return {
    isLoading,
    error,
    businessCard,
    processImage,
    reset,
  }
}