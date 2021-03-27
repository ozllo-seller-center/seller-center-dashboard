import { FC } from 'react'
import Nav from './nav'
import Footer from './footer'

const Layout: FC = ( { children } ) => (
  <>
    <Nav />
    {children}
    <Footer />
  </>
)

export default Layout