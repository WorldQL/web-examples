import { ClientEvents, Client as WorldQLClient } from '@worldql/client'
import { useCallback, useEffect, useRef, useState } from 'react'

export type Handler<T extends keyof ClientEvents> = (
  ...args: ClientEvents[T]
) => void

interface Handlers {
  ready?: Handler<'ready'>
  peerConnect?: Handler<'peerConnect'>
  peerDisconnect?: Handler<'peerDisconnect'>
  globalMessage?: Handler<'globalMessage'>
}

export const useWorldQL = (url: string, handlers?: Handlers) => {
  const clientRef = useRef<WorldQLClient | null>(null)
  const [ready, setReady] = useState<boolean>(false)
  const [uuid, setUuid] = useState<string>('')

  useEffect(() => {
    const client = new WorldQLClient({ url })
    client.connect()

    clientRef.current = client
    return () => {
      client.disconnect()
    }
  }, [url])

  const onReady = useCallback<Handler<'ready'>>(() => {
    setReady(true)
    setUuid(clientRef.current!.uuid)

    if (typeof handlers?.ready === 'function') {
      handlers.ready()
    }
  }, [handlers])

  const onDisconnect = useCallback<Handler<'disconnect'>>(() => {
    setReady(false)
    setUuid('')
  }, [])

  const handlePeerConnect = useCallback<Handler<'peerConnect'>>(
    (...args) => {
      if (typeof handlers?.peerConnect === 'function') {
        handlers.peerConnect(...args)
      }
    },
    [handlers]
  )

  const handlePeerDisconnect = useCallback<Handler<'peerDisconnect'>>(
    (...args) => {
      if (typeof handlers?.peerDisconnect === 'function') {
        handlers.peerDisconnect(...args)
      }
    },
    [handlers]
  )

  const handleGlobalMessage = useCallback<Handler<'globalMessage'>>(
    (...args) => {
      if (typeof handlers?.globalMessage === 'function') {
        handlers.globalMessage(...args)
      }
    },
    [handlers]
  )

  useEffect(() => {
    clientRef.current?.addListener('ready', onReady)
    clientRef.current?.addListener('disconnect', onDisconnect)
    clientRef.current?.addListener('peerConnect', handlePeerConnect)
    clientRef.current?.addListener('peerDisconnect', handlePeerDisconnect)
    clientRef.current?.addListener('globalMessage', handleGlobalMessage)

    return () => {
      clientRef.current?.removeListener('ready', onReady)
      clientRef.current?.removeListener('disconnect', onDisconnect)
      clientRef.current?.removeListener('peerConnect', handlePeerConnect)
      clientRef.current?.removeListener('peerDisconnect', handlePeerDisconnect)
      clientRef.current?.removeListener('globalMessage', handleGlobalMessage)
    }
  }, [
    onReady,
    onDisconnect,
    handlePeerConnect,
    handlePeerDisconnect,
    handleGlobalMessage,
  ])

  type AreaSubscribe = InstanceType<typeof WorldQLClient>['areaSubscribe']
  const areaSubscribe = useCallback<AreaSubscribe>((...args) => {
    if (clientRef.current === null) {
      throw new Error('client is null')
    }

    clientRef.current.areaSubscribe(...args)
  }, [])

  type SendGlobalMessage = InstanceType<typeof WorldQLClient>['globalMessage']
  const globalMessage = useCallback<SendGlobalMessage>((...args) => {
    if (clientRef.current === null) {
      throw new Error('client is null')
    }

    clientRef.current.globalMessage(...args)
  }, [])

  return { ready, uuid, areaSubscribe, globalMessage }
}
