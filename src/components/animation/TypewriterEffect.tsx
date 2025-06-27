'use client'

import { useState, useEffect, useRef } from 'react'

interface TypewriterEffectProps {
  content: string
  speed?: number
  onComplete?: () => void
  onSkip?: () => void
  className?: string
}

export default function TypewriterEffect({ 
  content, 
  speed = 30, 
  onComplete, 
  onSkip,
  className = '' 
}: TypewriterEffectProps) {
  const [displayedContent, setDisplayedContent] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isPaused] = useState(false)
  const [currentSpeed, setCurrentSpeed] = useState(speed)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLPreElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [displayedContent])

  useEffect(() => {
    if (currentIndex < content.length && !isPaused) {
      intervalRef.current = setTimeout(() => {
        setDisplayedContent(prev => prev + content[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, currentSpeed)
    } else if (currentIndex >= content.length && !isComplete) {
      setIsComplete(true)
      onComplete?.()
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current)
      }
    }
  }, [currentIndex, content, currentSpeed, onComplete, isPaused, isComplete])

  const handleSkip = () => {
    setDisplayedContent(content)
    setCurrentIndex(content.length)
    setIsComplete(true)
    onSkip?.()
    onComplete?.()
  }

  const handleSpeedUp = () => {
    // 切换到快速模式
    setCurrentSpeed(prev => prev > 5 ? Math.max(prev - 10, 1) : 1)
  }

  const handleSlowDown = () => {
    // 切换到慢速模式
    setCurrentSpeed(prev => Math.min(prev + 10, 100))
  }

  return (
    <div className={`relative ${className}`}>
      {/* 代码编辑器样式的容器 */}
      <div className="card-elevated overflow-hidden">
        {/* 编辑器标题栏 */}
        <div className="bg-neutral-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-error-500 rounded-full"></div>
              <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
              <div className="w-3 h-3 bg-success-500 rounded-full"></div>
            </div>
            <span className="text-neutral-300 text-sm font-medium">website.html</span>
            <div className="flex items-center space-x-2 text-xs text-neutral-400">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
              <span>AI 正在编写代码</span>
            </div>
          </div>
          
          {/* 控制按钮 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSlowDown}
              className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 text-xs rounded transition-colors"
              disabled={isComplete}
              title="减慢速度"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleSpeedUp}
              className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 text-xs rounded transition-colors"
              disabled={isComplete}
              title="加快速度"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={handleSkip}
              className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-xs rounded transition-colors"
              disabled={isComplete}
            >
              跳过动画
            </button>
          </div>
        </div>
        
        {/* 代码内容区域 */}
        <div 
          ref={scrollContainerRef}
          className="bg-neutral-900 text-neutral-100 font-mono text-sm p-6 overflow-auto"
          style={{ height: 'calc(100% - 60px)' }}
        >
          <pre 
            ref={contentRef}
            className="whitespace-pre-wrap break-words leading-relaxed"
          >
            {displayedContent}
            {!isComplete && (
              <span className="animate-pulse bg-primary-400 text-primary-400 ml-1">▌</span>
            )}
          </pre>
        </div>
      </div>
      
      {/* 进度条和状态 */}
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-neutral-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>
              {isComplete ? '代码生成完成！' : `AI 正在编写代码... ${Math.round((currentIndex / content.length) * 100)}%`}
            </span>
          </div>
          <div className="text-xs text-neutral-500">
            {currentIndex} / {content.length} 字符
          </div>
        </div>
        
        <div className="bg-neutral-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-primary-500 h-2 rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${(currentIndex / content.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}