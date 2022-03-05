import React from 'react';

import styles from './styles.module.scss';

const Loader: React.FC = () => (
  <div className={styles.loader}>
    <div className={styles.loaderRing}>
      <div />
      <div />
      <div />
      <div />
    </div>
  </div>
);

export default Loader;
