import { nicknames } from 'memorable-moniker'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useCallback, useState } from 'react'
import type { ChangeEventHandler, MouseEventHandler } from 'react'
import { useChat } from '~lib/hooks/useChat'

const username = nicknames.next()

const ChatExample: NextPage = () => {
  const [text, setText] = useState<string>('')

  const onTextChange = useCallback<ChangeEventHandler<HTMLInputElement>>(ev => {
    setText(ev.target.value)
  }, [])

  const { ready, messages, sendMessage } = useChat(
    'ws://localhost:8080',
    username,
    3
  )

  const onSend = useCallback<MouseEventHandler<HTMLButtonElement>>(() => {
    if (text === '') return

    sendMessage(text)
    setText('')
  }, [text, sendMessage])

  return (
    <>
      <Head>
        <title>WorldQL Examples | Chat</title>
      </Head>

      <div>
        <h1>Chat Example</h1>
        <p>Realtime chat room implemented using WorldQL</p>

        {!ready ? (
          <div>Loading...</div>
        ) : (
          <div>
            <h2>
              Your username is:&nbsp;<strong>{username}</strong>
            </h2>

            {messages.map(([username, text], i) => (
              <p key={i}>
                <strong>{username}:</strong>&nbsp;{text}
              </p>
            ))}

            <input type='text' value={text} onChange={onTextChange} />

            <button type='button' disabled={text === ''} onClick={onSend}>
              SEND
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default ChatExample
