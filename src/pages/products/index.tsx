import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { MuiThemeProvider, createMuiTheme, Switch } from '@material-ui/core';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import { FiSearch, FiCameraOff, FiCheck, FiX } from 'react-icons/fi';

import api from 'src/services/api';
import { useAuth, User } from 'src/hooks/auth';
import BulletedButton from '../../components/BulletedButton';
import FilterInput from '../../components/FilterInput';

import { ProductSummary as Product } from 'src/shared/types/product';

import styles from './styles.module.scss';

import { useLoading } from 'src/hooks/loading';
import { useModalMessage } from 'src/hooks/message';
import { Loader } from 'src/components/Loader';
import MessageModal from 'src/components/MessageModal';
import ProductTableItem from 'src/components/ProductTableItem';

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

  const { isLoading, setLoading } = useLoading();
  const { showModalMessage: showMessage, modalMessage, handleModalMessage } = useModalMessage();

  const { token, user, updateUser } = useAuth();

  useEffect(() => {
    // !!userFromApi && updateUser({ ...user, shopInfo: { ...user.shopInfo, _id: userFromApi.shopInfo._id } })
  }, [userFromApi])

  // const itemsRef = useMemo(() => Array(items.length).fill(0).map(i => React.createRef<HTMLInputElement>()), [items]);

  const formRef = useRef<FormHandles>(null);
  const [error, setError] = useState('');

  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    api.get('/account/detail').then(response => {
      updateUser({ ...user, shopInfo: { ...user.shopInfo, _id: response.data.shopInfo._id } })
      setLoading(false);
      // return response.data as User;
    }).catch(err => {
      console.log(err)
      setLoading(false);
    });
  }, [])

  useEffect(() => {
    setLoading(true);

    setItems(products.filter(product => {
      return (!!product.name && (search === '' || product.name.toLowerCase().includes(search.toLowerCase())));
    }));

    setLoading(false);
  }, [search, products]);

  useEffect(() => {
    if (!!user) {
      setLoading(true);

      api.get('/product', {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        }
      }).then(response => {

        let productsDto = response.data as Product[];

        productsDto = productsDto.map(product => {
          let stockCount: number = 0;

          if (!!product.variations) {
            product.variations.forEach(variation => {
              stockCount = stockCount + Number(variation.stock);
            })
          }

          product.stock = stockCount;

          return product;
        })


        setProducts(productsDto)
        setItems(productsDto)

        setLoading(false);
      }).catch((error) => {
        console.log(error)
        setProducts([]);
        setItems([])

        setLoading(false);
      })
    }
  }, [user]);

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

  const handleModalVisibility = useCallback(() => {
    handleModalMessage(false);
  }, [])

  return (
    <div className={styles.productsContainer}>
      <div className={styles.productsHeader}>
        <BulletedButton
          onClick={() => { router.push('/products') }}
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
        <div className={styles.tableContainer}>
          {items.length > 0 ? (
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th>Foto</th>
                  <th>Nome do produto</th>
                  <th>Marca</th>
                  <th>SKU</th>
                  <th>Valor</th>
                  <th>Estoque</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {items.map((item, i) => (
                  <ProductTableItem
                    key={i}
                    item={item}
                    products={products}
                    setProducts={setProducts}
                    userInfo={{
                      token,
                      shop_id: !user ? '' : !!user.shopInfo._id ? user.shopInfo._id : '',
                    }}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <span className={styles.emptyList}> Nenhum item foi encontrado </span>
          )}
        </div>
      </div>
      {
        isLoading && (
          <div className={styles.loadingContainer}>
            <Loader />
          </div>
        )
      }
      {
        showMessage && (
          <MessageModal handleVisibility={handleModalVisibility}>
            <div className={styles.modalContent}>
              {modalMessage.type === 'success' ? <FiCheck style={{ color: 'var(--green-100)' }} /> : <FiX style={{ color: 'var(--red-100)' }} />}
              <p>{modalMessage.title}</p>
              <p>{modalMessage.message}</p>
            </div>
          </MessageModal>
        )
      }
    </div>
  )
}

export const getInitialProps = async () => {
  return ({
    props: {
    },
    revalidate: 10
  });
}

export default Products;
