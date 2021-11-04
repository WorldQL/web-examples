import type { FC } from 'react'

interface Props {
  href: string
}

export const ExtLink: FC<Props> = ({ href, children }) => (
  <a
    href={href}
    target='_blank'
    rel='noopener noreferrer'
    className='motion-safe:transition-colors text-purple-700 hover:text-purple-900 dark:hover:text-white'
  >
    {children}
  </a>
)
