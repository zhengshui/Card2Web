export class ImagePreprocessor {
  /**
   * 预处理图像以提高 OCR 识别准确度
   */
  async preprocessImage(imageFile: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Canvas 上下文创建失败'))
        return
      }

      const url = URL.createObjectURL(imageFile)
      
      img.onload = () => {
        try {
          // 设置合适的画布尺寸
          const { width, height } = this.calculateOptimalSize(img.width, img.height)
          canvas.width = width
          canvas.height = height
          
          // 绘制原图
          ctx.drawImage(img, 0, 0, width, height)
          
          // 应用图像增强
          this.enhanceImage(ctx, width, height)
          
          // 转换为优化后的文件
          canvas.toBlob((blob) => {
            if (blob) {
              const enhancedFile = new File([blob], `enhanced_${imageFile.name}`, {
                type: 'image/png',
                lastModified: Date.now()
              })
              URL.revokeObjectURL(url)
              resolve(enhancedFile)
            } else {
              URL.revokeObjectURL(url)
              reject(new Error('图像处理失败'))
            }
          }, 'image/png', 0.95)
        } catch (error) {
          URL.revokeObjectURL(url)
          reject(new Error('图像预处理失败'))
        }
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('图像加载失败'))
      }
      
      img.crossOrigin = 'anonymous'
      img.src = url
    })
  }

  /**
   * 计算最佳图像尺寸
   */
  private calculateOptimalSize(originalWidth: number, originalHeight: number): { width: number; height: number } {
    const maxDimension = 2000
    const minDimension = 800
    
    let width = originalWidth
    let height = originalHeight
    
    // 如果图像太小，放大到最小尺寸
    if (Math.max(width, height) < minDimension) {
      const scale = minDimension / Math.max(width, height)
      width *= scale
      height *= scale
    }
    
    // 如果图像太大，缩小到最大尺寸
    if (Math.max(width, height) > maxDimension) {
      const scale = maxDimension / Math.max(width, height)
      width *= scale
      height *= scale
    }
    
    return { width: Math.round(width), height: Math.round(height) }
  }

  /**
   * 图像增强处理
   */
  private enhanceImage(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    
    // 应用多种增强技术
    this.adjustBrightnessAndContrast(data)
    this.sharpenImage(data, width, height)
    this.reduceNoise(data, width, height)
    
    ctx.putImageData(imageData, 0, 0)
  }

  /**
   * 调整亮度和对比度
   */
  private adjustBrightnessAndContrast(data: Uint8ClampedArray): void {
    const brightness = 10  // 轻微提升亮度
    const contrast = 1.2   // 增强对比度
    
    for (let i = 0; i < data.length; i += 4) {
      // RGB 通道
      for (let j = 0; j < 3; j++) {
        let value = data[i + j]
        
        // 调整亮度
        value += brightness
        
        // 调整对比度
        value = ((value - 128) * contrast) + 128
        
        // 限制在 0-255 范围内
        data[i + j] = Math.max(0, Math.min(255, value))
      }
    }
  }

  /**
   * 图像锐化
   */
  private sharpenImage(data: Uint8ClampedArray, width: number, height: number): void {
    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ]
    
    this.applyConvolution(data, width, height, kernel, 1)
  }

  /**
   * 降噪处理
   */
  private reduceNoise(data: Uint8ClampedArray, width: number, height: number): void {
    // 应用轻微的高斯模糊来减少噪声
    const kernel = [
      1, 2, 1,
      2, 4, 2,
      1, 2, 1
    ]
    
    this.applyConvolution(data, width, height, kernel, 16)
  }

  /**
   * 应用卷积核
   */
  private applyConvolution(
    data: Uint8ClampedArray, 
    width: number, 
    height: number, 
    kernel: number[], 
    divisor: number
  ): void {
    const tempData = new Uint8ClampedArray(data)
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) { // RGB 通道
          let sum = 0
          
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const pixelIndex = ((y + ky) * width + (x + kx)) * 4 + c
              const kernelIndex = (ky + 1) * 3 + (kx + 1)
              sum += tempData[pixelIndex] * kernel[kernelIndex]
            }
          }
          
          const pixelIndex = (y * width + x) * 4 + c
          data[pixelIndex] = Math.max(0, Math.min(255, sum / divisor))
        }
      }
    }
  }

  /**
   * 自动旋转校正（检测并修正图像方向）
   */
  async autoRotateCorrection(imageFile: File): Promise<File> {
    // 简化实现：检测文本行的方向
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Canvas 上下文创建失败'))
        return
      }

      const url = URL.createObjectURL(imageFile)
      
      img.onload = () => {
        try {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          
          const rotation = this.detectRotation(ctx, img.width, img.height)
          
          if (rotation !== 0) {
            // 应用旋转
            const rotatedCanvas = this.rotateImage(canvas, rotation)
            rotatedCanvas.toBlob((blob) => {
              if (blob) {
                const rotatedFile = new File([blob], `rotated_${imageFile.name}`, {
                  type: 'image/png'
                })
                URL.revokeObjectURL(url)
                resolve(rotatedFile)
              } else {
                URL.revokeObjectURL(url)
                resolve(imageFile) // 如果旋转失败，返回原文件
              }
            }, 'image/png')
          } else {
            URL.revokeObjectURL(url)
            resolve(imageFile)
          }
        } catch (error) {
          URL.revokeObjectURL(url)
          resolve(imageFile) // 如果检测失败，返回原文件
        }
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve(imageFile) // 如果加载失败，返回原文件
      }
      
      img.src = url
    })
  }

  /**
   * 检测图像旋转角度
   */
  private detectRotation(ctx: CanvasRenderingContext2D, width: number, height: number): number {
    const imageData = ctx.getImageData(0, 0, width, height)
    
    // 简化的文本方向检测
    // 在实际应用中，这里可以使用更复杂的算法
    const edges = this.detectEdges(imageData.data, width, height)
    const horizontalLines = this.countHorizontalLines(edges, width, height)
    const verticalLines = this.countVerticalLines(edges, width, height)
    
    // 如果垂直线条明显多于水平线条，可能需要旋转90度
    if (verticalLines > horizontalLines * 1.5) {
      return 90
    }
    
    return 0 // 不需要旋转
  }

  /**
   * 边缘检测
   */
  private detectEdges(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    const edges = new Uint8ClampedArray(width * height)
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x
        const pixelIdx = idx * 4
        
        // 转换为灰度
        const gray = (data[pixelIdx] + data[pixelIdx + 1] + data[pixelIdx + 2]) / 3
        
        // 简单的边缘检测（Sobel 算子的简化版本）
        const gx = -data[(y * width + x - 1) * 4] + data[(y * width + x + 1) * 4]
        const gy = -data[((y - 1) * width + x) * 4] + data[((y + 1) * width + x) * 4]
        
        edges[idx] = Math.sqrt(gx * gx + gy * gy) > 50 ? 255 : 0
      }
    }
    
    return edges
  }

  /**
   * 统计水平线条
   */
  private countHorizontalLines(edges: Uint8ClampedArray, width: number, height: number): number {
    let count = 0
    for (let y = 0; y < height; y++) {
      let lineLength = 0
      for (let x = 0; x < width; x++) {
        if (edges[y * width + x] > 0) {
          lineLength++
        } else {
          if (lineLength > width * 0.3) count++ // 如果线条长度超过图像宽度的30%
          lineLength = 0
        }
      }
    }
    return count
  }

  /**
   * 统计垂直线条
   */
  private countVerticalLines(edges: Uint8ClampedArray, width: number, height: number): number {
    let count = 0
    for (let x = 0; x < width; x++) {
      let lineLength = 0
      for (let y = 0; y < height; y++) {
        if (edges[y * width + x] > 0) {
          lineLength++
        } else {
          if (lineLength > height * 0.3) count++ // 如果线条长度超过图像高度的30%
          lineLength = 0
        }
      }
    }
    return count
  }

  /**
   * 旋转图像
   */
  private rotateImage(canvas: HTMLCanvasElement, degrees: number): HTMLCanvasElement {
    const rotatedCanvas = document.createElement('canvas')
    const ctx = rotatedCanvas.getContext('2d')!
    
    const radians = degrees * Math.PI / 180
    
    if (degrees === 90 || degrees === 270) {
      rotatedCanvas.width = canvas.height
      rotatedCanvas.height = canvas.width
    } else {
      rotatedCanvas.width = canvas.width
      rotatedCanvas.height = canvas.height
    }
    
    ctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2)
    ctx.rotate(radians)
    ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2)
    
    return rotatedCanvas
  }
}

export const imagePreprocessor = new ImagePreprocessor()