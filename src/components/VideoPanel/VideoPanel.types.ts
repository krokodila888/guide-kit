export interface VideoSource {
  url: string
  title?: string
  duration?: string
  thumbnail?: string
}

export interface VideoPanelProps {
  source: VideoSource
  mode?: 'embed' | 'link'
  aspectRatio?: '16/9' | '4/3'
  width?: number | string
  allowFullscreen?: boolean
  linkText?: string
  className?: string
  style?: React.CSSProperties
}
