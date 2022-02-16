import { createTheme, MuiThemeProvider, Switch } from '@material-ui/core';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import api from 'src/services/api';
import { Product, ProductSummary } from 'src/shared/types/product';
import styles from './styles.module.scss';
import switchStyles from './switch-styles.module.scss';

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

  const [count, setCount] = useState(0);

  useEffect(() => {
    const index = products.findIndex(product => product._id === item._id);

    const updateProducts = products;

    updateProducts[index].is_active = item.is_active;

    if (count === 0 && updateProducts[index].checked == undefined) {
      setCount(1);
      updateProducts[index].checked = false;
    }

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

      await api.get(`/product/${id}`, {
        headers: {
          authorization: userInfo.token,
          shop_id: userInfo.shop_id,
        }
      }).then(response => {
        console.log(response.data as Product)

        let product = response.data as Product

        const variations = product.variations.map(v => {
          v.stock = 0

          return v
        })

        variations.forEach(v => {
          if (v._id) {
            api.patch(`/product/${id}/variation/${v._id}`,
              { stock: v.stock },
              {
                headers: {
                  authorization: userInfo.token,
                  shop_id: userInfo.shop_id,
                }
              }).catch(err => {
                console.log(err)
              })

            v.stock = 0
            item.stock = 0
          }
        })
      }).catch(err => {
        console.log(err)
      })
    }
  }, [isAvailable, disabledActions]);

  return (
    <div id={styles.switchCell}>
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
    </div>
  )
}

export default ProductTableItem;
