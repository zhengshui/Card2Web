'use client'

interface RecognitionModeToggleProps {
  mode: 'ocr' | 'ai-vision'
  onModeChange: (mode: 'ocr' | 'ai-vision') => void
  disabled?: boolean
}

export default function RecognitionModeToggle({ 
  mode, 
  onModeChange, 
  disabled = false 
}: RecognitionModeToggleProps) {
  return (
    <div className="card p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">选择识别方式</h3>
        <p className="text-neutral-600 text-sm">选择最适合您需求的识别技术</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AI Vision 选项 */}
        <button
          onClick={() => onModeChange('ai-vision')}
          disabled={disabled}
          className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${
            mode === 'ai-vision'
              ? 'border-primary-500 bg-primary-50/50 shadow-lg'
              : 'border-neutral-200 bg-white hover:border-primary-300 hover:shadow-md'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {/* 选中指示器 */}
          {mode === 'ai-vision' && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              mode === 'ai-vision' ? 'bg-primary-100' : 'bg-neutral-100 group-hover:bg-primary-100'
            }`}>
              <svg className={`w-6 h-6 transition-colors ${
                mode === 'ai-vision' ? 'text-primary-600' : 'text-neutral-600 group-hover:text-primary-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className={`font-semibold mb-2 transition-colors ${
                mode === 'ai-vision' ? 'text-primary-900' : 'text-neutral-900 group-hover:text-primary-900'
              }`}>
                AI 智能识别
              </h4>
              <p className={`text-sm mb-3 transition-colors ${
                mode === 'ai-vision' ? 'text-primary-700' : 'text-neutral-600 group-hover:text-primary-700'
              }`}>
                采用最新 OpenAI 视觉模型，识别更快更准确
              </p>
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                  <span className={mode === 'ai-vision' ? 'text-primary-700' : 'text-neutral-500'}>
                    准确率 95%+
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                  <span className={mode === 'ai-vision' ? 'text-primary-700' : 'text-neutral-500'}>
                    2-3 秒
                  </span>
                </div>
              </div>
            </div>
          </div>
        </button>

        {/* OCR 选项 */}
        <button
          onClick={() => onModeChange('ocr')}
          disabled={disabled}
          className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${
            mode === 'ocr'
              ? 'border-primary-500 bg-primary-50/50 shadow-lg'
              : 'border-neutral-200 bg-white hover:border-primary-300 hover:shadow-md'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {/* 选中指示器 */}
          {mode === 'ocr' && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              mode === 'ocr' ? 'bg-primary-100' : 'bg-neutral-100 group-hover:bg-primary-100'
            }`}>
              <svg className={`w-6 h-6 transition-colors ${
                mode === 'ocr' ? 'text-primary-600' : 'text-neutral-600 group-hover:text-primary-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className={`font-semibold mb-2 transition-colors ${
                mode === 'ocr' ? 'text-primary-900' : 'text-neutral-900 group-hover:text-primary-900'
              }`}>
                传统 OCR 识别
              </h4>
              <p className={`text-sm mb-3 transition-colors ${
                mode === 'ocr' ? 'text-primary-700' : 'text-neutral-600 group-hover:text-primary-700'
              }`}>
                使用经典 Tesseract 引擎，无需网络连接
              </p>
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                  <span className={mode === 'ocr' ? 'text-primary-700' : 'text-neutral-500'}>
                    准确率 70-80%
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
                  <span className={mode === 'ocr' ? 'text-primary-700' : 'text-neutral-500'}>
                    10-15 秒
                  </span>
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* 推荐标签 */}
      {mode === 'ai-vision' && (
        <div className="mt-4 flex items-center justify-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-success-50 border border-success-200 rounded-full text-success-700 text-xs font-medium">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>推荐选择</span>
          </div>
        </div>
      )}
    </div>
  )
}