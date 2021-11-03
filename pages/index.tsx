import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'

const Home: NextPage = () => (
  <>
    <Head>
      <title>WorldQL Examples</title>
    </Head>

    <div>
      <h1>WorldQL Examples</h1>
      <sub>Web examples using TypeScript.</sub>

      <hr />

      <ul>
        <Link href='/examples/chat'>Chat</Link>
      </ul>
    </div>
  </>
)

export default Home
