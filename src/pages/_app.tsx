import { NextPageContext } from 'next'
import { AppProps, AppContext } from 'next/app'

import '@public/styles/theme.scss'

import { AuthProvider } from '../hooks/auth';

import Layout from '../components/Layout/layout'
import SignIn from './index'
import { redirect } from 'next/dist/next-server/server/api-utils';

// Will be called once for every metric that has to be reported.
// These metrics can be sent to any analytics service
export function reportWebVitals(metric: any) {
  console.log(metric)
}

function MyApp({ Component, pageProps }: AppProps) {

  return (
    <AuthProvider>
      { Component === SignIn ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}

    </AuthProvider>
  )
}

MyApp.getInitialProps = async (props: AppContext) => {

  const { Component, ctx }: AppContext = props
  const { req, res }: NextPageContext = ctx

  let pageProps: any = {}
  if (Component.getInitialProps)
    pageProps = await Component.getInitialProps(ctx)

  return { pageProps }
}

export default MyApp
