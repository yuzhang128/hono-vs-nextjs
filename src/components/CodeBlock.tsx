import { useEffect, useState } from 'react'
import { codeToHtml } from 'shiki'

interface CodeBlockProps {
  code: string
  lang: string
  title?: string
}

export function CodeBlock({ code, lang, title }: CodeBlockProps) {
  const [html, setHtml] = useState<string>('')

  useEffect(() => {
    codeToHtml(code, {
      lang,
      theme: 'dark-plus',
    }).then(setHtml)
  }, [code, lang])

  return (
    <div className="rounded-lg overflow-hidden border border-[#3c3c3c] bg-[#1e1e1e]">
      {title && (
        <div className="px-4 py-2 bg-[#2d2d2d] border-b border-[#3c3c3c]">
          <span className="text-xs text-[#808080] font-mono">{title}</span>
        </div>
      )}
      <div className="overflow-x-auto">
        <div
          className="[&>pre]:!bg-transparent [&>pre]:!m-0 [&>pre]:px-4 [&>pre]:py-3 [&>pre]:!leading-relaxed [&_code]:!block [&_code]:!text-[13px] [&_code]:font-mono"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  )
}
