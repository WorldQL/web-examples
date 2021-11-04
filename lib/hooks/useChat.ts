import fnv1a from '@sindresorhus/fnv1a'
import { useCallback, useReducer } from 'react'
import type { Reducer } from 'react'
import { Instruction } from 'worldql-ts-client'
import { useWorldQL } from './useWorldQL'
import type { OnMessage } from './useWorldQL'

export const useChat = (url: string, username: string, maxMessages = 50) => {
  interface OutgoingMessage {
    username: string
    text: string
  }

  interface Message extends OutgoingMessage {
    colour: string
    timestamp: Date
    key: string
  }

  type Action = { type: 'append'; data: Message } | { type: 'clear' }
  const [messages, dispatch] = useReducer<Reducer<Message[], Action>>(
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

  const onMessage = useCallback<OnMessage>(message => {
    if (message.flex === undefined) return

    const json = new TextDecoder().decode(message.flex)
    const data = JSON.parse(json) as unknown

    if (typeof data !== 'object') return
    if (data === null) return

    const { username, text } = data as Record<string, unknown>
    if (typeof username !== 'string') return
    if (typeof text !== 'string') return

    const timestamp = new Date()
    const keyData = `${message.senderUuid}${json}${timestamp.getTime()}`
    const key = fnv1a(keyData).toString(16)
    const colour = fnv1a(`${message.senderUuid}${username}`)
      .toString(16)
      .slice(0, 6)

    const incoming: Message = {
      username,
      text,
      colour,
      timestamp,
      key,
    }

    dispatch({ type: 'append', data: incoming })
  }, [])

  const { ready, sendMessage: sendWQLMessage } = useWorldQL(url, onMessage)

  const sendMessage = useCallback(
    (text: string) => {
      const message: OutgoingMessage = {
        username,
        text,
      }

      sendWQLMessage({
        worldName: '@global',
        instruction: Instruction.GlobalMessage,
        flex: new TextEncoder().encode(JSON.stringify(message)),
      })
    },
    [username, sendWQLMessage]
  )

  return { ready, messages, sendMessage }
}
