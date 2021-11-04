import type { FC } from 'react'
import type { ChatMessage } from '~lib/hooks/useChat'

interface Props extends Omit<ChatMessage, 'key'> {
  children?: never
}

export const Message: FC<Props> = ({ username, text, colour, timestamp }) => (
  <p className='even:bg-gray-100 py-1 px-2'>
    [{timestamp.toLocaleTimeString()}]{' '}
    <strong style={{ color: `#${colour}` }}>{username}</strong>: {text}
  </p>
)
