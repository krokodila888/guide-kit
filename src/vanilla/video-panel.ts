import { escapeHtml } from './utils'
import type { VanillaVideoPanelOptions, VideoPanelInstance } from './index.types'

const playIconSvg = `
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.5)"/>
    <polygon points="19,15 37,24 19,33" fill="#ffffff"/>
  </svg>
`

export function createVideoPanel(
  container: HTMLElement,
  options: VanillaVideoPanelOptions,
): VideoPanelInstance {
  const {
    source,
    mode = 'embed',
    aspectRatio = '16/9',
    width = '100%',
    allowFullscreen = true,
    linkText = 'Смотреть видео',
  } = options

  const [w, h] = aspectRatio.split('/').map(Number)
  const paddingPercent = (h / w) * 100

  container.style.fontFamily = 'var(--gk-font, inherit)'
  container.style.width = width

  if (mode === 'embed') {
    const titleHtml = source.title
      ? `<div style="font-size:14px;font-weight:500;color:var(--gk-text,#1f2937);margin-bottom:8px">${escapeHtml(source.title)}</div>`
      : ''
    container.innerHTML = `
      ${titleHtml}
      <div style="position:relative;width:100%;padding-bottom:${paddingPercent}%;overflow:hidden;border-radius:var(--gk-radius,8px)">
        <iframe
          src="${escapeHtml(source.url)}"
          title="${escapeHtml(source.title ?? '')}"
          style="position:absolute;top:0;left:0;width:100%;height:100%;border:0"
          loading="lazy"
          ${allowFullscreen ? 'allowfullscreen' : ''}
        ></iframe>
      </div>
    `
  } else {
    // link mode — preview card
    const thumbStyle = source.thumbnail
      ? `background-image:url('${escapeHtml(source.thumbnail)}');background-size:cover;background-position:center`
      : 'background:var(--gk-border,#e5e7eb)'

    container.innerHTML = `
      <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer"
         style="display:block;text-decoration:none;color:inherit;font-family:var(--gk-font,inherit)">
        <div style="
          position:relative;width:100%;padding-bottom:${paddingPercent}%;
          ${thumbStyle};
          border-radius:var(--gk-radius,8px);overflow:hidden;margin-bottom:8px
        ">
          <div style="
            position:absolute;inset:0;display:flex;align-items:center;justify-content:center
          ">
            ${playIconSvg}
          </div>
        </div>
        ${source.title ? `<div style="font-size:14px;font-weight:500;color:var(--gk-text,#1f2937);margin-bottom:4px">${escapeHtml(source.title)}</div>` : ''}
        <div style="display:flex;align-items:center;gap:8px">
          ${source.duration ? `<span style="font-size:12px;color:var(--gk-text-muted,#6b7280)">${escapeHtml(source.duration)}</span>` : ''}
          <span style="font-size:13px;color:var(--gk-primary,#2563eb)">${escapeHtml(linkText)}</span>
        </div>
      </a>
    `
  }

  return {
    destroy: () => { container.innerHTML = '' },
  }
}
