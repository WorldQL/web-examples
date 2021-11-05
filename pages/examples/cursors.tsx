import type { NextPage } from 'next'
import { useCallback, useRef } from 'react'
import type { MouseEventHandler } from 'react'
import { Page } from '~components/Page'
import { useCursors } from '~lib/hooks/useCursors'

const CANVAS_WIDTH = 1000
const CANVAS_HEIGHT = 800

const CursorsExample: NextPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { ready, updatePosition } = useCursors(
    process.env.NEXT_PUBLIC_WORLDQL_WS_URL!,
    canvasRef
  )

  const onMouseMove = useCallback<MouseEventHandler<HTMLCanvasElement>>(
    ev => {
      if (!ready) return false
      if (canvasRef.current === null) return
      const rect = canvasRef.current.getBoundingClientRect()

      const { width, height } = rect

      const x = ((ev.clientX - rect.left) / width) * CANVAS_WIDTH
      const y = ((ev.clientY - rect.top) / height) * CANVAS_HEIGHT

      updatePosition(x, y)
    },
    [ready, updatePosition]
  )

  return (
    <Page
      title='Cursors'
      subtitle='Replicated cursors using HTML Canvas and WorldQL'
      href='/'
    >
      <canvas
        ref={canvasRef}
        className='w-full h-auto rounded-lg border border-gray-300 shadow-md'
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onMouseMove={onMouseMove}
      />
    </Page>
  )
}

export default CursorsExample
