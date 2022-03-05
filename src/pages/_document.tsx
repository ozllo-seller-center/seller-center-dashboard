import Document, {
  Head, Html, Main, NextScript,
} from 'next/document';
import { IS_PRODUCTION_ENV } from '../utils/consts';

export default class extends Document {
  render() {
    return (
      <Html lang="pt-br">
        <Head>
          <meta charSet="utf-8" />
          <meta name="author" content="CleberW3b - Cléber Oliveira" key="author" />
          <meta name="robots" content="noindex" />
          <meta name="revisit-after" content="1 day" />
          <meta name="language" content="Portuguese" />
          <meta name="generator" content="N/A" />
          <meta name="theme-color" content="#000000" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link href="https://fonts.googleapis.com/css2?family=Mulish:wght@300;400;700&display=swap" rel="stylesheet" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
