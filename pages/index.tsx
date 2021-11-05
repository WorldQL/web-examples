import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { ExtLink } from '~components/ExtLink'
import { Heading } from '~components/index/Heading'
import { Page } from '~components/Page'

const Home: NextPage = () => (
  <>
    <Head>
      <title>WorldQL Examples</title>
    </Head>

    <Page
      title='WorldQL Examples'
      subtitle='A collection of demos using WorldQL and TypeScript.'
    >
      <Heading>Source Code</Heading>
      <p>
        You can view the source code for this website on{' '}
        <ExtLink href='https://github.com/worldql'>GitHub</ExtLink>.
      </p>

      <Heading>Examples and Demos</Heading>
      <ul className='flex flex-col'>
        <Link href='/examples/chat'>Chat</Link>
        <Link href='/examples/cursors'>Cursors</Link>
      </ul>
    </Page>
  </>
)

export default Home
