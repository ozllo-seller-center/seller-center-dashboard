import { createTheme, MuiThemeProvider, Switch } from '@material-ui/core';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiCameraOff, FiEdit } from 'react-icons/fi';
import api from 'src/services/api';
import {
  Product,
  ProductSummary,
  Validation_Errors,
} from 'src/shared/types/product';
import styles from './styles.module.scss';
import switchStyles from './switch-styles.module.scss';

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

interface ProductItemProps {
  products: ProductSummary[];
  setProducts: React.Dispatch<any>;
  item: ProductSummary;
  userInfo: {
    token: string;
    shop_id: string;
  };
  handleCheckboxChange: (id: any) => Promise<void>;
  disabledActions?: boolean;
  setDisabledActions?: React.Dispatch<any>;
}

const ProductTableItem: React.FC<ProductItemProps> = ({
  item,
  products,
  setProducts,
  userInfo,
  disabledActions,
  setDisabledActions,
  handleCheckboxChange,
}) => {
  const [isAvailable, setIsAvailable] = useState(item.is_active);

  const itemRef = useRef<HTMLInputElement>(null);

  const [count, setCount] = useState(0);

  const router = useRouter();

  const [validationErrors, setValidationErrors] = useState<Validation_Errors[]>(
    [],
  );

  useEffect(() => {
    const index = products.findIndex(product => product._id === item._id);

    const updateProducts = products;

    updateProducts[index].is_active = item.is_active;

    if (count === 0 && updateProducts[index].checked === undefined) {
      setCount(1);
      updateProducts[index].checked = false;
    }

    setProducts(updateProducts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  const handleAvailability = useCallback(
    async (id: string) => {
      if (!disabledActions) {
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

        await api
          .get(`/product/${id}`, {
            headers: {
              authorization: userInfo.token,
              shop_id: userInfo.shop_id,
            },
          })
          .then(response => {
            console.log(response.data as Product);

            const product = response.data as Product;

            const variations = product.variations.map(v => {
              v.stock = 0;

              return v;
            });

            variations.forEach(v => {
              if (v._id) {
                api
                  .patch(
                    `/product/${id}/variation/${v._id}`,
                    { stock: v.stock },
                    {
                      headers: {
                        authorization: userInfo.token,
                        shop_id: userInfo.shop_id,
                      },
                    },
                  )
                  .catch(err => {
                    console.log(err);
                  });

                v.stock = 0;
                item.stock = 0;
              }
            });
          })
          .catch(err => {
            console.log(err);
          });
      }
    },
    [disabledActions, isAvailable, userInfo.token, userInfo.shop_id, item],
  );

  return (
    <tr key={item._id} className={styles.tableItem}>
      <td>
        <input
          className={styles.checkboxDados}
          type="checkbox"
          onChange={() => handleCheckboxChange(item._id)}
          checked={item.checked}
          key={item._id}
        />
      </td>
      <td id={styles.imgCell}>
        {item.images ? (
          <img src={item.images[0]} alt={item.name} />
        ) : (
          <FiCameraOff />
        )}
      </td>
      <td id={styles.nameCell}>{item.name}</td>
      <td id={styles.nameCell}>{item.brand}</td>
      <td id={styles.nameCell}>{item.sku}</td>
      <td id={styles.valueCell}>
        {new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(item.price)}
      </td>
      <td className={item.stock <= 0 ? styles.redText : styles.nameCell}>
        {new Intl.NumberFormat('pt-BR').format(item.stock)}
      </td>
      <td id={styles.switchCell}>
        {item?.validation?.errors?.length !== 0 && (
          <>
            <span className={styles.switchSubtitle}>Faltam</span>
            <div className={styles.validationCount}>
              {item?.validation?.errors?.length ?? '?'}
            </div>
            <span className={styles.switchSubtitle}>Campos</span>
          </>
        )}
        {item?.validation?.errors.length === 0 && (
          <>
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
          </>
        )}
      </td>
      <td id={styles.editCell}>
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
      </td>
    </tr>
  );
};

export default ProductTableItem;
