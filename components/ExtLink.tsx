import type { FC } from 'react'

interface Props {
  href: string
}

export const ExtLink: FC<Props> = ({ href, children }) => (
  <a
    href={href}
    target='_blank'
    rel='noopener noreferrer'
    className='motion-safe:transition-colors text-violet-700 hover:text-violet-900 dark:hover:text-white'
  >
    {children}
  </a>
)
