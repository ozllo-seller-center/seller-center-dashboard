import React, { ButtonHTMLAttributes } from 'react';

import styles from './styles.module.scss';

interface MarketplaceButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  name: string,
  url: string,
  image: string,
}

const MarketplaceButton: React.FC<MarketplaceButtonProps> = ({ name, url, image, ...rest }) => {
  return (
    <button
      type='button'
      className={styles.marketplaceButton}
      onClick={() => {
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer')

        if (newWindow)
          newWindow.opener = null
      }}
      {...rest}
    >
      <img src={image} alt={name} />
    </button>
  )
}

export default MarketplaceButton;
