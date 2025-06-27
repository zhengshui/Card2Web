import { createWorker } from 'tesseract.js'
import type { OCRResult, BusinessCard } from '@/types'
import { colorService } from '@/services/color/colorService'
import { logoService } from '@/services/logo/logoService'
import { imagePreprocessor } from '@/services/image/imagePreprocessor'

export class OCRService {
  private worker: Tesseract.Worker | null = null

  async initialize() {
    if (!this.worker) {
      this.worker = await createWorker('chi_sim+eng', 1, {
        workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/worker.min.js',
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        corePath: '/tesseract-core.wasm.js',
      })
    }
    return this.worker
  }

  async extractText(imageFile: File): Promise<OCRResult[]> {
    try {
      const worker = await this.initialize()
      
      // 图像预处理以提高识别准确度
      let processedFile = imageFile
      try {
        processedFile = await imagePreprocessor.preprocessImage(imageFile)
        console.log('图像预处理完成')
      } catch (preprocessError) {
        console.warn('图像预处理失败，使用原始图片:', preprocessError)
      }
      
      const { data } = await worker.recognize(processedFile)
      
      // 使用简化的结果格式，主要提取文本内容
      const results: OCRResult[] = [{
        text: data.text,
        confidence: data.confidence,
        boundingBox: { x: 0, y: 0, width: 0, height: 0 }
      }]

      return results
    } catch (error) {
      console.error('OCR识别失败:', error)
      throw new Error('OCR识别失败')
    }
  }

  async parseBusinessCard(ocrResults: OCRResult[], imageFile: File): Promise<Partial<BusinessCard>> {
    const allText = ocrResults.map(r => r.text).join('\n')
    
    // 使用增强的解析算法
    const contacts = this.extractContactInfo(allText)
    const companyName = this.extractCompanyName(allText)
    const address = this.extractAddress(allText)

    // 提取主色调
    let primaryColor: string | undefined
    try {
      primaryColor = await colorService.extractPrimaryColor(imageFile)
    } catch (error) {
      console.warn('颜色提取失败:', error)
    }

    // 提取 Logo
    let logo: string | undefined
    try {
      const extractedLogo = await logoService.extractLogo(imageFile)
      logo = extractedLogo || undefined
    } catch (error) {
      console.warn('Logo 提取失败:', error)
    }

    return {
      companyName: companyName || '未识别的公司名称',
      logo,
      primaryColor,
      contacts: {
        ...contacts,
        address
      }
    }
  }

  /**
   * 增强的联系信息提取
   */
  private extractContactInfo(text: string): { phone?: string; email?: string; website?: string } {
    // 多种电话号码格式的正则表达式
    const phonePatterns = [
      /(?:电话|手机|TEL|Tel|tel|Phone|phone|移动|联系电话)\s*[:：]?\s*([1][3-9]\d{9})/g,
      /(?:座机|固话|办公电话)\s*[:：]?\s*(0\d{2,3}[-\s]?\d{7,8})/g,
      /(\+86\s?1[3-9]\d{9})/g,
      /(\d{3}-\d{4}-\d{4})/g,
      /(\d{11})/g
    ]
    
    // 邮箱正则表达式（更严格）
    const emailRegex = /([a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,})/g
    
    // 网站正则表达式
    const websitePatterns = [
      /(https?:\/\/[^\s\u4e00-\u9fa5]+)/g,
      /(www\.[^\s\u4e00-\u9fa5]+)/g,
      /([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.(?:com|net|org|cn|com\.cn|gov|edu|info|biz)(?:\.[a-zA-Z]{2,})?)/g
    ]

    let phone: string | undefined
    let email: string | undefined
    let website: string | undefined

    // 提取电话号码
    for (const pattern of phonePatterns) {
      const match = pattern.exec(text)
      if (match) {
        phone = this.cleanPhoneNumber(match[1])
        if (this.isValidPhoneNumber(phone)) {
          break
        }
      }
    }

    // 提取邮箱
    const emailMatch = emailRegex.exec(text)
    if (emailMatch) {
      email = emailMatch[1].toLowerCase()
    }

    // 提取网站
    for (const pattern of websitePatterns) {
      const match = pattern.exec(text)
      if (match) {
        website = this.cleanWebsite(match[1])
        break
      }
    }

    return { phone, email, website }
  }

  /**
   * 增强的公司名称提取
   */
  private extractCompanyName(text: string): string | undefined {
    const lines = text.split('\n').filter(line => line.trim())
    
    // 公司名称关键词
    const companyKeywords = [
      '公司', '企业', '集团', '有限', '责任', '股份',
      'Co.', 'Ltd', 'Inc', 'Corp', 'Company', 'Group', 'Enterprise',
      '科技', '技术', '工程', '咨询', '服务', '贸易', '实业'
    ]
    
    // 职位关键词（这些行通常不是公司名称）
    const positionKeywords = [
      '经理', '总监', '主任', '总裁', '董事', '副总', '助理',
      'Manager', 'Director', 'CEO', 'CTO', 'VP', 'President'
    ]

    let bestMatch: { text: string; score: number } | null = null

    for (const line of lines) {
      if (line.length < 3 || line.length > 50) continue
      
      let score = 0
      
      // 包含公司关键词加分
      for (const keyword of companyKeywords) {
        if (line.includes(keyword)) {
          score += 3
        }
      }
      
      // 包含职位关键词减分
      for (const keyword of positionKeywords) {
        if (line.includes(keyword)) {
          score -= 5
        }
      }
      
      // 长度适中加分
      if (line.length >= 4 && line.length <= 20) {
        score += 1
      }
      
      // 不包含数字或特殊符号加分
      if (!/[\d@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(line)) {
        score += 1
      }
      
      // 位置加分（公司名称通常在前几行）
      const lineIndex = lines.indexOf(line)
      if (lineIndex <= 2) {
        score += 2 - lineIndex
      }

      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { text: line.trim(), score }
      }
    }

    return bestMatch && bestMatch.score > 0 ? bestMatch.text : undefined
  }

  /**
   * 地址提取
   */
  private extractAddress(text: string): string | undefined {
    const addressKeywords = [
      '地址', '地点', 'Address', 'Add', '位置',
      '省', '市', '区', '县', '街', '路', '号', '楼',
      '大厦', '大楼', '中心', '广场', '园区'
    ]

    const lines = text.split('\n').filter(line => line.trim())
    
    for (const line of lines) {
      if (line.length < 5 || line.length > 100) continue
      
      let score = 0
      for (const keyword of addressKeywords) {
        if (line.includes(keyword)) {
          score++
        }
      }
      
      // 如果包含多个地址关键词，很可能是地址
      if (score >= 2) {
        return line.trim()
      }
    }

    return undefined
  }

  /**
   * 清理电话号码
   */
  private cleanPhoneNumber(phone: string): string {
    return phone.replace(/[-\s]/g, '')
  }

  /**
   * 验证电话号码有效性
   */
  private isValidPhoneNumber(phone: string): boolean {
    // 中国手机号码格式验证
    const mobileRegex = /^1[3-9]\d{9}$/
    // 中国固话格式验证
    const landlineRegex = /^0\d{2,3}\d{7,8}$/
    
    return mobileRegex.test(phone) || landlineRegex.test(phone)
  }

  /**
   * 清理网站地址
   */
  private cleanWebsite(website: string): string {
    let cleaned = website.toLowerCase().trim()
    
    // 如果没有协议，添加 http://
    if (!cleaned.startsWith('http')) {
      cleaned = 'http://' + cleaned
    }
    
    return cleaned
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate()
      this.worker = null
    }
  }
}

export const ocrService = new OCRService()