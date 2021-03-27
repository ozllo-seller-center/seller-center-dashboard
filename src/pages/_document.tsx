import Document, { Head, Html, Main, NextScript } from 'next/document'
import { IS_PRODUCTION_ENV } from 'utils/consts'

export default class extends Document {
  render() {
    return (
      <Html lang='pt-br'>
        <Head>
          {IS_PRODUCTION_ENV && (
            <>
              {/*
              // Scripts that may be used in production
              // Analytics, etc...
              */}
            </>
          )}
          <meta charSet='utf-8' />
          <meta name='author' content='CleberW3b - Cléber Oliveira' key='author' />
          <meta name='robots' content='noindex' />
          <meta name='revisit-after' content='1 day' />
          <meta name='language' content='Portuguese' />
          <meta name='generator' content='N/A' />
          <meta name='theme-color' content='#000000' />
          <link rel='icon' href='/favicon.ico' />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}