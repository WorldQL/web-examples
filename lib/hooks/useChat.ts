import { useCallback, useReducer } from 'react'
import type { Reducer } from 'react'
import { Instruction } from 'worldql-ts-client'
import { useWorldQL } from './useWorldQL'
import type { OnMessage } from './useWorldQL'

export const useChat = (url: string, username: string, maxMessages = 50) => {
  type MessagePair = [username: string, message: string]
  type Action = { type: 'append'; data: MessagePair } | { type: 'clear' }

  const [messages, dispatch] = useReducer<Reducer<MessagePair[], Action>>(
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

    if (!Array.isArray(data)) return
    if (data.length !== 2) return

    const [username, text] = data as unknown[]
    if (typeof username !== 'string') return
    if (typeof text !== 'string') return

    dispatch({ type: 'append', data: [username, text] })
  }, [])

  const { ready, sendMessage: sendWQLMessage } = useWorldQL(url, onMessage)

  const sendMessage = useCallback(
    (message: string) => {
      const pair: MessagePair = [username, message]

      sendWQLMessage({
        worldName: '@global',
        instruction: Instruction.GlobalMessage,
        flex: new TextEncoder().encode(JSON.stringify(pair)),
      })
    },
    [username, sendWQLMessage]
  )

  return { ready, messages, sendMessage }
}
