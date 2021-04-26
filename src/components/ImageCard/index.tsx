import React from 'react';
import { FiX } from 'react-icons/fi';

import styles from './styles.module.scss';

interface ImageCardProps {
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  imgUrl: string;
}

const ImageCard: React.FC<ImageCardProps> = ({ onClick, imgUrl, ...rest }) => {
  return (
    <div className={styles.imageCard}>
      <img src={imgUrl} alt="Product Image" />
      <div className={styles.imageDelete} onClick={onClick}>
        <FiX />
      </div>
    </div>
  )
}

export default ImageCard;
