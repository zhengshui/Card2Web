'use client'

import { useState, useEffect } from 'react'
import { useExport } from '@/hooks/useExport'
import type { GeneratedWebsite, BusinessCard } from '@/types'
import type { VercelDeploymentResponse } from '@/services/vercel/vercelService'

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  website: GeneratedWebsite
  businessCard: Partial<BusinessCard>
}

export default function ExportDialog({ 
  isOpen, 
  onClose, 
  website, 
  businessCard 
}: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState('zip')
  const [vercelToken, setVercelToken] = useState('')
  const [showTokenInput, setShowTokenInput] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [deploymentResult, setDeploymentResult] = useState<VercelDeploymentResponse | null>(null)
  const [isCheckingToken, setIsCheckingToken] = useState(false)
  
  const { 
    isExporting, 
    error, 
    exportHTML, 
    exportZIP, 
    exportPDF, 
    publishToVercel,
    validateVercelToken,
    setVercelToken: saveVercelToken,
    clearVercelAuth,
    getSupportedFormats 
  } = useExport()

  const formats = getSupportedFormats()
  const companyName = businessCard.companyName || 'website'

  // 检查 Vercel token 状态
  useEffect(() => {
    if (selectedFormat === 'vercel') {
      checkTokenStatus()
    }
  }, [selectedFormat])

  const checkTokenStatus = async () => {
    setIsCheckingToken(true)
    try {
      const status = await validateVercelToken()
      setIsTokenValid(status.isAuthenticated)
      setShowTokenInput(!status.isAuthenticated)
    } catch (error) {
      setIsTokenValid(false)
      setShowTokenInput(true)
    } finally {
      setIsCheckingToken(false)
    }
  }

  const handleTokenValidation = async () => {
    if (!vercelToken.trim()) return
    
    setIsCheckingToken(true)
    try {
      const status = await validateVercelToken(vercelToken)
      if (status.isAuthenticated) {
        saveVercelToken(vercelToken)
        setIsTokenValid(true)
        setShowTokenInput(false)
      } else {
        setIsTokenValid(false)
        alert('Token 验证失败，请检查是否正确')
      }
    } catch (error) {
      setIsTokenValid(false)
      alert('Token 验证失败，请检查网络连接')
    } finally {
      setIsCheckingToken(false)
    }
  }

  const handleExport = async () => {
    try {
      switch (selectedFormat) {
        case 'html':
          await exportHTML(website, companyName)
          break
        case 'zip':
          await exportZIP(website, businessCard, companyName)
          break
        case 'pdf':
          await exportPDF(website, companyName)
          break
        case 'vercel':
          if (!isTokenValid) {
            alert('请先设置有效的 Vercel 访问令牌')
            return
          }
          const deployment = await publishToVercel(website, businessCard, companyName)
          setDeploymentResult(deployment)
          break
        default:
          throw new Error('不支持的导出格式')
      }
      
      if (!error && selectedFormat !== 'vercel') {
        onClose()
      }
    } catch (err) {
      console.error('导出失败:', err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              导出网站
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择导出格式
            </label>
            <div className="space-y-3">
              {formats.map((format) => (
                <label key={format.value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="exportFormat"
                    value={format.value}
                    checked={selectedFormat === format.value}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {format.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {selectedFormat === 'zip' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="text-sm text-blue-800">
                <strong>推荐格式！</strong> ZIP 包包含完整的网站文件，可直接部署到任何网站托管平台。
              </div>
            </div>
          )}

          {selectedFormat === 'vercel' && (
            <div className="space-y-4 mb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-sm text-green-800">
                  <strong>一键发布！</strong> 将网站直接发布到 Vercel 并获得在线访问地址。
                </div>
              </div>
              
              {showTokenInput && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    设置 Vercel 访问令牌
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    请前往 <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Vercel 设置页面</a> 创建新的访问令牌
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="password"
                      value={vercelToken}
                      onChange={(e) => setVercelToken(e.target.value)}
                      placeholder="输入您的 Vercel 访问令牌"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={handleTokenValidation}
                      disabled={isCheckingToken || !vercelToken.trim()}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCheckingToken ? '验证中...' : '验证'}
                    </button>
                  </div>
                </div>
              )}
              
              {isTokenValid && !showTokenInput && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-green-800">
                      ✅ Vercel 令牌已设置并验证
                    </div>
                    <button
                      onClick={() => {
                        clearVercelAuth()
                        setIsTokenValid(false)
                        setShowTokenInput(true)
                      }}
                      className="text-xs text-green-600 hover:text-green-800 underline"
                    >
                      更换令牌
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!deploymentResult && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="text-sm text-gray-600">
                <strong>导出预览：</strong>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {selectedFormat === 'vercel' 
                  ? `项目名：${companyName.toLowerCase()}-website` 
                  : `文件名：${companyName}-${selectedFormat === 'zip' ? 'website.zip' : selectedFormat === 'pdf' ? 'website.pdf' : 'website.html'}`
                }
              </div>
            </div>
          )}

          {deploymentResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="text-sm font-medium text-green-800 mb-2">
                🎉 网站发布成功！
              </div>
              <div className="text-sm text-green-700 mb-3">
                您的网站已成功发布到 Vercel，可以通过以下地址访问：
              </div>
              <div className="bg-white border border-green-200 rounded p-2 mb-3">
                <div className="text-sm font-mono text-green-800">
                  https://{deploymentResult.url}
                </div>
              </div>
              <div className="flex space-x-2">
                <a
                  href={`https://${deploymentResult.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  访问网站
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://${deploymentResult.url}`)
                    alert('网址已复制到剪贴板')
                  }}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                >
                  复制网址
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="text-sm text-red-800">
                导出失败：{error}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
          >
            {deploymentResult ? '完成' : '取消'}
          </button>
          {!deploymentResult && (
            <button
              onClick={handleExport}
              disabled={isExporting || (selectedFormat === 'vercel' && !isTokenValid)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
            >
              {isExporting && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isExporting 
                ? (selectedFormat === 'vercel' ? '发布中...' : '导出中...') 
                : (selectedFormat === 'vercel' ? '发布到 Vercel' : '开始导出')
              }
            </button>
          )}
        </div>
      </div>
    </div>
  )
}