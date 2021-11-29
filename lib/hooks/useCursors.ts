import { decode, encode } from '@msgpack/msgpack'
import { Replication } from '@worldql/client'
import { useCallback, useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { useAnimationFrame } from './useAnimationFrame'
import { useWorldQL } from './useWorldQL'
import type { Handler } from './useWorldQL'

const WORLD_NAME = 'demo/cursors'

interface ImageAdjustments {
  scale: number
  offsetX: number
  offsetY: number
}

const useCursorsClient = (
  url: string,
  canvasRef: RefObject<HTMLCanvasElement>,
  cursorImageURL: string,
  imageAdjustments?: Partial<ImageAdjustments>
) => {
  const ctx = canvasRef.current?.getContext('2d') ?? null
  const coordsRef = useRef(new Map<string, [x: number, y: number]>())
  const imageRef = useRef(new Image())

  useEffect(() => {
    imageRef.current.src = cursorImageURL
  }, [cursorImageURL])

  useAnimationFrame(() => {
    if (ctx === null) return
    if (canvasRef.current === null) return
    const canvas = canvasRef.current

    // Ensure cursor image has loaded
    if (!imageRef.current.complete) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (coordsRef.current.size === 0) return

    ctx.imageSmoothingEnabled = false
    for (const [x, y] of coordsRef.current.values()) {
      ctx.drawImage(
        imageRef.current,
        x + (imageAdjustments?.offsetX ?? 0),
        y + (imageAdjustments?.offsetY ?? 0),
        imageRef.current.width * (imageAdjustments?.scale ?? 1),
        imageRef.current.height * (imageAdjustments?.scale ?? 1)
      )
    }
  }, [])

  const onMessage = useCallback<Handler<'globalMessage'>>(
    (senderUuid, worldName, { parameter, flex }) => {
      if (worldName !== WORLD_NAME) return
      if (!parameter) return

      switch (parameter) {
        case 'mouseout': {
          coordsRef.current.delete(senderUuid)
          break
        }

        case 'mousemove': {
          if (flex === undefined) return

          const data = decode(flex)
          if (typeof data !== 'object') return
          if (data === null) return

          const { x, y } = data as Record<string, unknown>
          if (typeof x !== 'number') return
          if (typeof y !== 'number') return

          coordsRef.current.set(senderUuid, [x, y])
          break
        }

        default:
          break
      }
    },
    []
  )

  const onDisconnect = useCallback<Handler<'peerDisconnect'>>(uuid => {
    coordsRef.current.delete(uuid)
  }, [])

  const { ready, areaSubscribe, globalMessage } = useWorldQL(url, {
    peerDisconnect: onDisconnect,
    globalMessage: onMessage,
  })

  useEffect(() => {
    if (ready) {
      areaSubscribe(WORLD_NAME, { x: 0, y: 0, z: 0 })
    }
  }, [ready, areaSubscribe])

  const sendMessage = useCallback(
    (parameter: string, data?: Record<string, unknown>) => {
      if (!ready) return

      const flex = data && encode(data)
      globalMessage(WORLD_NAME, Replication.ExceptSelf, { parameter, flex })
    },
    [ready, globalMessage]
  )

  const onMouseMove = useCallback(
    (ev: MouseEvent) => {
      if (canvasRef.current === null) return
      const rect = canvasRef.current.getBoundingClientRect()

      const { width, height } = rect

      const x = ((ev.clientX - rect.left) / width) * canvasRef.current.width
      const y = ((ev.clientY - rect.top) / height) * canvasRef.current.height

      sendMessage('mousemove', { x, y })
    },
    [canvasRef, sendMessage]
  )

  const onMouseOut = useCallback(() => {
    if (canvasRef.current === null) return
    sendMessage('mouseout')
  }, [canvasRef, sendMessage])

  useEffect(() => {
    const ref = canvasRef.current
    ref?.addEventListener('mousemove', onMouseMove)
    ref?.addEventListener('mouseout', onMouseOut)

    return () => {
      ref?.removeEventListener('mousemove', onMouseMove)
      ref?.removeEventListener('mouseout', onMouseOut)
    }
  }, [canvasRef, onMouseMove, onMouseOut])
}

// Only call hook on client
export const useCursors: typeof useCursorsClient = (...args) => {
  if (typeof window === 'undefined') return

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useCursorsClient(...args)
}
