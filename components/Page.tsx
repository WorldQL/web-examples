import Link from 'next/link'
import type { FC } from 'react'

interface Props {
  title: string
  subtitle?: string
  href?: string
}

export const Page: FC<Props> = ({ title, subtitle, href, children }) => (
  // <main className='w-full max-h-screen max-w-5xl mx-auto'>
  //   <h1 className='font-bold text-2xl'>{title}</h1>
  //   {subtitle && <p className='text-sm mt-2'>{subtitle}</p>}

  //   <hr className='border-gray-400 mt-4' />

  //   <div className='w-full h-full mt-4 bg-red-500'>{children}</div>
  // </main>

  <main className='w-full h-full max-w-5xl mx-auto px-6 flex flex-col'>
    <h1 className='font-bold text-2xl mt-6'>
      {href && (
        <>
          <Link href={href}>&lt;</Link>&nbsp;
        </>
      )}

      {title}
    </h1>
    {subtitle && <p className='text-sm mt-2'>{subtitle}</p>}

    <hr className='border-gray-400 mt-4' />
    <div className='w-full flex-1 mt-4 mb-6'>{children}</div>
  </main>
)
