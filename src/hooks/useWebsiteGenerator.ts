'use client'

import { useState, useCallback } from 'react'
import { websiteGenerator } from '@/services/ai/websiteGenerator'
import type { BusinessCard, GeneratedWebsite } from '@/types'

export interface UseWebsiteGeneratorResult {
  isGenerating: boolean
  error: string | null
  generatedWebsite: GeneratedWebsite | null
  generateWebsite: (businessCard: Partial<BusinessCard>) => Promise<void>
  reset: () => void
}

export function useWebsiteGenerator(): UseWebsiteGeneratorResult {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedWebsite, setGeneratedWebsite] = useState<GeneratedWebsite | null>(null)

  const generateWebsite = useCallback(async (businessCard: Partial<BusinessCard>) => {
    setIsGenerating(true)
    setError(null)
    setGeneratedWebsite(null)

    try {
      let website: GeneratedWebsite
      
      // 优先尝试使用 AI 生成
      try {
        website = await websiteGenerator.generateWebsite(businessCard)
      } catch (aiError) {
        console.warn('AI 生成失败，使用备用方案:', aiError)
        // 如果 AI 失败，使用备用模板
        website = websiteGenerator.generateFallbackWebsite(businessCard)
      }
      
      setGeneratedWebsite(website)
    } catch (err) {
      setError(err instanceof Error ? err.message : '网站生成失败')
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const reset = useCallback(() => {
    setIsGenerating(false)
    setError(null)
    setGeneratedWebsite(null)
  }, [])

  return {
    isGenerating,
    error,
    generatedWebsite,
    generateWebsite,
    reset
  }
}