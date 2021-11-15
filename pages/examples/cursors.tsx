import cursorImage from 'assets/cursor.svg'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useRef } from 'react'
import { Page } from '~components/Page'
import { useCursors } from '~lib/hooks/useCursors'

const CANVAS_WIDTH = 1000
const CANVAS_HEIGHT = 800

const CursorsExample: NextPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useCursors(
    process.env.NEXT_PUBLIC_WORLDQL_WS_URL!,
    canvasRef,
    cursorImage.src,
    {
      scale: 0.05,
      offsetX: -5,
    }
  )

  return (
    <>
      <Head>
        <title>WorldQL Examples | Cursors</title>
      </Head>

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
          style={{ cursor: 'pointer' }}
        />
      </Page>
    </>
  )
}

export default CursorsExample
