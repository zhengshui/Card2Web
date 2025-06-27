'use client'

import { useState, useCallback } from 'react'
import { exportService } from '@/services/export/exportService'
import type { GeneratedWebsite, BusinessCard } from '@/types'

export interface UseExportResult {
  isExporting: boolean
  error: string | null
  exportHTML: (website: GeneratedWebsite, companyName?: string) => Promise<void>
  exportZIP: (website: GeneratedWebsite, businessCard: Partial<BusinessCard>, companyName?: string) => Promise<void>
  exportPDF: (website: GeneratedWebsite, companyName?: string) => Promise<void>
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

  const getSupportedFormats = useCallback(() => {
    return exportService.getSupportedFormats()
  }, [])

  return {
    isExporting,
    error,
    exportHTML,
    exportZIP,
    exportPDF,
    getSupportedFormats
  }
}