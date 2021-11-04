import type { AppProps } from 'next/app'
import 'tailwindcss/tailwind.css'

const NextApp = ({ Component, pageProps }: AppProps) => (
  <>
    <style jsx global>
      {`
        html {
          height: 100vh;
        }

        body,
        #__next {
          height: 100%;
        }
      `}
    </style>

    <Component {...pageProps} />
  </>
)

export default NextApp
