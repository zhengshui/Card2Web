export class LogoService {
  /**
   * 从名片图片中提取可能的 Logo 区域
   */
  async extractLogo(imageFile: File): Promise<string | null> {
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
          
          // 尝试多个可能的 Logo 区域
          const logoAreas = this.detectLogoAreas(canvas, ctx)
          
          if (logoAreas.length > 0) {
            // 选择最可能的 Logo 区域（通常是左上角或右上角的小区域）
            const bestLogo = this.selectBestLogo(logoAreas, canvas)
            const logoDataUrl = this.extractLogoRegion(canvas, ctx, bestLogo)
            URL.revokeObjectURL(url)
            resolve(logoDataUrl)
          } else {
            URL.revokeObjectURL(url)
            resolve(null)
          }
        } catch (error) {
          URL.revokeObjectURL(url)
          reject(new Error('Logo 提取失败'))
        }
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('图片加载失败'))
      }
      
      img.crossOrigin = 'anonymous'
      img.src = url
    })
  }

  /**
   * 检测可能的 Logo 区域
   */
  private detectLogoAreas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): LogoArea[] {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const areas: LogoArea[] = []
    
    // 定义可能的 Logo 区域（基于常见名片布局）
    const regions = [
      // 左上角
      { x: 0, y: 0, width: canvas.width * 0.3, height: canvas.height * 0.3 },
      // 右上角
      { x: canvas.width * 0.7, y: 0, width: canvas.width * 0.3, height: canvas.height * 0.3 },
      // 左下角
      { x: 0, y: canvas.height * 0.7, width: canvas.width * 0.3, height: canvas.height * 0.3 },
      // 右下角
      { x: canvas.width * 0.7, y: canvas.height * 0.7, width: canvas.width * 0.3, height: canvas.height * 0.3 }
    ]
    
    regions.forEach((region, index) => {
      const complexity = this.calculateRegionComplexity(imageData, region, canvas.width)
      const contrast = this.calculateRegionContrast(imageData, region, canvas.width)
      
      // Logo 通常具有较高的对比度和适中的复杂度
      if (contrast > 50 && complexity > 10 && complexity < 100) {
        areas.push({
          ...region,
          complexity,
          contrast,
          score: contrast + (100 - Math.abs(50 - complexity)) // 综合评分
        })
      }
    })
    
    return areas.sort((a, b) => b.score - a.score)
  }

  /**
   * 计算区域复杂度（边缘检测）
   */
  private calculateRegionComplexity(imageData: ImageData, region: LogoRegion, imageWidth: number): number {
    let edgeCount = 0
    const threshold = 30
    
    for (let y = Math.floor(region.y); y < Math.floor(region.y + region.height - 1); y++) {
      for (let x = Math.floor(region.x); x < Math.floor(region.x + region.width - 1); x++) {
        const currentIndex = (y * imageWidth + x) * 4
        const rightIndex = (y * imageWidth + x + 1) * 4
        const bottomIndex = ((y + 1) * imageWidth + x) * 4
        
        if (currentIndex < imageData.data.length && rightIndex < imageData.data.length && bottomIndex < imageData.data.length) {
          const currentGray = this.getGrayValue(imageData.data, currentIndex)
          const rightGray = this.getGrayValue(imageData.data, rightIndex)
          const bottomGray = this.getGrayValue(imageData.data, bottomIndex)
          
          if (Math.abs(currentGray - rightGray) > threshold || Math.abs(currentGray - bottomGray) > threshold) {
            edgeCount++
          }
        }
      }
    }
    
    return edgeCount / ((region.width * region.height) / 100) // 归一化
  }

  /**
   * 计算区域对比度
   */
  private calculateRegionContrast(imageData: ImageData, region: LogoRegion, imageWidth: number): number {
    const values: number[] = []
    
    for (let y = Math.floor(region.y); y < Math.floor(region.y + region.height); y++) {
      for (let x = Math.floor(region.x); x < Math.floor(region.x + region.width); x++) {
        const index = (y * imageWidth + x) * 4
        if (index < imageData.data.length) {
          values.push(this.getGrayValue(imageData.data, index))
        }
      }
    }
    
    if (values.length === 0) return 0
    
    const min = Math.min(...values)
    const max = Math.max(...values)
    return max - min
  }

  /**
   * 获取灰度值
   */
  private getGrayValue(data: Uint8ClampedArray, index: number): number {
    return (data[index] + data[index + 1] + data[index + 2]) / 3
  }

  /**
   * 选择最佳 Logo 区域
   */
  private selectBestLogo(areas: LogoArea[], canvas: HTMLCanvasElement): LogoArea {
    // 优先选择左上角和右上角的区域
    const topAreas = areas.filter(area => area.y < canvas.height * 0.5)
    return topAreas.length > 0 ? topAreas[0] : areas[0]
  }

  /**
   * 提取 Logo 区域
   */
  private extractLogoRegion(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, area: LogoArea): string {
    const logoCanvas = document.createElement('canvas')
    const logoCtx = logoCanvas.getContext('2d')
    
    if (!logoCtx) throw new Error('Logo Canvas 上下文创建失败')
    
    logoCanvas.width = area.width
    logoCanvas.height = area.height
    
    logoCtx.drawImage(
      canvas,
      area.x, area.y, area.width, area.height,
      0, 0, area.width, area.height
    )
    
    return logoCanvas.toDataURL('image/png')
  }
}

interface LogoRegion {
  x: number
  y: number
  width: number
  height: number
}

interface LogoArea extends LogoRegion {
  complexity: number
  contrast: number
  score: number
}

export const logoService = new LogoService()