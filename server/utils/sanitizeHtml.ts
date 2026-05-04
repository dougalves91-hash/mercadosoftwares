const FORBIDDEN_TAGS = ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta']

export function sanitizeHtml(input: unknown): string {
  let html = String(input ?? '')

  for (const tag of FORBIDDEN_TAGS) {
    const blockPattern = new RegExp(`<\\s*${tag}\\b[^>]*>[\\s\\S]*?<\\s*\\/\\s*${tag}\\s*>`, 'gi')
    const selfPattern = new RegExp(`<\\s*${tag}\\b[^>]*\\/?\\s*>`, 'gi')
    html = html.replace(blockPattern, '').replace(selfPattern, '')
  }

  html = html.replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  html = html.replace(/\s+(href|src)\s*=\s*("|')\s*javascript:[\s\S]*?\2/gi, '')
  html = html.replace(/\s+(href|src)\s*=\s*javascript:[^\s>]+/gi, '')

  return html
}
