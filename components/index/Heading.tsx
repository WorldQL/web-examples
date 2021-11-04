import type { FC } from 'react'

export const Heading: FC = ({ children }) => (
  <h2 className='text-xl font-semibold mt-4 first:mt-0'>{children}</h2>
)
