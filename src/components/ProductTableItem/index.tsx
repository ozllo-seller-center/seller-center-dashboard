import { createTheme, MuiThemeProvider, Switch } from '@material-ui/core';
import React, { useCallback, useState } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';

import router, { useRouter } from 'next/router';

import { FiCameraOff, FiEdit } from 'react-icons/fi';
import api from 'src/services/api';
import { ProductSummary } from 'src/shared/types/product';

import styles from './styles.module.scss'
import switchStyles from './switch-styles.module.scss'

const theme = createTheme({
  palette: {
    primary: {
      main: '#E2E2E2'
    },
    secondary: {
      main: '#FFFFFF'
    }
  },
});

interface ProductItemProps {
  products: ProductSummary[],
  setProducts: Function,
  item: ProductSummary,
  userInfo: {
    token: string,
    shop_id: string,
  }
  disabledActions?: boolean,
  setDisabledActions?: Function,
}

const ProductTableItem: React.FC<ProductItemProps> = ({ item, products, setProducts, userInfo, disabledActions, setDisabledActions }) => {
  const [isAvailable, setIsAvailable] = useState(item.is_active);

  const itemRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  useEffect(() => {
    const index = products.findIndex(product => product._id === item._id);

    const updateProducts = products;

    updateProducts[index].is_active = item.is_active;

    setProducts(updateProducts);
  }, [item])

  const handleAvailability = useCallback(async (id: string) => {
    if (!disabledActions) {
      await api.patch(`/product/${id}`, {
        is_active: !isAvailable
      }, {
        headers: {
          authorization: userInfo.token,
          shop_id: userInfo.shop_id,
        }
      }).then(response => {
        item.is_active = response.data.is_active;

        setIsAvailable(response.data.is_active)
      }).catch(err => {
        console.log(err)
      })
    }
  }, [isAvailable, disabledActions]);

  return (
    <tr className={styles.tableItem} key={item._id}>
      <td id={styles.imgCell} >
        {!!item.images ? <img src={item.images[0]} alt={item.name} /> : <FiCameraOff />}
      </td>
      <td id={styles.nameCell}>
        {item.name}
      </td>
      <td>
        {item.brand}
      </td>
      <td>
        {item.sku}
      </td>
      <td id={styles.valueCell}>
        {
          new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }
          ).format(item.price)
        }
      </td>
      <td className={item.stock <= 0 ? styles.redText : ''}>
        {new Intl.NumberFormat('pt-BR').format(item.stock)}
      </td>
      <td id={styles.switchCell}>
        <MuiThemeProvider theme={theme}>
          <Switch
            inputRef={itemRef}
            checked={item.is_active}
            onClick={() => {
              handleAvailability(item._id)

              if (!disabledActions && !!setDisabledActions) {
                setDisabledActions(true)

                setTimeout(() => {
                  setDisabledActions(false)
                }, 1500)
              }
            }}
            classes={
              disabledActions ?
                {
                  root: switchStyles.root,
                  thumb: switchStyles.thumbDisabled,
                  track: switchStyles.trackDisabled,
                  checked: switchStyles.checked,
                }
                :
                {
                  root: switchStyles.root,
                  thumb: isAvailable ? switchStyles.thumb : switchStyles.thumbUnchecked,
                  track: isAvailable ? switchStyles.track : switchStyles.trackUnchecked,
                  checked: switchStyles.checked,
                }
            }
          />
        </MuiThemeProvider>
        <span className={styles.switchSubtitle}>{isAvailable ? 'Ativado' : 'Desativado'}</span>
      </td>
      <td id={styles.editCell}>
        <div onClick={() => {
          router.push({
            pathname: 'products/edit',
            query: {
              id: item._id,
            }
          })
        }}>
          <FiEdit />
          <span> Editar </span>
        </div>
      </td>
    </tr>
  )
}

export default ProductTableItem;
