'use client'

import { useState, useRef } from 'react'

interface CardUploaderProps {
  onFileSelect: (file: File) => void
}

export default function CardUploader({ onFileSelect }: CardUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const files = e.target.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    
    onFileSelect(file)
  }

  const onButtonClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 group ${
          dragActive
            ? 'border-primary-500 bg-primary-50 shadow-2xl scale-[1.02]'
            : 'border-neutral-200 hover:border-primary-300 hover:bg-primary-50/30 hover:shadow-xl'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
        />
        
        {preview ? (
          <div className="space-y-6 animate-scale-in">
            <div className="relative">
              <img
                src={preview}
                alt="名片预览"
                className="max-w-full h-64 object-contain mx-auto rounded-2xl shadow-lg border border-neutral-100"
              />
              <div className="absolute top-3 right-3 bg-success-500 text-white rounded-full p-2 shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-lg font-semibold text-neutral-900 mb-2">
                名片上传成功
              </p>
              <p className="text-neutral-600 text-sm mb-4">
                点击此区域可重新选择图片
              </p>
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-neutral-100 rounded-full text-neutral-700 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>重新选择</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 上传图标 */}
            <div className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              dragActive 
                ? 'bg-primary-100 scale-110' 
                : 'bg-neutral-100 group-hover:bg-primary-100 group-hover:scale-105'
            }`}>
              <svg className={`w-10 h-10 transition-colors duration-300 ${
                dragActive 
                  ? 'text-primary-600' 
                  : 'text-neutral-400 group-hover:text-primary-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>

            {/* 上传文案 */}
            <div className="space-y-3">
              <h3 className={`text-2xl font-bold transition-colors duration-300 ${
                dragActive 
                  ? 'text-primary-900' 
                  : 'text-neutral-900 group-hover:text-primary-900'
              }`}>
                {dragActive ? '松开鼠标上传' : '上传您的名片'}
              </h3>
              <p className={`text-neutral-600 transition-colors duration-300 ${
                dragActive ? 'text-primary-700' : 'group-hover:text-primary-700'
              }`}>
                {dragActive 
                  ? '即将开始智能识别...' 
                  : '拖拽图片到此区域，或点击选择文件'
                }
              </p>
            </div>

            {/* 支持格式 */}
            <div className="flex items-center justify-center space-x-6 text-sm text-neutral-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                <span>JPG</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                <span>PNG</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                <span>最大 10MB</span>
              </div>
            </div>

            {/* 上传按钮 */}
            <div className="pt-4">
              <div className={`inline-flex items-center space-x-2 px-6 py-3 rounded-xl border-2 font-medium transition-all duration-300 ${
                dragActive
                  ? 'border-primary-500 bg-primary-500 text-white shadow-lg'
                  : 'border-primary-500 text-primary-600 bg-white hover:bg-primary-500 hover:text-gray-500 hover:shadow-lg'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>选择文件</span>
              </div>
            </div>
          </div>
        )}

        {/* 拖拽覆盖层 */}
        {dragActive && (
          <div className="absolute inset-0 rounded-3xl bg-primary-500/10 border-2 border-primary-500 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-500 rounded-2xl flex items-center justify-center animate-bounce">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-xl font-bold text-primary-900">松开上传</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}