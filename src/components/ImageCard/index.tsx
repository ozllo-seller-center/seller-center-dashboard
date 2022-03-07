import React from 'react';
import { FiX } from 'react-icons/fi';

import styles from './styles.module.scss';

interface ImageCardProps extends React.HTMLAttributes<HTMLDivElement> {
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  imgUrl: string;
  showOnly?: boolean;
  highlight?: boolean;
}

const ImageCard: React.FC<ImageCardProps> = ({
  onClick, highlight, imgUrl, showOnly, ...rest
}) => (
  <div className={styles.imageCard} {...rest}>
    <img src={imgUrl} alt="Product" />
    <div className={styles.imageDelete} onClick={onClick}>
      {!showOnly && <FiX />}
    </div>
  </div>
);

export default ImageCard;
