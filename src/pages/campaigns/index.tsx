import styles from './styles.module.scss';
import { Container } from '@mui/material';
import React, { useEffect } from 'react';
import { useLoading } from 'src/hooks/loading';
import Loader from 'src/components/Loader';

const Campaigns = () => {
  const { isLoading, setLoading } = useLoading();

  useEffect(() => {
    setLoading(true);
  }, [setLoading]);

  return (
    <div className={styles.container}>
      <Container maxWidth="lg">
        <script src="https://static.airtable.com/js/embed/embed_snippet_v1.js"></script>
        <iframe
          className="airtable-embed airtable-dynamic-height"
          src="https://airtable.com/embed/shrRuIRdHXKXtKcYB?backgroundColor=green"
          frameBorder="0"
          width="100%"
          height="1402"
          style={{
            background: 'transparent',
            border: '1px solid #ccc',
          }}
          onLoad={() => setLoading(false)}
        ></iframe>
      </Container>
      {isLoading && (
        <div className={styles.loadingContainer}>
          <Loader />
        </div>
      )}
    </div>
  );
};

export default Campaigns;
