import type { GeneratedWebsite, BusinessCard } from '@/types'

export interface VercelFile {
  file: string
  data: string
  encoding?: 'utf-8' | 'base64'
}

export interface VercelDeployment {
  id: string
  url: string
  name: string
  state: 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED'
  ready?: number
  createdAt: number
}

export interface VercelDeploymentResponse {
  id: string
  url: string
  name: string
  meta: Record<string, any>
  target: string | null
  readyState: 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED'
  ready?: number
  createdAt: number
}

export interface VercelAuthStatus {
  isAuthenticated: boolean
  user?: {
    id: string
    email: string
    name: string
    username: string
  }
}

export class VercelService {
  private readonly API_BASE = 'https://api.vercel.com'
  private token: string | null = null

  constructor() {
    // 从 localStorage 中恢复 token
    this.loadToken()
  }

  /**
   * 设置 Vercel 访问令牌
   */
  setToken(token: string): void {
    this.token = token
    this.saveToken(token)
  }

  /**
   * 获取当前令牌
   */
  getToken(): string | null {
    return this.token
  }

  /**
   * 清除认证信息
   */
  clearAuth(): void {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vercel_token')
    }
  }

  /**
   * 验证 Vercel 令牌是否有效
   */
  async validateToken(token?: string): Promise<VercelAuthStatus> {
    const authToken = token || this.token
    
    if (!authToken) {
      return { isAuthenticated: false }
    }

    try {
      const response = await fetch(`${this.API_BASE}/v2/user`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Card2Web/1.0'
        }
      })

      console.log('Token validation response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (response.ok) {
        const user = await response.json()
        
        // 如果验证成功且传入了新 token，则保存它
        if (token && token !== this.token) {
          this.setToken(token)
        }
        
        return {
          isAuthenticated: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username
          }
        }
      } else {
        const errorText = await response.text()
        console.warn('Token validation failed:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
        
        // 如果是当前存储的 token 验证失败，清除它
        if (!token || token === this.token) {
          this.clearAuth()
        }
        
        return { isAuthenticated: false }
      }
    } catch (error) {
      console.error('Token validation failed:', error)
      return { isAuthenticated: false }
    }
  }

  /**
   * 将网站发布到 Vercel
   */
  async deployWebsite(
    website: GeneratedWebsite,
    businessCard: Partial<BusinessCard>,
    projectName?: string
  ): Promise<VercelDeploymentResponse> {
    if (!this.token) {
      throw new Error('未设置 Vercel 访问令牌')
    }

    const files = await this.prepareFiles(website, businessCard)
    const name = this.sanitizeProjectName(projectName || businessCard.companyName || 'website')

    const deploymentPayload = {
      name,
      files,
      projectSettings: {
        framework: null,
        buildCommand: null,
        outputDirectory: null,
        installCommand: null,
        devCommand: null
      },
      target: 'production'
    }

    console.log('Deployment payload:', JSON.stringify(deploymentPayload, null, 2))

    try {
      const response = await fetch(`${this.API_BASE}/v13/deployments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Card2Web/1.0'
        },
        body: JSON.stringify(deploymentPayload)
      })

      const responseText = await response.text()
      console.log('Vercel API response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText
      })

      if (!response.ok) {
        let errorData: any = {}
        try {
          errorData = JSON.parse(responseText)
        } catch (e) {
          console.warn('Failed to parse error response as JSON:', e)
        }

        const errorMessage = errorData.error?.message || 
                           errorData.message || 
                           `HTTP ${response.status}: ${response.statusText}`
        
        throw new Error(`部署失败: ${errorMessage}`)
      }

      let deployment: VercelDeploymentResponse
      try {
        deployment = JSON.parse(responseText)
      } catch (e) {
        throw new Error('服务器返回的数据格式无效')
      }

      return deployment
    } catch (error) {
      console.error('Deployment failed:', error)
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('网络连接失败，请检查您的网络连接')
      }
      
      throw error instanceof Error ? error : new Error('部署过程中发生未知错误')
    }
  }

  /**
   * 获取部署状态
   */
  async getDeploymentStatus(deploymentId: string): Promise<VercelDeployment> {
    if (!this.token) {
      throw new Error('未设置 Vercel 访问令牌')
    }

    try {
      const response = await fetch(`${this.API_BASE}/v13/deployments/${deploymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`获取部署状态失败: ${response.status} ${response.statusText}`)
      }

      const deployment = await response.json()
      return {
        id: deployment.id,
        url: deployment.url,
        name: deployment.name,
        state: deployment.readyState,
        ready: deployment.ready,
        createdAt: deployment.createdAt
      }
    } catch (error) {
      console.error('Failed to get deployment status:', error)
      throw error instanceof Error ? error : new Error('获取部署状态失败')
    }
  }

  /**
   * 准备部署文件
   */
  private async prepareFiles(
    website: GeneratedWebsite,
    businessCard: Partial<BusinessCard>
  ): Promise<VercelFile[]> {
    const files: VercelFile[] = []

    // 提取样式并创建独立文件
    const { html, css } = this.extractStyles(website.html)

    // 主页面文件
    files.push({
      file: 'index.html',
      data: html,
      encoding: 'utf-8'
    })

    // CSS 文件
    if (css) {
      files.push({
        file: 'styles.css',
        data: css,
        encoding: 'utf-8'
      })
    }

    // 添加 Logo 文件
    if (businessCard.logo) {
      try {
        const logoData = this.extractBase64Data(businessCard.logo)
        files.push({
          file: 'assets/logo.png',
          data: logoData,
          encoding: 'base64'
        })
      } catch (error) {
        console.warn('Logo 处理失败:', error)
      }
    }

    // 添加基本的 favicon
    const favicon = this.generateFavicon(businessCard.primaryColor)
    files.push({
      file: 'favicon.ico',
      data: favicon,
      encoding: 'base64'
    })

    // 添加 vercel.json 配置文件
    files.push({
      file: 'vercel.json',
      data: JSON.stringify({
        cleanUrls: true,
        trailingSlash: false,
        headers: [
          {
            source: '/(.*)',
            headers: [
              {
                key: 'X-Frame-Options',
                value: 'SAMEORIGIN'
              },
              {
                key: 'X-Content-Type-Options',
                value: 'nosniff'
              }
            ]
          }
        ]
      }, null, 2),
      encoding: 'utf-8'
    })

    return files
  }

  /**
   * 提取内联样式并生成独立的 CSS 文件
   */
  private extractStyles(html: string): { html: string; css: string } {
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi
    let css = ''
    let matches

    while ((matches = styleRegex.exec(html)) !== null) {
      css += matches[1] + '\n'
    }

    // 移除原始的 style 标签并添加 CSS 文件链接
    let cleanHtml = html.replace(styleRegex, '')
    
    if (css) {
      cleanHtml = cleanHtml.replace(
        /<\/head>/i,
        '  <link rel="stylesheet" href="styles.css">\n</head>'
      )
    }

    return { html: cleanHtml, css: css.trim() }
  }

  /**
   * 从 data URL 中提取 base64 数据
   */
  private extractBase64Data(dataURL: string): string {
    const base64Index = dataURL.indexOf(',')
    if (base64Index === -1) {
      throw new Error('Invalid data URL format')
    }
    return dataURL.substring(base64Index + 1)
  }

  /**
   * 生成简单的 favicon
   */
  private generateFavicon(primaryColor?: string): string {
    // 简单的 favicon base64 数据
    return 'AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAABILAAASCwAAAAAAAAAAAAAA'
  }

  /**
   * 清理项目名称
   */
  private sanitizeProjectName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-') // 只保留字母、数字和连字符
      .replace(/-+/g, '-')         // 合并多个连字符
      .replace(/^-|-$/g, '')       // 移除开头和结尾的连字符
      .substring(0, 52)            // Vercel 项目名称限制
      || 'website'
  }

  /**
   * 保存 token 到 localStorage
   */
  private saveToken(token: string): void {
    if (typeof window === 'undefined') return
    
    try {
      // 简单的 base64 编码（非加密，仅用于基本混淆）
      const encoded = btoa(token)
      localStorage.setItem('vercel_token', encoded)
    } catch (error) {
      console.error('Failed to save token:', error)
    }
  }

  /**
   * 从 localStorage 加载 token
   */
  private loadToken(): void {
    if (typeof window === 'undefined') return
    
    try {
      const encoded = localStorage.getItem('vercel_token')
      if (encoded) {
        this.token = atob(encoded)
      }
    } catch (error) {
      console.error('Failed to load token:', error)
      localStorage.removeItem('vercel_token')
    }
  }
}

export const vercelService = new VercelService()