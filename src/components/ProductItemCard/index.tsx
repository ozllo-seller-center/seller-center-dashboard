import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createTheme, MuiThemeProvider, Switch } from '@material-ui/core';

import { ProductSummary } from 'src/shared/types/product';
import { FiCameraOff, FiEdit } from 'react-icons/fi';
import { useRouter } from 'next/router';
import api from 'src/services/api';
import switchStyles from './switch-styles.module.scss';
import styles from './styles.module.scss';

const theme = createTheme({
  palette: {
    primary: {
      main: '#E2E2E2',
    },
    secondary: {
      main: '#FFFFFF',
    },
  },
});

interface ProductItemCardProps {
  products: ProductSummary[];
  setProducts: React.Dispatch<any>;
  item: ProductSummary;
  userInfo: {
    token: string;
    shop_id: string;
  };
  disabledActions?: boolean;
  setDisabledActions?: React.Dispatch<any>;
}

const ProductItemCard: React.FC<ProductItemCardProps> = ({
  item,
  products,
  setProducts,
  userInfo,
  disabledActions,
  setDisabledActions,
}) => {
  const [isAvailable, setIsAvailable] = useState(item.is_active);

  const itemRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  useEffect(() => {
    const index = products.findIndex(product => product._id === item._id);

    const updateProducts = products;

    updateProducts[index].is_active = item.is_active;

    setProducts(updateProducts);
  }, [item]);

  const handleAvailability = useCallback(
    async (id: string) => {
      await api
        .patch(
          `/product/${id}`,
          {
            is_active: !isAvailable,
          },
          {
            headers: {
              authorization: userInfo.token,
              shop_id: userInfo.shop_id,
            },
          },
        )
        .then(response => {
          item.is_active = response.data.is_active;

          setIsAvailable(response.data.is_active);
        })
        .catch(err => {
          console.log(err);
        });
    },
    [isAvailable],
  );

  return (
    <div className={styles.itemCard} key={item._id}>
      <div className={styles.cardBody}>
        <div className={styles.cardImg}>
          {item.images ? (
            <img src={item.images[0]} alt={item.name} />
          ) : (
            <FiCameraOff />
          )}
        </div>
        <div className={styles.itemInfo}>
          <span className={styles.itemName}>{item.name}</span>
          <div>
            SKU: <b>{item.sku}</b>
          </div>
          <div>
            Marca: <b>{item.brand}</b>
          </div>
          <div className={styles.value}>
            <span>
              Valor:{' '}
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(item.price)}
            </span>
          </div>
        </div>
        <div className={styles.switchContainer}>
          <MuiThemeProvider theme={theme}>
            <Switch
              inputRef={itemRef}
              checked={item.is_active}
              onClick={() => {
                handleAvailability(item._id);

                if (!disabledActions && !!setDisabledActions) {
                  setDisabledActions(true);

                  setTimeout(() => {
                    setDisabledActions(false);
                  }, 1500);
                }
              }}
              classes={
                disabledActions
                  ? {
                      root: switchStyles.root,
                      thumb: switchStyles.thumbDisabled,
                      track: switchStyles.trackDisabled,
                      checked: switchStyles.checked,
                    }
                  : {
                      root: switchStyles.root,
                      thumb: isAvailable
                        ? switchStyles.thumb
                        : switchStyles.thumbUnchecked,
                      track: isAvailable
                        ? switchStyles.track
                        : switchStyles.trackUnchecked,
                      checked: switchStyles.checked,
                    }
              }
            />
          </MuiThemeProvider>
          <span className={styles.switchSubtitle}>
            {isAvailable ? 'Ativado' : 'Desativado'}
          </span>
          <div className={styles.stockContainer}>
            <span className={item.stock > 0 ? styles.stock : styles.outStock}>
              {new Intl.NumberFormat('pt-BR').format(item.stock)}
            </span>
            <span>Em estoque</span>
          </div>
        </div>
      </div>
      <div className={styles.cardDivider} />
      <div className={styles.cardFooter}>
        <div
          onClick={() => {
            router.push({
              pathname: 'products/edit',
              query: {
                id: item._id,
              },
            });
          }}
        >
          <FiEdit />
          <span> Editar </span>
        </div>
      </div>
    </div>
  );
};

export default ProductItemCard;
