'use client'

import { useState } from 'react'

interface WebsitePreviewProps {
  htmlContent: string
  title?: string
  onEdit?: () => void
  onRegenerate?: () => void
  onExport?: () => void
}

type ViewMode = 'desktop' | 'tablet' | 'mobile'

export default function WebsitePreview({ 
  htmlContent, 
  title = "生成的网站",
  onEdit,
  onRegenerate,
  onExport
}: WebsitePreviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('desktop')
  const [showCode, setShowCode] = useState(false)

  const getPreviewSize = () => {
    switch (viewMode) {
      case 'mobile':
        return { width: '375px', height: '667px' }
      case 'tablet':
        return { width: '768px', height: '1024px' }
      case 'desktop':
      default:
        return { width: '100%', height: '600px' }
    }
  }

  return (
    <div className="space-y-6">
      {/* 控制栏 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          
          {/* 视图模式切换 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('desktop')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'desktop' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              桌面
            </button>
            <button
              onClick={() => setViewMode('tablet')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'tablet' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
              </svg>
              平板
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'mobile' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              手机
            </button>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowCode(!showCode)}
            className="px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            {showCode ? '隐藏代码' : '查看代码'}
          </button>
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              编辑内容
            </button>
          )}
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="px-3 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              重新生成
            </button>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              导出网站
            </button>
          )}
        </div>
      </div>

      {/* 预览区域 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* 浏览器地址栏模拟 */}
        <div className="bg-gray-100 px-4 py-3 border-b flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="flex-1 bg-white rounded px-3 py-1 text-sm text-gray-600 border">
            https://your-company.com
          </div>
          <div className="text-xs text-gray-500">
            {viewMode} 视图
          </div>
        </div>

        {/* 预览内容 */}
        <div className="p-4 bg-gray-50 flex justify-center">
          <div 
            className="bg-white shadow-lg rounded overflow-hidden transition-all duration-300"
            style={{
              ...getPreviewSize(),
              maxWidth: '100%'
            }}
          >
            <iframe
              srcDoc={htmlContent}
              className="w-full h-full border-0"
              title="网站预览"
              style={{ minHeight: '400px' }}
            />
          </div>
        </div>
      </div>

      {/* 代码查看 */}
      {showCode && (
        <div className="bg-gray-900 text-gray-100 rounded-lg overflow-hidden">
          <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
            <span className="text-sm font-medium">HTML 源代码</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(htmlContent)
                alert('代码已复制到剪贴板')
              }}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
            >
              复制代码
            </button>
          </div>
          <pre className="p-4 text-sm overflow-auto max-h-96">
            <code 
              dangerouslySetInnerHTML={{ __html: htmlContent.replace(/</g, '&lt;').replace(/>/g, '&gt;') }}
            />
          </pre>
        </div>
      )}
    </div>
  )
}