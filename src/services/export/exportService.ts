import JSZip from 'jszip'
import type { GeneratedWebsite, BusinessCard } from '@/types'

export class ExportService {
  /**
   * 导出为单个 HTML 文件
   */
  async exportHTML(website: GeneratedWebsite, companyName: string = 'website'): Promise<void> {
    const blob = new Blob([website.html], { type: 'text/html;charset=utf-8' })
    this.downloadFile(blob, `${this.sanitizeFileName(companyName)}.html`)
  }

  /**
   * 导出为 ZIP 文件包（包含 HTML、CSS、资源文件）
   */
  async exportZIP(
    website: GeneratedWebsite, 
    businessCard: Partial<BusinessCard>,
    companyName: string = 'website'
  ): Promise<void> {
    const zip = new JSZip()
    
    // 提取内联样式并创建独立的 CSS 文件
    const { html, css } = this.extractStyles(website.html)
    
    // 添加主要文件
    zip.file('index.html', html)
    if (css) {
      zip.file('styles.css', css)
    }
    
    // 添加 README 文件
    const readme = this.generateReadme(businessCard, companyName)
    zip.file('README.md', readme)
    
    // 添加网站配置文件
    const packageJson = this.generatePackageJson(companyName)
    zip.file('package.json', packageJson)
    
    // 如果有 Logo，添加到 assets 文件夹
    if (businessCard.logo) {
      try {
        const logoBlob = await this.dataURLToBlob(businessCard.logo)
        zip.file('assets/logo.png', logoBlob)
      } catch (error) {
        console.warn('Logo 文件添加失败:', error)
      }
    }
    
    // 添加基本的 favicon
    const favicon = this.generateFavicon(businessCard.primaryColor)
    zip.file('favicon.ico', favicon, { base64: true })
    
    // 生成并下载 ZIP 文件
    try {
      const content = await zip.generateAsync({ type: 'blob' })
      this.downloadFile(content, `${this.sanitizeFileName(companyName)}-website.zip`)
    } catch (error) {
      console.error('ZIP 生成失败:', error)
      throw new Error('网站打包失败')
    }
  }

  /**
   * 提取内联样式并生成独立的 CSS 文件
   */
  private extractStyles(html: string): { html: string; css: string } {
    // 提取 <style> 标签中的 CSS
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi
    let css = ''
    let matches

    while ((matches = styleRegex.exec(html)) !== null) {
      css += matches[1] + '\n'
    }

    // 移除原始的 style 标签并添加 CSS 文件链接
    let cleanHtml = html.replace(styleRegex, '')
    
    if (css) {
      // 在 head 标签中添加 CSS 链接
      cleanHtml = cleanHtml.replace(
        /<\/head>/i,
        '  <link rel="stylesheet" href="styles.css">\n</head>'
      )
    }

    return { html: cleanHtml, css: css.trim() }
  }

  /**
   * 生成 README.md 文件
   */
  private generateReadme(businessCard: Partial<BusinessCard>, companyName: string): string {
    const currentDate = new Date().toLocaleDateString('zh-CN')
    
    return `# ${companyName} 企业官网

## 项目简介

这是通过 Card2Web 自动生成的企业官网，基于名片信息智能创建。

## 企业信息

- **公司名称**: ${businessCard.companyName || '未设置'}
- **联系电话**: ${businessCard.contacts?.phone || '未设置'}
- **邮箱地址**: ${businessCard.contacts?.email || '未设置'}
- **网站地址**: ${businessCard.contacts?.website || '未设置'}
- **公司地址**: ${businessCard.contacts?.address || '未设置'}
- **主色调**: ${businessCard.primaryColor || '未设置'}

## 文件结构

\`\`\`
├── index.html          # 主页面文件
├── styles.css          # 样式文件
├── assets/            # 资源文件夹
│   └── logo.png       # 公司 Logo（如有）
├── favicon.ico        # 网站图标
├── package.json       # 项目配置
└── README.md          # 说明文档
\`\`\`

## 使用说明

1. 直接打开 \`index.html\` 文件即可在浏览器中查看网站
2. 如需部署到服务器，将所有文件上传到网站根目录
3. 建议使用现代浏览器以获得最佳显示效果

## 技术特性

- ✅ 响应式设计，支持手机、平板、桌面设备
- ✅ 现代化的 CSS 样式，美观大方
- ✅ 优化的加载速度和用户体验
- ✅ SEO 友好的 HTML 结构

## 部署建议

### 静态网站托管平台
- [Vercel](https://vercel.com) - 推荐，免费且快速
- [Netlify](https://netlify.com) - 免费，功能丰富
- [GitHub Pages](https://pages.github.com) - 免费，与 GitHub 集成

### 传统网站主机
- 将所有文件上传到网站根目录
- 确保 \`index.html\` 为首页文件
- 配置合适的 MIME 类型

---

*本网站由 [Card2Web](https://card2web.com) 于 ${currentDate} 自动生成*
`
  }

  /**
   * 生成 package.json 文件
   */
  private generatePackageJson(companyName: string): string {
    const packageConfig = {
      name: this.sanitizeFileName(companyName).toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: `${companyName} 企业官网`,
      main: 'index.html',
      scripts: {
        start: 'python -m http.server 8000',
        'start:node': 'npx http-server -p 8000',
        dev: 'npx live-server'
      },
      keywords: ['website', 'business', 'corporate', companyName],
      author: companyName,
      license: 'MIT',
      devDependencies: {
        'http-server': '^14.1.1',
        'live-server': '^1.2.2'
      },
      homepage: './index.html',
      repository: {
        type: 'git',
        url: `https://github.com/your-username/${this.sanitizeFileName(companyName).toLowerCase().replace(/\s+/g, '-')}`
      }
    }

    return JSON.stringify(packageConfig, null, 2)
  }

  /**
   * 生成简单的 favicon
   */
  private generateFavicon(primaryColor?: string): string {
    // 生成一个简单的 16x16 ICO 文件的 base64 编码
    // 这是一个简化版本，实际应用中可以使用更复杂的 favicon 生成
    const color = primaryColor || '#2563eb'
    
    // 简单的 favicon base64 数据（蓝色正方形）
    return 'AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAABILAAASCwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='
  }

  /**
   * 将 data URL 转换为 Blob
   */
  private async dataURLToBlob(dataURL: string): Promise<Blob> {
    const response = await fetch(dataURL)
    return response.blob()
  }

  /**
   * 下载文件
   */
  private downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * 清理文件名，移除不安全字符
   */
  private sanitizeFileName(filename: string): string {
    return filename
      .replace(/[<>:"/\\|?*]/g, '') // 移除不安全字符
      .replace(/\s+/g, '_')         // 空格替换为下划线
      .trim()
      .substring(0, 50)             // 限制长度
      || 'website'                  // 默认名称
  }

  /**
   * 导出为 PDF（未来功能）
   */
  async exportPDF(website: GeneratedWebsite, companyName: string = 'website'): Promise<void> {
    // 这里可以集成 jsPDF 或其他 PDF 生成库
    // 暂时显示提示信息
    alert('PDF 导出功能即将推出！请先使用 HTML 或 ZIP 导出。')
  }

  /**
   * 获取支持的导出格式
   */
  getSupportedFormats(): Array<{ value: string; label: string; description: string }> {
    return [
      {
        value: 'html',
        label: 'HTML 文件',
        description: '单个 HTML 文件，包含所有样式'
      },
      {
        value: 'zip',
        label: 'ZIP 压缩包',
        description: '完整网站包，包含 HTML、CSS、资源文件'
      },
      {
        value: 'pdf',
        label: 'PDF 文档',
        description: '网站的 PDF 版本（即将推出）'
      }
    ]
  }
}

export const exportService = new ExportService()