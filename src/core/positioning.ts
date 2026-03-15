import {
  computePosition as floatingComputePosition,
  autoUpdate,
  offset,
  flip,
  shift,
} from '@floating-ui/dom'
import type { Placement } from '@floating-ui/dom'

export type { Placement }

export interface PositionResult {
  x: number
  y: number
  placement: Placement
}

export async function computePosition(
  reference: Element,
  floating: HTMLElement,
  placement: Placement = 'right'
): Promise<PositionResult> {
  const result = await floatingComputePosition(reference, floating, {
    placement,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  })
  return { x: result.x, y: result.y, placement: result.placement }
}

export function autoUpdatePosition(
  reference: Element,
  floating: HTMLElement,
  placement: Placement,
  callback: (result: PositionResult) => void
): () => void {
  return autoUpdate(reference, floating, async () => {
    const result = await computePosition(reference, floating, placement)
    callback(result)
  })
}
