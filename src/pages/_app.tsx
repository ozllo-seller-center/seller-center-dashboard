import { NextPageContext } from 'next';
import { AppProps, AppContext } from 'next/app';

import '../../public/styles/theme.scss';

import { ModalMessageProvider } from 'src/hooks/message';
import { AuthProvider } from '../hooks/auth';
import { LoadingProvider } from '../hooks/loading';

import Layout from '../components/Screen';
import SignUp from './signup';
import SignIn from './index';
import Verify from './verify/[token]';
import ForgotPassword from './forgot-password';
import ResetPassword from './resetPassword/[token]';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      {Component === SignIn ||
      Component === SignUp ||
      Component === Verify ||
      Component === ResetPassword ||
      Component === ForgotPassword ? (
        <LoadingProvider>
          <Component {...pageProps} />
        </LoadingProvider>
      ) : (
        <Layout>
          <LoadingProvider>
            <ModalMessageProvider>
              <Component {...pageProps} />
            </ModalMessageProvider>
          </LoadingProvider>
        </Layout>
      )}
    </AuthProvider>
  );
}

MyApp.getInitialProps = async (props: AppContext) => {
  const { Component, ctx }: AppContext = props;
  const { req, res }: NextPageContext = ctx;

  let pageProps: any = {};
  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }

  return { pageProps };
};

export default MyApp;
