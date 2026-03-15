export interface DocItem {
  label: string
  url: string
  filename?: string
  fileType?: 'pdf' | 'docx' | 'xlsx' | 'other'
  size?: string
}

export interface DocButtonProps {
  docs: DocItem | DocItem[]
  label?: string
  variant?: 'button' | 'inline'
}
