import { GetStaticProps } from 'next';

const Home = () => (
  <h1>Hello World</h1>
);

export const getStaticProps: GetStaticProps = async () => ({
  props: {},
});

export default Home;
