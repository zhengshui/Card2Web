'use client'

import { useState, useCallback } from 'react'
import { ocrService } from '@/services/ocr/ocrService'
import { visionService } from '@/services/ai/visionService'
import type { BusinessCard } from '@/types'

export interface UseOCRResult {
  isLoading: boolean
  error: string | null
  businessCard: Partial<BusinessCard> | null
  processImage: (file: File, useAI?: boolean) => Promise<void>
  reset: () => void
  mode: 'ocr' | 'ai-vision'
  setMode: (mode: 'ocr' | 'ai-vision') => void
}

export function useOCR(): UseOCRResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [businessCard, setBusinessCard] = useState<Partial<BusinessCard> | null>(null)
  const [mode, setMode] = useState<'ocr' | 'ai-vision'>('ai-vision') // 默认使用AI Vision

  const processImage = useCallback(async (file: File, useAI?: boolean) => {
    setIsLoading(true)
    setError(null)
    setBusinessCard(null)

    const shouldUseAI = useAI !== undefined ? useAI : mode === 'ai-vision'

    try {
      let parsedCard: Partial<BusinessCard>

      if (shouldUseAI) {
        // 使用AI Vision识别
        console.log('使用AI Vision识别名片...')
        parsedCard = await visionService.extractBusinessCardInfo(file)
      } else {
        // 使用传统OCR识别
        console.log('使用OCR识别名片...')
        const ocrResults = await ocrService.extractText(file)
        parsedCard = await ocrService.parseBusinessCard(ocrResults, file)
      }

      setBusinessCard(parsedCard)
    } catch (err) {
      console.error('名片识别失败:', err)
      
      // 如果AI Vision失败，尝试使用OCR作为后备方案
      if (shouldUseAI && mode === 'ai-vision') {
        console.log('AI Vision失败，尝试使用OCR作为后备...')
        try {
          const ocrResults = await ocrService.extractText(file)
          const parsedCard = await ocrService.parseBusinessCard(ocrResults, file)
          setBusinessCard(parsedCard)
          setError('AI识别失败，已使用OCR备选方案')
          return
        } catch (ocrErr) {
          console.error('OCR后备方案也失败:', ocrErr)
        }
      }
      
      setError(err instanceof Error ? err.message : '处理失败')
    } finally {
      setIsLoading(false)
    }
  }, [mode])

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
    mode,
    setMode
  }
}