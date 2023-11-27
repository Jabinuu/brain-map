import { Rect, SVG } from '@svgdotjs/svg.js'

export function drawRect (container: HTMLElement): void {
  const svg = SVG().addTo(container).size(200, 200)
  const rect = new Rect().size(200, 200).fill('#f06')
  svg.add(rect)
}
