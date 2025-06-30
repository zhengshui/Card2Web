'use client'

import { useState, useEffect } from 'react'
import TypewriterEffect from '@/components/animation/TypewriterEffect'

interface WebsiteGenerationAnimationProps {
  htmlContent: string
  streamingContent?: string
  isGenerating: boolean
  onAnimationComplete: () => void
}

export default function WebsiteGenerationAnimation({
  htmlContent,
  streamingContent,
  isGenerating,
  onAnimationComplete
}: WebsiteGenerationAnimationProps) {
  const [currentPhase, setCurrentPhase] = useState<'generating' | 'typing' | 'complete'>('generating')
  const [displayHtml, setDisplayHtml] = useState('')

  useEffect(() => {
    if (streamingContent && currentPhase === 'generating') {
      setCurrentPhase('typing')
    } else if (!isGenerating && htmlContent && currentPhase === 'generating') {
      setCurrentPhase('typing')
    }
  }, [isGenerating, htmlContent, streamingContent, currentPhase])

  useEffect(() => {
    if (streamingContent && currentPhase === 'typing') {
      setDisplayHtml(streamingContent)
    }
  }, [streamingContent, currentPhase])

  const handleTypingComplete = () => {
    setCurrentPhase('complete')
    setDisplayHtml(htmlContent)
    onAnimationComplete()
  }

  const handleSkip = () => {
    setCurrentPhase('complete')
    setDisplayHtml(htmlContent)
    onAnimationComplete()
  }

  if (currentPhase === 'generating') {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          AI 正在分析您的名片信息
        </h3>
        <div className="max-w-md mx-auto space-y-2 text-sm text-gray-600">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full"></div>
            <span>分析企业风格和色彩搭配</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full" style={{ animationDelay: '0.5s' }}></div>
            <span>设计页面布局和结构</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full" style={{ animationDelay: '1s' }}></div>
            <span>生成响应式 HTML 和 CSS</span>
          </div>
        </div>
      </div>
    )
  }

  if (currentPhase === 'typing') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            AI 正在编写您的网站代码
          </h3>
          <p className="text-gray-600">
            您可以观看代码生成过程，或点击"跳过"直接查看结果
          </p>
        </div>
        
        <div className="space-y-6">
          {/* 代码输出区域 - 优先级提升，占据主要空间 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-semibold text-neutral-900">AI 正在编写您的网站代码</h4>
              <div className="flex items-center space-x-2 text-sm text-neutral-600">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                <span>实时生成中</span>
              </div>
            </div>
            <TypewriterEffect
              content={streamingContent || htmlContent}
              speed={streamingContent ? 0 : 15} // 流式显示时不需要打字机效果
              onComplete={handleTypingComplete}
              onSkip={handleSkip}
              className="h-[600px]" // 固定高度600px，更大的显示区域
              realTime={!!streamingContent} // 实时显示模式
            />
          </div>
          
          {/* 实时预览 - 作为辅助展示 */}
          <div>
            <h4 className="text-lg font-medium text-neutral-700 mb-3 flex items-center space-x-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>实时预览</span>
            </h4>
            <div className="card overflow-hidden h-80">
              <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-100 flex items-center space-x-2">
                <div className="w-3 h-3 bg-error-500 rounded-full"></div>
                <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                <span className="text-sm text-neutral-600 ml-2">网站预览</span>
              </div>
              <iframe
                srcDoc={displayHtml}
                className="w-full h-full border-0"
                title="实时预览"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentPhase === 'complete') {
    return (
      <div className="text-center py-8">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            网站生成完成！
          </h3>
          <p className="text-gray-600">
            您的企业官网已成功生成，请查看下方预览
          </p>
        </div>
        
        <div className="bg-white border rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-3 border-b flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 ml-2">您的企业官网</span>
            </div>
            <div className="text-xs text-gray-500">
              生成时间: {new Date().toLocaleTimeString()}
            </div>
          </div>
          <iframe
            srcDoc={htmlContent}
            className="w-full border-0"
            style={{ height: '500px' }}
            title="生成的网站"
          />
        </div>
      </div>
    )
  }

  return null
}