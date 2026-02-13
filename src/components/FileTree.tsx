interface FileTreeProps {
  tree: string
  title: string
}

export function FileTree({ tree, title }: FileTreeProps) {
  return (
    <div className="rounded-lg overflow-hidden border border-[#3c3c3c] bg-[#1e1e1e]">
      <div className="px-4 py-2 bg-[#2d2d2d] border-b border-[#3c3c3c]">
        <span className="text-xs text-[#808080] font-mono">{title}</span>
      </div>
      <div className="px-4 py-3">
        <pre className="text-sm font-mono text-[#d4d4d4] whitespace-pre overflow-x-auto leading-relaxed">
          {tree}
        </pre>
      </div>
    </div>
  )
}
