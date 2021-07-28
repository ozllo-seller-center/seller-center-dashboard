import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GetStaticProps } from "next";
import { useRouter } from 'next/router';
import { MuiThemeProvider, createTheme, Switch } from '@material-ui/core';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import { format } from 'date-fns';
import { FiSearch, FiCameraOff, FiEdit } from 'react-icons/fi';

import api from 'src/services/api';
import { useAuth, User } from 'src/hooks/auth';
import BulletedButton from '../../components/BulletedButton';
import FilterInput from '../../components/FilterInput';

import { ProductSummary as Product } from 'src/shared/types/product';

import styles from './styles.module.scss';
import ProductItemCard from 'src/components/ProductItemCard';
interface SearchFormData {
  search: string;
}
interface ProductsProps {
  products: Product[];
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

  const router = useRouter();

  const { token, user, updateUser } = useAuth();

  useEffect(() => {
    if (!!user) {
      api.get('/product', {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        }
      }).then(response => {
        // console.log(response.data)

        let productsDto = response.data as Product[];

        productsDto = productsDto.map(product => {
          let stockCount = 0;

          if (!!product.variations && Array.isArray(product.variations)) {
            product.variations.forEach(variation => {
              stockCount += Number(variation.stock);
            })
          }

          product.stock = stockCount;

          return product;
        })


        setProducts(productsDto)
        setItems(productsDto)
      }).catch((error) => {
        console.log(error)
        setProducts([]);
        setItems([])
      })
    }
  }, [user]);

  useEffect(() => {
    !!userFromApi && updateUser({ ...user, shopInfo: { ...user.shopInfo, _id: userFromApi.shopInfo._id } })
  }, [userFromApi])

  useEffect(() => {
    setLoading(true);


    setItems(products.filter(product => {
      return (search === '' || product.name.toLowerCase().includes(search.toLowerCase()));
    }));

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

  const handleAvailability = useCallback(async (id: string) => {
    const index = products.findIndex(product => product._id === id);

    await api.patch(`/product/${id}`, {
      isActive: !products[index].is_active
    }).then(response => {
      // products[index].isActive === response.data.isActive;
    }).catch(err => {
      console.log(err)
    })
  }, [items, products]);

  return (
    <div className={styles.productsContainer}>
      <div className={styles.productsHeader}>
        <BulletedButton
          onClick={() => { router.push('/products-mobile') }}
          isActive>
          Meus produtos
        </BulletedButton>
        <BulletedButton
          onClick={() => { router.push('/products/create') }}>
          Criar novo produto
        </BulletedButton>
        <BulletedButton
          onClick={() => { router.push('/products/import') }}>
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
                autoComplete="off" />
            </Form>
          </div>
        </div>
        {items.length > 0 ? (
          items.map((item, i) => (
            <ProductItemCard
              products={products}
              setProducts={setProducts}
              item={item}
              userInfo={{ token, shop_id: !!user ? !!user.shopInfo._id ? user.shopInfo._id : '' : '' }}
            />
          ))
        ) : (
          <span className={styles.emptyList}> Nenhum item foi encontrado </span>
        )}
      </div>
    </div>
  )
}

export const getInitialProps = async () => {
  const user = api.get('/account/detail').then(response => {
    return response.data as User;
  }).catch(err => {
    console.log(err)
  });

  return ({
    props: {
      userFromApi: user
    },
    revalidate: 10
  });
}

export default Products;
