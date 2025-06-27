import OpenAI from 'openai'
import type { BusinessCard } from '@/types'

export class VisionService {
  private openai: OpenAI | null = null

  private initializeOpenAI() {
    if (!this.openai) {
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY
      if (!apiKey) {
        throw new Error('OpenAI API key not found')
      }
      this.openai = new OpenAI({
        apiKey,
        baseURL: process.env.NEXT_PUBLIC_OPENAI_API_BASE_URL,
        dangerouslyAllowBrowser: true // 仅用于演示，生产环境应使用服务端
      })
    }
    return this.openai
  }

  /**
   * 使用AI Vision识别名片信息
   */
  async extractBusinessCardInfo(imageFile: File): Promise<Partial<BusinessCard>> {
    const openai = this.initializeOpenAI()
    
    try {
      // 将图片转换为base64
      const base64Image = await this.fileToBase64(imageFile)
      
      const completion = await openai.chat.completions.create({
        model: process.env.NEXT_PUBLIC_OPENAI_VISION_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: "system",
            content: `你是一个专业的名片识别专家。请仔细分析名片图片，提取所有可见的信息。

请按照以下JSON格式返回结果，确保所有字段都包含：
{
  "companyName": "公司名称",
  "contacts": {
    "phone": "电话号码",
    "email": "邮箱地址",
    "website": "网站地址",
    "address": "地址"
  },
  "primaryColor": "#颜色代码",
  "confidence": 0.95
}

注意事项：
1. 如果某个信息不存在或无法识别，请填写null
2. 电话号码请保持原始格式
3. 邮箱地址请转换为小写
4. 网站地址如果没有协议请添加http://
5. primaryColor请分析名片主要颜色，返回十六进制颜色代码
6. confidence表示整体识别的置信度(0-1之间)
7. 请只返回JSON，不要包含任何其他解释文字`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "请识别这张名片中的所有信息，包括公司名称、联系方式、地址等，并分析主色调。"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: "high"
                }
              }
            ]
          }
        ],
        temperature: 0.1, // 降低温度以获得更稳定的结果
        max_tokens: 1000
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('AI 响应为空')
      }

      // 解析JSON响应
      const result = this.parseVisionResponse(response)
      
      // 提取Logo（如果需要的话，可以从原图中提取）
      let logo: string | undefined
      try {
        const { logoService } = await import('@/services/logo/logoService')
        const extractedLogo = await logoService.extractLogo(imageFile)
        logo = extractedLogo || undefined
      } catch (error) {
        console.warn('Logo 提取失败:', error)
      }

      return {
        ...result,
        logo: logo || undefined
      }
    } catch (error) {
      console.error('AI Vision 识别失败:', error)
      throw new Error('AI Vision 识别失败，请检查图片质量或网络连接')
    }
  }

  /**
   * 将文件转换为base64
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // 移除data:image/xxx;base64,前缀
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * 解析AI Vision响应
   */
  private parseVisionResponse(response: string): Partial<BusinessCard> {
    try {
      // 尝试提取JSON部分
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? jsonMatch[0] : response
      
      const parsed = JSON.parse(jsonStr)
      
      // 验证和清洗数据
      return {
        companyName: this.cleanString(parsed.companyName) || '未识别的公司名称',
        contacts: {
          phone: this.cleanPhoneNumber(parsed.contacts?.phone),
          email: this.cleanEmail(parsed.contacts?.email),
          website: this.cleanWebsite(parsed.contacts?.website),
          address: this.cleanString(parsed.contacts?.address)
        },
        primaryColor: this.cleanColor(parsed.primaryColor) || '#2563eb'
      }
    } catch (error) {
      console.error('解析AI响应失败:', error)
      
      // 如果JSON解析失败，尝试从文本中提取信息
      return this.fallbackTextParsing(response)
    }
  }

  /**
   * 后备文本解析方法
   */
  private fallbackTextParsing(response: string): Partial<BusinessCard> {
    console.log('使用后备解析方法')
    
    // 简单的正则表达式提取
    const phoneMatch = response.match(/(?:电话|手机|TEL|Phone)[：:]\s*([^\n\r]+)/i)
    const emailMatch = response.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
    const websiteMatch = response.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/i)
    
    return {
      companyName: '未识别的公司名称',
      contacts: {
        phone: phoneMatch ? this.cleanPhoneNumber(phoneMatch[1]) : undefined,
        email: emailMatch ? this.cleanEmail(emailMatch[1]) : undefined,
        website: websiteMatch ? this.cleanWebsite(websiteMatch[1]) : undefined,
        address: undefined
      },
      primaryColor: '#2563eb'
    }
  }

  /**
   * 清理字符串
   */
  private cleanString(str: any): string | undefined {
    if (typeof str !== 'string' || !str || str.trim() === '' || str.toLowerCase() === 'null') {
      return undefined
    }
    return str.trim()
  }

  /**
   * 清理电话号码
   */
  private cleanPhoneNumber(phone: any): string | undefined {
    if (!phone || typeof phone !== 'string') return undefined
    
    const cleaned = phone.replace(/[-\s()]/g, '').trim()
    
    // 验证是否为有效的电话号码格式
    if (!/^\+?[\d]{7,15}$/.test(cleaned)) {
      return undefined
    }
    
    return cleaned
  }

  /**
   * 清理邮箱地址
   */
  private cleanEmail(email: any): string | undefined {
    if (!email || typeof email !== 'string') return undefined
    
    const cleaned = email.toLowerCase().trim()
    
    // 验证邮箱格式
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      return undefined
    }
    
    return cleaned
  }

  /**
   * 清理网站地址
   */
  private cleanWebsite(website: any): string | undefined {
    if (!website || typeof website !== 'string') return undefined
    
    let cleaned = website.trim().toLowerCase()
    
    // 如果没有协议，添加http://
    if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
      cleaned = 'http://' + cleaned
    }
    
    // 验证URL格式
    try {
      new URL(cleaned)
      return cleaned
    } catch {
      return undefined
    }
  }

  /**
   * 清理颜色代码
   */
  private cleanColor(color: any): string | undefined {
    if (!color || typeof color !== 'string') return undefined
    
    const cleaned = color.trim()
    
    // 验证十六进制颜色格式
    if (/^#[0-9A-Fa-f]{6}$/.test(cleaned)) {
      return cleaned
    }
    
    return undefined
  }

  /**
   * 批量处理多张名片
   */
  async extractMultipleCards(imageFiles: File[]): Promise<Partial<BusinessCard>[]> {
    const results = await Promise.allSettled(
      imageFiles.map(file => this.extractBusinessCardInfo(file))
    )
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        console.error(`名片 ${index + 1} 识别失败:`, result.reason)
        return {
          companyName: `名片 ${index + 1} 识别失败`,
          contacts: {},
          primaryColor: '#2563eb'
        }
      }
    })
  }
}

export const visionService = new VisionService()