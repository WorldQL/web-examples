import { useCallback, useEffect, useRef, useState } from 'react'
import { Client as WorldQLClient } from 'worldql-ts-client'
import type { Message } from 'worldql-ts-client'

type OnMessage = (message: Message) => void

export const useWorldQL = (url: string, onMessage?: OnMessage) => {
  const clientRef = useRef<WorldQLClient | null>(null)
  const [ready, setReady] = useState<boolean>(false)

  useEffect(() => {
    const client = new WorldQLClient({ url })
    client.connect()

    clientRef.current = client
    return () => {
      client.disconnect()
    }
  }, [url])

  const onReady = useCallback(() => {
    setReady(true)
  }, [])

  const onDisconnect = useCallback(() => {
    setReady(false)
  }, [])

  const handleMessage = useCallback<OnMessage>(
    message => {
      if (typeof onMessage === 'function') onMessage(message)
    },
    [onMessage]
  )

  useEffect(() => {
    clientRef.current?.addListener('ready', onReady)
    clientRef.current?.addListener('disconnect', onDisconnect)
    clientRef.current?.addListener('message', handleMessage)

    return () => {
      clientRef.current?.removeListener('ready', onReady)
      clientRef.current?.removeListener('disconnect', onDisconnect)
      clientRef.current?.removeListener('message', handleMessage)
    }
  }, [onReady, onDisconnect, handleMessage])

  type SendMessage = InstanceType<typeof WorldQLClient>['sendMessage']
  const sendMessage = useCallback<SendMessage>(message => {
    if (clientRef.current === null) {
      throw new Error('client is null')
    }

    clientRef.current.sendMessage(message)
  }, [])

  return { ready, sendMessage }
}
