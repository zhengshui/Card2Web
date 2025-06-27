'use client'

import { useState, useEffect } from 'react'
import CardUploader from '@/components/upload/CardUploader'
import { useOCR } from '@/hooks/useOCR'
import { useWebsiteGenerator } from '@/hooks/useWebsiteGenerator'
import WebsiteGenerationAnimation from '@/components/generation/WebsiteGenerationAnimation'
import WebsitePreview from '@/components/preview/WebsitePreview'
import ExportDialog from '@/components/export/ExportDialog'
import type { BusinessCard } from '@/types'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [step, setStep] = useState(1)
  const [selectedStyle, setSelectedStyle] = useState<'business' | 'tech' | 'minimal'>('business')
  const [showAnimation, setShowAnimation] = useState(false)
  const [editableCard, setEditableCard] = useState<Partial<BusinessCard> | null>(null)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const { isLoading, error, businessCard, processImage } = useOCR()
  const { 
    isGenerating, 
    error: generateError, 
    generatedWebsite, 
    generateWebsite 
  } = useWebsiteGenerator()

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file)
    setStep(2)
    await processImage(file)
    if (!error) {
      setStep(3)
    }
  }

  useEffect(() => {
    if (businessCard && !editableCard) {
      setEditableCard(businessCard)
    }
  }, [businessCard, editableCard])

  const handleGenerateWebsite = async () => {
    if (!editableCard) return
    
    const cardWithStyle = {
      ...editableCard,
      style: selectedStyle
    }
    
    setStep(4)
    setShowAnimation(false)
    await generateWebsite(cardWithStyle)
    
    // 网站生成完成后启动动画
    if (!generateError) {
      setShowAnimation(true)
    }
  }

  const handleAnimationComplete = () => {
    setShowAnimation(false)
    if (!generateError && generatedWebsite) {
      setStep(5)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-neutral-100 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* 顶部导航区域 */}
        <nav className="py-6 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V9a4 4 0 00-4-4z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-neutral-900">Card2Web</span>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-sm text-neutral-600">
              <span className="px-3 py-1 bg-success-50 text-success-700 rounded-full">AI 驱动</span>
              <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full">专业版</span>
            </div>
          </div>
        </nav>

        {/* 主内容区域 */}
        <div className="py-12 px-6">
          <div className="max-w-5xl mx-auto">
            {/* 页面标题区域 */}
            <div className="text-center mb-16 animate-fade-in">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-50 border border-primary-100 rounded-full text-primary-700 text-sm font-medium mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>AI 智能识别 · 一键生成</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-bold text-neutral-900 mb-6 text-balance">
                名片到<span className="text-gradient">企业官网</span>的
                <br />
                <span className="text-gradient">智能转换</span>
              </h1>
              <p className="text-xl md:text-2xl text-neutral-600 max-w-3xl mx-auto leading-relaxed text-balance">
                利用先进的 AI 视觉识别技术，将您的名片信息快速转换为专业、现代的企业官网。
                <br />
                <span className="text-primary-600 font-medium">简单上传，瞬间生成，立即可用。</span>
              </p>
            </div>

            {/* 主工作区域 */}
            <div className="card-elevated p-8 md:p-12 animate-slide-up">
              {step === 1 && (
                <div className="space-y-8">
                  {/* 步骤指示器 */}
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                        <span className="text-sm font-medium text-neutral-900">上传名片</span>
                      </div>
                      <div className="w-12 h-px bg-neutral-200"></div>
                      <div className="flex items-center space-x-2 opacity-40">
                        <div className="w-8 h-8 bg-neutral-200 text-neutral-500 rounded-full flex items-center justify-center text-sm font-medium">2</div>
                        <span className="text-sm font-medium text-neutral-500">识别信息</span>
                      </div>
                      <div className="w-12 h-px bg-neutral-200"></div>
                      <div className="flex items-center space-x-2 opacity-40">
                        <div className="w-8 h-8 bg-neutral-200 text-neutral-500 rounded-full flex items-center justify-center text-sm font-medium">3</div>
                        <span className="text-sm font-medium text-neutral-500">确认编辑</span>
                      </div>
                      <div className="w-12 h-px bg-neutral-200"></div>
                      <div className="flex items-center space-x-2 opacity-40">
                        <div className="w-8 h-8 bg-neutral-200 text-neutral-500 rounded-full flex items-center justify-center text-sm font-medium">4</div>
                        <span className="text-sm font-medium text-neutral-500">生成网站</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-neutral-900 mb-3">
                      上传您的名片
                    </h2>
                    <p className="text-neutral-600 text-lg mb-8">
                      支持多种格式，AI 将自动识别并提取关键信息
                    </p>
                  </div>

                  <CardUploader onFileSelect={handleFileSelect} />
                </div>
              )}

              {step === 2 && selectedFile && (
                <div className="space-y-8">
                  {/* 步骤指示器 */}
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 opacity-60">
                        <div className="w-8 h-8 bg-success-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-neutral-700">上传完成</span>
                      </div>
                      <div className="w-12 h-px bg-success-300"></div>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
                        <span className="text-sm font-medium text-neutral-900">识别信息</span>
                      </div>
                      <div className="w-12 h-px bg-neutral-200"></div>
                      <div className="flex items-center space-x-2 opacity-40">
                        <div className="w-8 h-8 bg-neutral-200 text-neutral-500 rounded-full flex items-center justify-center text-sm font-medium">3</div>
                        <span className="text-sm font-medium text-neutral-500">确认编辑</span>
                      </div>
                      <div className="w-12 h-px bg-neutral-200"></div>
                      <div className="flex items-center space-x-2 opacity-40">
                        <div className="w-8 h-8 bg-neutral-200 text-neutral-500 rounded-full flex items-center justify-center text-sm font-medium">4</div>
                        <span className="text-sm font-medium text-neutral-500">生成网站</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-neutral-900 mb-3">
                      智能识别中
                    </h2>
                    <p className="text-neutral-600 text-lg mb-8">
                      正在分析您的名片，提取关键信息
                    </p>
                  </div>

                  {/* 文件信息卡片 */}
                  <div className="card p-6 max-w-md mx-auto">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {isLoading && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-center">
                        <div className="loading-spinner w-8 h-8"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 bg-neutral-200 rounded-lg animate-pulse"></div>
                        <div className="h-4 bg-neutral-200 rounded-lg animate-pulse w-3/4 mx-auto"></div>
                        <div className="h-4 bg-neutral-200 rounded-lg animate-pulse w-1/2 mx-auto"></div>
                      </div>
                      <div className="text-center">
                        <p className="text-neutral-600 font-medium">
                          正在使用 AI 视觉模型 识别名片信息
                        </p>
                        <p className="text-sm text-neutral-500 mt-1">
                          预计需要 2-3 秒钟
                        </p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="card p-6 border-error-200 bg-error-50">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-error-100 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-error-900 mb-2">识别失败</h4>
                          <p className="text-error-700 text-sm">{error}</p>
                          <button 
                            onClick={() => {setStep(1); setSelectedFile(null)}}
                            className="btn-secondary mt-4 text-sm"
                          >
                            重新上传
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

          {step === 3 && editableCard && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                第三步：确认并编辑企业信息
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  📝 请检查并编辑以下信息，确保准确无误。您可以修改任何字段，或点击"重置为识别结果"恢复 AI 识别的原始信息。
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      公司名称
                    </label>
                    <input
                      type="text"
                      value={editableCard.companyName || ''}
                      onChange={(e) => setEditableCard({
                        ...editableCard,
                        companyName: e.target.value
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请输入公司名称"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      电话
                    </label>
                    <input
                      type="text"
                      value={editableCard.contacts?.phone || ''}
                      onChange={(e) => setEditableCard({
                        ...editableCard,
                        contacts: {
                          ...editableCard.contacts,
                          phone: e.target.value
                        }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请输入电话号码"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      邮箱
                    </label>
                    <input
                      type="email"
                      value={editableCard.contacts?.email || ''}
                      onChange={(e) => setEditableCard({
                        ...editableCard,
                        contacts: {
                          ...editableCard.contacts,
                          email: e.target.value
                        }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请输入邮箱地址"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      网址
                    </label>
                    <input
                      type="url"
                      value={editableCard.contacts?.website || ''}
                      onChange={(e) => setEditableCard({
                        ...editableCard,
                        contacts: {
                          ...editableCard.contacts,
                          website: e.target.value
                        }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请输入网站地址"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      公司地址
                    </label>
                    <input
                      type="text"
                      value={editableCard.contacts?.address || ''}
                      onChange={(e) => setEditableCard({
                        ...editableCard,
                        contacts: {
                          ...editableCard.contacts,
                          address: e.target.value
                        }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请输入公司地址"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  {editableCard.logo && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        提取的 Logo
                      </label>
                      <div className="flex items-center justify-center w-24 h-24 border border-gray-300 rounded-lg bg-gray-50">
                        <img 
                          src={editableCard.logo} 
                          alt="提取的Logo" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                  {editableCard.primaryColor && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        提取的主色调
                      </label>
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-12 h-12 rounded-lg border border-gray-300"
                          style={{ backgroundColor: editableCard.primaryColor }}
                        ></div>
                        <input
                          type="text"
                          value={editableCard.primaryColor}
                          onChange={(e) => setEditableCard({
                            ...editableCard,
                            primaryColor: e.target.value
                          })}
                          className="font-mono text-sm text-gray-600 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      网站风格
                    </label>
                    <select 
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      value={selectedStyle}
                      onChange={(e) => setSelectedStyle(e.target.value as 'business' | 'tech' | 'minimal')}
                    >
                      <option value="business">商务风格</option>
                      <option value="tech">科技风格</option>
                      <option value="minimal">简约风格</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setEditableCard(businessCard)}
                      className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      重置为识别结果
                    </button>
                    <button 
                      onClick={handleGenerateWebsite}
                      className="flex-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                      style={{ flex: 2 }}
                    >
                      生成企业官网
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                第四步：生成企业官网
              </h2>
              {showAnimation && generatedWebsite ? (
                <WebsiteGenerationAnimation
                  htmlContent={generatedWebsite.html}
                  isGenerating={isGenerating}
                  onAnimationComplete={handleAnimationComplete}
                />
              ) : (
                <div className="text-center">
                  {isGenerating && (
                    <div>
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 mb-4">
                        AI 正在生成您的企业官网...
                      </p>
                      <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-500">
                        这可能需要几秒钟时间，请耐心等待
                      </div>
                    </div>
                  )}
                  {generateError && (
                    <div className="text-red-600 p-4 bg-red-50 rounded">
                      生成失败: {generateError}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 5 && generatedWebsite && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                第五步：预览生成的网站
              </h2>
              <WebsitePreview
                htmlContent={generatedWebsite.html}
                title="您的企业官网"
                onEdit={() => setStep(3)}
                onRegenerate={handleGenerateWebsite}
                onExport={() => setShowExportDialog(true)}
              />
            </div>
          )}
            </div>
          </div>
        </div>

        {/* 页面底部信息 */}
        <div className="text-center py-12 mt-16">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* 特性展示 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">AI 智能识别</h3>
                <p className="text-neutral-600 text-sm">先进的视觉模型，准确提取名片信息</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V9a4 4 0 00-4-4z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">专业设计</h3>
                <p className="text-neutral-600 text-sm">现代化界面，多种风格模板可选</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">即时生成</h3>
                <p className="text-neutral-600 text-sm">一键导出，立即发布到互联网</p>
              </div>
            </div>

            {/* 分隔线 */}
            <div className="w-24 h-px bg-neutral-200 mx-auto"></div>

            {/* 版权信息 */}
            <div className="text-neutral-500 text-sm">
              <p>© 2024 Card2Web. 让每张名片都成为您的数字名片。</p>
            </div>
          </div>
        </div>
      </div>

      {/* 导出对话框 */}
      {generatedWebsite && editableCard && (
        <ExportDialog
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          website={generatedWebsite}
          businessCard={editableCard}
        />
      )}
    </main>
  )
}