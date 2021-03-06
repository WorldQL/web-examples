import { decode, encode } from '@msgpack/msgpack'
import fnv1a from '@sindresorhus/fnv1a'
import { Replication } from '@worldql/client'
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import type { Reducer } from 'react'
import { useWorldQL } from './useWorldQL'
import type { Handler } from './useWorldQL'

const WORLD_NAME = 'demo/chat'

interface OutgoingMessage {
  username: string
  text: string
}

export interface ChatMessage extends OutgoingMessage {
  colour: string
  timestamp: Date
  key: string
  system: boolean
}

export const useChat = (url: string, username: string, maxMessages = 50) => {
  const seenClientsRef = useRef(new Map<string, string>())

  type Action = { type: 'append'; data: ChatMessage } | { type: 'clear' }
  const [messages, dispatch] = useReducer<Reducer<ChatMessage[], Action>>(
    (state, action) => {
      switch (action.type) {
        case 'append': {
          const messages = [...state, action.data]
          messages.splice(0, messages.length - maxMessages)

          return messages
        }

        case 'clear':
          return []

        default:
          throw new Error('invalid action')
      }
    },
    []
  )

  const calculateColour = useCallback((uuid: string, username: string) => {
    const hex = fnv1a(`${uuid}${username}`).toString(16).slice(0, 6)
    return `#${hex}`
  }, [])

  const calculateMessage = useCallback(
    (username: string, text: string, uuid: string, system?: boolean) => {
      const timestamp = new Date()
      const keyData = `${uuid}${timestamp.getTime()}`
      const key = fnv1a(keyData).toString(16)
      const colour = calculateColour(uuid, username)

      const message: ChatMessage = {
        username,
        text,
        colour,
        timestamp,
        key,
        system: system ?? false,
      }

      return message
    },
    [calculateColour]
  )

  const onMessage = useCallback<Handler<'globalMessage'>>(
    (senderUuid, worldName, { flex }) => {
      if (worldName !== WORLD_NAME) return
      if (flex === undefined) return

      const data = decode(flex)
      if (typeof data !== 'object') return
      if (data === null) return

      const { username, text } = data as Record<string, unknown>
      if (typeof username !== 'string') return
      if (typeof text !== 'string') return

      const incoming = calculateMessage(username, text, senderUuid)
      dispatch({ type: 'append', data: incoming })

      seenClientsRef.current.set(senderUuid, username)
    },
    [calculateMessage]
  )

  const onDisconnect = useCallback<Handler<'peerDisconnect'>>(
    uuid => {
      if (!seenClientsRef.current) return
      const seenClients = seenClientsRef.current

      const name = seenClients.get(uuid)
      if (name !== undefined) {
        seenClients.delete(uuid)

        const message = calculateMessage(
          '[SYSTEM]',
          `${name} has disconnected.`,
          '',
          true
        )

        dispatch({ type: 'append', data: message })
      }
    },
    [calculateMessage, dispatch]
  )

  const { ready, uuid, areaSubscribe, globalMessage } = useWorldQL(url, {
    peerDisconnect: onDisconnect,
    globalMessage: onMessage,
  })

  useEffect(() => {
    if (ready) {
      areaSubscribe(WORLD_NAME, { x: 0, y: 0, z: 0 })
    }
  }, [ready, areaSubscribe])

  const sendMessage = useCallback(
    (text: string) => {
      const message: OutgoingMessage = {
        username,
        text,
      }

      const incoming = calculateMessage(username, text, uuid)
      dispatch({ type: 'append', data: incoming })

      const flex = encode(message)
      globalMessage(WORLD_NAME, Replication.ExceptSelf, { flex })
    },
    [uuid, username, calculateMessage, globalMessage]
  )

  const nameColour = useMemo<string>(
    () => calculateColour(uuid, username),
    [uuid, username, calculateColour]
  )

  return { ready, nameColour, messages, sendMessage }
}
