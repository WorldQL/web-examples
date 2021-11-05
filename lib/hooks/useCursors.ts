import { useCallback, useMemo } from 'react'
import type { RefObject } from 'react'
import { Instruction } from 'worldql-ts-client'
import { useWorldQL } from './useWorldQL'
import type { OnMessage } from './useWorldQL'

const WORLD_NAME = 'demo/cursors'

export const useCursors = (
  url: string,
  canvasRef: RefObject<HTMLCanvasElement>
) => {
  const ctx = canvasRef.current?.getContext('2d') ?? null

  const onMessage = useCallback<OnMessage>(
    message => {
      if (ctx === null) return
      if (message.worldName !== WORLD_NAME) return
      if (message.flex === undefined) return

      const uuid = message.senderUuid
      const json = new TextDecoder().decode(message.flex)
      const data = JSON.parse(json) as unknown

      if (typeof data !== 'object') return
      if (data === null) return

      const { x, y } = data as Record<string, unknown>
      if (typeof x !== 'number') return
      if (typeof y !== 'number') return

      console.log(ctx)
      ctx.beginPath()
      ctx.arc(x, y, 1, 0, 2 * Math.PI)
      ctx.stroke()
    },
    [ctx]
  )

  const { ready, sendMessage: sendWQLMessage } = useWorldQL(url, onMessage)

  const updatePosition = useCallback(
    (x: number, y: number) => {
      sendWQLMessage({
        worldName: WORLD_NAME,
        instruction: Instruction.GlobalMessage,
        flex: new TextEncoder().encode(JSON.stringify({ x, y })),
      })
    },
    [sendWQLMessage]
  )

  return { ready, updatePosition }
}
