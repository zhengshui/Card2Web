'use client'

import { useState, useCallback } from 'react'
import { exportService } from '@/services/export/exportService'
import { vercelService } from '@/services/vercel/vercelService'
import type { GeneratedWebsite, BusinessCard } from '@/types'
import type { VercelDeploymentResponse, VercelAuthStatus } from '@/services/vercel/vercelService'

export interface UseExportResult {
  isExporting: boolean
  error: string | null
  exportHTML: (website: GeneratedWebsite, companyName?: string) => Promise<void>
  exportZIP: (website: GeneratedWebsite, businessCard: Partial<BusinessCard>, companyName?: string) => Promise<void>
  exportPDF: (website: GeneratedWebsite, companyName?: string) => Promise<void>
  publishToVercel: (website: GeneratedWebsite, businessCard: Partial<BusinessCard>, projectName?: string) => Promise<VercelDeploymentResponse>
  validateVercelToken: (token?: string) => Promise<VercelAuthStatus>
  setVercelToken: (token: string) => void
  clearVercelAuth: () => void
  getSupportedFormats: () => Array<{ value: string; label: string; description: string }>
}

export function useExport(): UseExportResult {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportHTML = useCallback(async (
    website: GeneratedWebsite, 
    companyName: string = 'website'
  ) => {
    setIsExporting(true)
    setError(null)

    try {
      await exportService.exportHTML(website, companyName)
    } catch (err) {
      setError(err instanceof Error ? err.message : '导出失败')
    } finally {
      setIsExporting(false)
    }
  }, [])

  const exportZIP = useCallback(async (
    website: GeneratedWebsite,
    businessCard: Partial<BusinessCard>,
    companyName: string = 'website'
  ) => {
    setIsExporting(true)
    setError(null)

    try {
      await exportService.exportZIP(website, businessCard, companyName)
    } catch (err) {
      setError(err instanceof Error ? err.message : '导出失败')
    } finally {
      setIsExporting(false)
    }
  }, [])

  const exportPDF = useCallback(async (
    website: GeneratedWebsite,
    companyName: string = 'website'
  ) => {
    setIsExporting(true)
    setError(null)

    try {
      await exportService.exportPDF(website, companyName)
    } catch (err) {
      setError(err instanceof Error ? err.message : '导出失败')
    } finally {
      setIsExporting(false)
    }
  }, [])

  const publishToVercel = useCallback(async (
    website: GeneratedWebsite,
    businessCard: Partial<BusinessCard>,
    projectName?: string
  ): Promise<VercelDeploymentResponse> => {
    setIsExporting(true)
    setError(null)

    try {
      const deployment = await vercelService.deployWebsite(website, businessCard, projectName)
      return deployment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '发布到 Vercel 失败'
      setError(errorMessage)
      throw err
    } finally {
      setIsExporting(false)
    }
  }, [])

  const validateVercelToken = useCallback(async (token?: string): Promise<VercelAuthStatus> => {
    try {
      return await vercelService.validateToken(token)
    } catch (err) {
      console.error('Token validation error:', err)
      return { isAuthenticated: false }
    }
  }, [])

  const setVercelToken = useCallback((token: string) => {
    vercelService.setToken(token)
  }, [])

  const clearVercelAuth = useCallback(() => {
    vercelService.clearAuth()
  }, [])

  const getSupportedFormats = useCallback(() => {
    const formats = exportService.getSupportedFormats()
    
    // 添加 Vercel 发布选项
    formats.push({
      value: 'vercel',
      label: 'Vercel 发布',
      description: '一键发布到 Vercel 并获得在线网址'
    })
    
    return formats
  }, [])

  return {
    isExporting,
    error,
    exportHTML,
    exportZIP,
    exportPDF,
    publishToVercel,
    validateVercelToken,
    setVercelToken,
    clearVercelAuth,
    getSupportedFormats
  }
}