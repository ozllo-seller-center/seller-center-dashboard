import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { MuiThemeProvider, createTheme, Switch } from '@material-ui/core';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import { format } from 'date-fns';
import { FiSearch, FiCameraOff, FiEdit } from 'react-icons/fi';

import api from 'src/services/api';
import { useAuth, User } from 'src/hooks/auth';
import { ProductSummary as Product } from 'src/shared/types/product';
import ProductItemCard from 'src/components/ProductItemCard';
import BulletedButton from '../../components/BulletedButton';
import FilterInput from '../../components/FilterInput';

import styles from './styles.module.scss';

interface SearchFormData {
  search: string;
}

interface ProductsProps {
  userFromApi: User;
}

export function Products({ userFromApi }: ProductsProps) {
  const [products, setProducts] = useState([] as Product[]);
  const [items, setItems] = useState([] as Product[]);
  const [search, setSeacrh] = useState('');
  const [loading, setLoading] = useState(false);

  const formRef = useRef<FormHandles>(null);
  const [error, setError] = useState('');

  const [disabledActions, setDisableActions] = useState(false);

  const router = useRouter();

  const { token, user, updateUser } = useAuth();

  useEffect(() => {
    if (user) {
      api.get('/product', {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        },
      }).then((response) => {
        // console.log(response.data)

        let productsDto = response.data as Product[];

        productsDto = productsDto.map((product) => {
          let stockCount = 0;

          if (!!product.variations && Array.isArray(product.variations)) {
            product.variations.forEach((variation) => {
              stockCount += Number(variation.stock);
            });
          }

          product.stock = stockCount;

          return product;
        });

        setProducts(productsDto);
        setItems(productsDto);
      }).catch((err) => {
        console.log(err);

        setProducts([]);
        setItems([]);
      });
    }
  }, [user]);

  useEffect(() => {
    if (userFromApi) { updateUser({ ...user, shopInfo: { ...user.shopInfo, _id: userFromApi.shopInfo._id } }); }
  }, [userFromApi]);

  useEffect(() => {
    setLoading(true);

    setItems(products.filter((product) => (search === '' || product.name.toLowerCase().includes(search.toLowerCase()))));

    setLoading(false);
  }, [search, products]);

  const handleSubmit = useCallback(
    async (data: SearchFormData) => {
      try {
        formRef.current?.setErrors({});

        if (data.search !== search) {
          setSeacrh(data.search);
        }
      } catch (err) {
        setError('Ocorreu um erro ao fazer login, cheque as credenciais.');
      }
    },
    [search],
  );

  return (
    <div className={styles.productsContainer}>
      <div className={styles.productsHeader}>
        <BulletedButton
          onClick={() => { router.push('/products-mobile'); }}
          isActive
        >
          Meus produtos
        </BulletedButton>
        <BulletedButton
          onClick={() => { router.push('/products/create'); }}
        >
          Criar novo produto
        </BulletedButton>
        <BulletedButton
          onClick={() => { router.push('/products/import'); }}
        >
          Importar ou exportar
        </BulletedButton>
      </div>
      <div className={styles.divider} />
      <div className={styles.productsContent}>
        <div className={styles.productsOptions}>
          <div className={styles.contentFilters}>
            <Form ref={formRef} onSubmit={handleSubmit}>
              <FilterInput
                name="search"
                icon={FiSearch}
                placeholder="Pesquise um produto..."
                autoComplete="off"
              />
            </Form>
          </div>
        </div>
        {items.length > 0 ? (
          items.map((item, i) => (
            <ProductItemCard
              products={products}
              setProducts={setProducts}
              item={item}
              userInfo={{ token, shop_id: (!user || !user.shopInfo._id) ? '' : user.shopInfo._id }}
            />
          ))
        ) : (
          <span className={styles.emptyList}> Nenhum item foi encontrado </span>
        )}
      </div>
    </div>
  );
}

export const getInitialProps = async () => {
  const user = api.get('/account/detail').then((response) => response.data as User).catch((err) => {
    console.log(err);
  });

  return ({
    props: {
      userFromApi: user,
    },
    revalidate: 10,
  });
};

export default Products;
