import ColorThief from 'colorthief'

export class ColorService {
  private colorThief: ColorThief

  constructor() {
    this.colorThief = new ColorThief()
  }

  /**
   * 从图片文件中提取主色调
   */
  async extractPrimaryColor(imageFile: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(imageFile)
      
      img.onload = () => {
        try {
          const dominantColor = this.colorThief.getColor(img)
          const hexColor = this.rgbToHex(dominantColor[0], dominantColor[1], dominantColor[2])
          URL.revokeObjectURL(url)
          resolve(hexColor)
        } catch (error) {
          URL.revokeObjectURL(url)
          reject(new Error('颜色提取失败'))
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
   * 从图片文件中提取调色板
   */
  async extractColorPalette(imageFile: File, colorCount: number = 5): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(imageFile)
      
      img.onload = () => {
        try {
          const palette = this.colorThief.getPalette(img, colorCount)
          const hexPalette = palette.map(color => 
            this.rgbToHex(color[0], color[1], color[2])
          )
          URL.revokeObjectURL(url)
          resolve(hexPalette)
        } catch (error) {
          URL.revokeObjectURL(url)
          reject(new Error('调色板提取失败'))
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
   * RGB 转 HEX
   */
  private rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  /**
   * 判断颜色是否为深色
   */
  isDarkColor(hexColor: string): boolean {
    const rgb = this.hexToRgb(hexColor)
    if (!rgb) return false
    
    // 使用亮度公式判断
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
    return brightness < 128
  }

  /**
   * HEX 转 RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  /**
   * 生成颜色的浅色版本（用于背景）
   */
  getLighterColor(hexColor: string, opacity: number = 0.1): string {
    const rgb = this.hexToRgb(hexColor)
    if (!rgb) return hexColor
    
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
  }
}

export const colorService = new ColorService()