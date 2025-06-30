import OpenAI from 'openai'
import type { BusinessCard, GeneratedWebsite } from '@/types'

export class WebsiteGenerator {
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
   * 根据名片信息生成企业官网
   */
  async generateWebsite(
    businessCard: Partial<BusinessCard>, 
    onUpdate?: (partialContent: string) => void
  ): Promise<GeneratedWebsite> {
    const openai = this.initializeOpenAI()
    
    const prompt = this.buildPrompt(businessCard)
    
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: "system",
            content: "你是一个专业的网页设计师和前端开发者。请根据用户提供的企业信息，生成一个现代、美观、响应式的企业官网页面。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000, // 增加token限制以支持更丰富内容
        stream: true
      })

      let response = ''
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          response += content
          // 实时回调部分内容
          if (onUpdate) {
            onUpdate(response)
          }
        }
      }

      if (!response) {
        throw new Error('AI 响应为空')
      }

      return this.parseAIResponse(response)
    } catch (error) {
      console.error('AI 生成失败:', error)
      throw new Error('AI 页面生成失败，请检查 API 配置')
    }
  }

  /**
   * 构建 AI 提示词
   */
  private buildPrompt(businessCard: Partial<BusinessCard>): string {
    const styleDescription = this.getStyleDescription(businessCard.style)
    
    return `
请为以下企业信息生成一个完整的现代化企业官网 HTML 页面：

企业信息：
- 公司名称: ${businessCard.companyName || '未知公司'}
- 电话: ${businessCard.contacts?.phone || '暂无'}
- 邮箱: ${businessCard.contacts?.email || '暂无'}
- 网址: ${businessCard.contacts?.website || '暂无'}
- 地址: ${businessCard.contacts?.address || '暂无'}

## 技术规范：
- 完整的 HTML5 页面结构（DOCTYPE、html、head、body）
- 引入 Tailwind CSS CDN: https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css
- 完全响应式设计，适配手机、平板、桌面
- 图标:引用在线矢量图标库内的图标(任何图标都不要带有背景色块、底板、外框）
- 图片: 使用开源图片网站链接的形式引入，保证图片可以正常访问
- 不要显示状态栏以及时间、信号等信息
- 主色调: ${businessCard.primaryColor || '#2563eb'}

## 设计风格：
${styleDescription}
- 优雅的极简主义美学与功能的完美平衡;
- 清新柔和的配色与品牌色系浑然一体;
- 恰到好处的留白设计;
- 轻盈通透的沉浸式体验;
- 信息层级通过微妙的阴影过渡与模块化卡片布局清晰呈现;
- 用户视线能自然聚焦核心功能;
- 克制的动效和清晰的层级组织;
- 传递出专业、可信与优雅的企业气质;
- 精心打磨的圆角;
- 细腻的微交互;
- 舒适的视觉比例;

## 内容策略：
根据公司名称"${businessCard.companyName}"搜索，推测相关特征，生成相应的内容，结合内容生成相对专业的官网：

#任务:
参考上面的产品规划内容
结合{设计风格}和{技术规范}输出一套UI设计方案。
生成1个html文件。

请直接返回完整的 HTML 代码，不要包含任何解释性文字。代码应该可以直接在浏览器中运行并展示专业的企业官网效果。
    `.trim()
  }

  /**
   * 获取风格描述
   */
  private getStyleDescription(style?: string): string {
    switch (style) {
      case 'tech':
        return `科技风格特征：
        - 深色主题配以亮色点缀，体现科技感
        - 使用几何图形、线条元素和科技图标
        - 渐变背景和发光效果
        - 现代无衬线字体，代码风格元素
        - 动态效果和交互动画
        - 蓝色、紫色、青色为主的配色方案`
      case 'minimal':
        return `极简风格特征：
        - 大量留白，简洁排版
        - 黑白灰为主色调，少量彩色点缀
        - 简单的几何形状和线条
        - 清晰的层级结构
        - subtle阴影和边框
        - 优雅的字体选择，统一的视觉语言`
      case 'business':
      default:
        return `商务风格特征：
        - 专业稳重的视觉表现
        - 经典的布局和配色
        - 企业级的信任感设计
        - 清晰的信息架构
        - 适度的装饰元素
        - 传统与现代结合的设计语言`
    }
  }

  /**
   * 解析 AI 响应
   */
  private parseAIResponse(response: string): GeneratedWebsite {
    // 提取 HTML 内容
    const htmlMatch = response.match(/<!DOCTYPE[\s\S]*<\/html>/i)
    let html = htmlMatch ? htmlMatch[0] : response

    // 如果没有完整的 HTML 结构，包装一下
    if (!html.includes('<!DOCTYPE')) {
      html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>企业官网</title>
</head>
<body>
${html}
</body>
</html>`
    }

    return {
      html,
      css: '', // CSS 已内联在 HTML 中
      preview: html
    }
  }

  /**
   * 生成默认网站（当 AI 不可用时）
   */
  generateFallbackWebsite(businessCard: Partial<BusinessCard>): GeneratedWebsite {
    const primaryColor = businessCard.primaryColor || '#2563eb'
    const companyName = businessCard.companyName || '企业名称'
    
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${companyName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        
        .header { background: ${primaryColor}; color: white; padding: 1rem 0; }
        .header h1 { font-size: 2rem; font-weight: bold; }
        
        .hero { background: linear-gradient(135deg, ${primaryColor}15, ${primaryColor}05); padding: 4rem 0; text-align: center; }
        .hero h2 { font-size: 3rem; margin-bottom: 1rem; color: ${primaryColor}; }
        .hero p { font-size: 1.2rem; color: #666; max-width: 600px; margin: 0 auto; }
        
        .contact { padding: 4rem 0; background: #f8fafc; }
        .contact h3 { font-size: 2rem; text-align: center; margin-bottom: 3rem; color: ${primaryColor}; }
        .contact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; }
        .contact-item { text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .contact-item h4 { color: ${primaryColor}; margin-bottom: 0.5rem; }
        
        .footer { background: #1f2937; color: white; text-align: center; padding: 2rem 0; }
        
        @media (max-width: 768px) {
            .hero h2 { font-size: 2rem; }
            .hero p { font-size: 1rem; }
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="container">
            <h1>${companyName}</h1>
        </div>
    </header>
    
    <section class="hero">
        <div class="container">
            <h2>欢迎来到${companyName}</h2>
            <p>我们致力于为客户提供优质的产品和服务，建立长期的合作关系。</p>
        </div>
    </section>
    
    <section class="contact">
        <div class="container">
            <h3>联系我们</h3>
            <div class="contact-grid">
                ${businessCard.contacts?.phone ? `
                <div class="contact-item">
                    <h4>电话</h4>
                    <p>${businessCard.contacts.phone}</p>
                </div>
                ` : ''}
                ${businessCard.contacts?.email ? `
                <div class="contact-item">
                    <h4>邮箱</h4>
                    <p>${businessCard.contacts.email}</p>
                </div>
                ` : ''}
                ${businessCard.contacts?.website ? `
                <div class="contact-item">
                    <h4>网站</h4>
                    <p>${businessCard.contacts.website}</p>
                </div>
                ` : ''}
                ${businessCard.contacts?.address ? `
                <div class="contact-item">
                    <h4>地址</h4>
                    <p>${businessCard.contacts.address}</p>
                </div>
                ` : ''}
            </div>
        </div>
    </section>
    
    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 ${companyName}. 保留所有权利。</p>
        </div>
    </footer>
</body>
</html>`

    return {
      html,
      css: '',
      preview: html
    }
  }
}

export const websiteGenerator = new WebsiteGenerator()