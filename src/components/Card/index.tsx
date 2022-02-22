import Link from 'next/link';
import React, { ButtonHTMLAttributes } from 'react';

import styles from './styles.module.scss';

interface CardProps {
  title: string;
  reference: string;
  imgSrc: string;
}

const Card: React.FC<CardProps> = ({ title, imgSrc, reference, ...rest }) => {
  return (
    // "card text-center">
    <div className={styles.card}>
      <img src={imgSrc} alt={title} className="card-img-top" />
      <div className={styles.cardBody}>
        <h4 className={styles.cardTitle}>{title}</h4>

        <p className={styles.cardText.concat(" text-secondary")} />

        <Link href={`/integrations/platform/${reference}`}>
          <a href="#" className={styles.cardButton}>Inserção de dados para integração</a>
        </Link>
      </div>
    </div >
  );
}

export default Card;
