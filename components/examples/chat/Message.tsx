import type { FC } from 'react'
import type { ChatMessage } from '~lib/hooks/useChat'

interface Props extends Omit<ChatMessage, 'key'> {
  children?: never
}

export const Message: FC<Props> = ({
  username,
  text,
  colour,
  timestamp,
  system,
}) => {
  const nameColour = system ? '#4c4c4c' : colour
  const textColour = system ? '#6d6d6d' : undefined
  const fontStyle = system ? 'italic' : undefined

  return (
    <p className='even:bg-gray-100 py-1 px-2'>
      [{timestamp.toLocaleTimeString()}]{' '}
      <strong style={{ color: nameColour }}>{username}</strong>
      {system ? '' : ':'}{' '}
      <span style={{ fontStyle, color: textColour }}>{text}</span>
    </p>
  )
}
