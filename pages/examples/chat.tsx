import { nicknames } from 'memorable-moniker'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useCallback, useState } from 'react'
import type { ChangeEventHandler, KeyboardEventHandler } from 'react'
import { Message } from '~components/examples/chat/Message'
import { Page } from '~components/Page'
import { useChat } from '~lib/hooks/useChat'

const username = nicknames.next()

const ChatExample: NextPage = () => {
  const [text, setText] = useState<string>('')

  const onTextChange = useCallback<ChangeEventHandler<HTMLInputElement>>(ev => {
    setText(ev.target.value)
  }, [])

  const { ready, messages, sendMessage } = useChat(
    'ws://localhost:8080',
    username
  )

  const onSend = useCallback(() => {
    if (text === '') return

    sendMessage(text)
    setText('')
  }, [text, sendMessage])

  const onKeyPress = useCallback<KeyboardEventHandler<HTMLInputElement>>(
    ev => {
      if (ev.key === 'Enter') onSend()
    },
    [onSend]
  )

  return (
    <>
      <Head>
        <title>WorldQL Examples | Chat</title>
      </Head>

      <Page
        title='Chat'
        subtitle='Realtime chatroom implemented using WebSockets and WorldQL'
        href='/'
      >
        <div className='w-full h-full flex flex-col'>
          <h2 className='text-xl font-semibold mb-2'>
            {!ready ? (
              'Loading...'
            ) : (
              <>
                Your username is&nbsp;<strong>{username}</strong>.
              </>
            )}
          </h2>

          <div className='flex-1'>
            {messages.map(({ username, text, colour, timestamp, key }) => (
              <Message
                key={key}
                username={username}
                text={text}
                colour={colour}
                timestamp={timestamp}
              />
            ))}
          </div>

          <div className='flex mt-2'>
            <input
              type='text'
              placeholder='Press ENTER to send.'
              className='mr-2 flex-1 py-2 px-3 border border-gray-300 block shadow-sm rounded-md'
              disabled={!ready}
              value={text}
              onChange={onTextChange}
              onKeyPress={onKeyPress}
            />

            <button
              type='button'
              className='py-2 px-4 text-white bg-purple-600 hover:bg-purple-500 block shadow-sm rounded-md hover:shadow-md motion-safe:transition-all disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={!ready || text === ''}
              onClick={onSend}
            >
              SEND
            </button>
          </div>
        </div>
      </Page>
    </>
  )
}

export default ChatExample
