import fnv1a from '@sindresorhus/fnv1a'
import { useCallback, useMemo, useReducer } from 'react'
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
    (username: string, text: string, uuid: string, system = false) => {
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
        system,
      }

      return message
    },
    [calculateColour]
  )

  const onMessage = useCallback<Handler<'globalMessage'>>(
    (senderUuid, worldName, { flex }) => {
      if (worldName !== WORLD_NAME) return
      if (flex === undefined) return

      const json = new TextDecoder().decode(flex)
      const data = JSON.parse(json) as unknown

      if (typeof data !== 'object') return
      if (data === null) return

      const { username, text } = data as Record<string, unknown>
      if (typeof username !== 'string') return
      if (typeof text !== 'string') return

      const incoming = calculateMessage(username, text, senderUuid)
      dispatch({ type: 'append', data: incoming })
    },
    [calculateMessage]
  )

  const { ready, uuid, globalMessage } = useWorldQL(url, {
    globalMessage: onMessage,
  })

  const sendMessage = useCallback(
    (text: string) => {
      const message: OutgoingMessage = {
        username,
        text,
      }

      const incoming = calculateMessage(username, text, uuid)
      dispatch({ type: 'append', data: incoming })

      const flex = new TextEncoder().encode(JSON.stringify(message))
      globalMessage(WORLD_NAME, { flex })
    },
    [uuid, username, calculateMessage, globalMessage]
  )

  const nameColour = useMemo<string>(
    () => calculateColour(uuid, username),
    [uuid, username, calculateColour]
  )

  return { ready, nameColour, messages, sendMessage }
}
