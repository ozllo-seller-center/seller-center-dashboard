import { GetStaticProps } from 'next'

const Home = () => (
  <div className='main'>
    <h1>
      This is a Next Application
    </h1>
    <p>{process.env.NEXT_PUBLIC_HELLO}</p>
    <p>We are running in {process.env.NODE_ENV} mode</p>
  </div>
)

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  }
}

export default Home
