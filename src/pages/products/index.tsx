import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GetStaticProps } from "next";
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import { isSameDay, isSameWeek, isSameMonth, parse, format } from 'date-fns';
import { FiSearch, FiCameraOff, FiEdit } from 'react-icons/fi';

import BulletedButton from '@components/BulletedButton';
import Button from '@components/Button';
import FilterInput from '@components/FilterInput';
import Switch from '@components/Switch';

import styles from './styles.module.scss';
import { useRouter } from 'next/router';

enum ProductStatus {
  Ativado = 0,
  Desativado = 1,
}

type Product = {
  id: string;
  status: ProductStatus;
  name: string;
  brand: string;
  sku: string;
  date: string;
  value: number;
  stock: number;
  image?: string;
}

interface SearchFormData {
  search: string;
}

interface ProductsProps {
  products: Product[];
}

export function Products({ products }: ProductsProps) {
  const [items, setItems] = useState([] as Product[]);
  const [search, setSeacrh] = useState('');
  const [loading, setLoading] = useState(false);

  const formRef = useRef<FormHandles>(null);
  const [error, setError] = useState('');

  const router = useRouter();

  useEffect(() => {
    setLoading(true);


    setItems(products.filter(product => {
      return (search === '' || product.name.toLowerCase().includes(search.toLowerCase()));
    }));

    setLoading(false);
  }, [search]);


  const handleSubmit = useCallback(
    async (data: SearchFormData) => {
      console.log(`Search: ${search} | ${data.search}`)
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
          onClick={() => { router.push('/products') }}
          isActive>
          Número de Pedidos
        </BulletedButton>
        <BulletedButton
          onClick={() => { router.push('/products/sent') }}>
          Envios
        </BulletedButton>
        <BulletedButton
          onClick={() => { router.push('/products/order-products') }}>
          Produtos
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
                  <th>Data</th>
                  <th>Valor</th>
                  <th>Estoque</th>
                  <th>Estado</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {items.map(item =>
                  <tr className={styles.tableItem} key={item.id}>
                    <td id={styles.imgCell} >
                      {item.image ? <img src={item.image} alt={item.name} /> : <FiCameraOff />}
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
                    <td id={styles.dateCell}>
                      {item.date}
                    </td>
                    <td id={styles.valueCell}>
                      {
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }
                        ).format(item.value)
                      }
                    </td>
                    <td className={item.stock <= 0 ? styles.redText : ''}>
                      {item.stock}
                    </td>
                    <td>
                      <Switch
                        onColor="#88DDA5"
                        offColor="#a8a8b3"
                        // onBgColor="#FFFFFF"
                        // offBgColor="#FFFFFF"
                        handleToggle={() => {
                          console.log(`(${item.id}) - Before: ${item.status}`)
                          item.status = item.status === ProductStatus.Ativado ? ProductStatus.Desativado : ProductStatus.Ativado;
                          console.log(`(${item.id}) - After: ${item.status}`)
                        }}
                        isOn={!item.status}
                      // text={item.status === ProductStatus.Ativado ? 'Ativado' : 'Desativado'}
                      />
                    </td>
                    <td id={styles.editCell}>
                      <FiEdit />
                      <label> Editar </label>
                    </td>
                  </tr>
                )
                }
              </tbody>
            </table>
          ) : (
            <span className={styles.emptyList}> Nenhum item foi encontrado </span>
          )}
        </div>
      </div>
    </div>
  )
}


const productsFromApi: Product[] = [
  {
    id: '1',
    status: ProductStatus.Ativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,
    stock: 23,
    image: 'https://images-americanas.b2w.io/produtos/01/00/img/2608684/5/2608684535_1GG.jpg'
  },
  {
    id: '2',
    status: ProductStatus.Ativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,
    stock: 23,
    image: 'https://images-americanas.b2w.io/produtos/01/00/img/2608684/5/2608684535_1GG.jpg'
  },
  {
    id: '3',
    status: ProductStatus.Ativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,
    stock: 0,
    image: ''
  },
  {
    id: '4',
    status: ProductStatus.Ativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,
    stock: 0,
    image: ''
  },
  {
    id: '5',
    status: ProductStatus.Ativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    stock: 0,
    image: ''
  },
  {
    id: '6',
    status: ProductStatus.Ativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    stock: 23,
    image: ''
  },
  {
    id: '7',
    status: ProductStatus.Ativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    stock: 23,
    image: ''
  },
  {
    id: '8',
    status: ProductStatus.Ativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    stock: 23,
    image: ''
  },
  {
    id: '9',
    status: ProductStatus.Ativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    stock: 23,
    image: ''
  },
  {
    id: '10',
    status: ProductStatus.Ativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    stock: 23,
    image: ''
  },
  {
    id: '11',
    status: ProductStatus.Ativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    stock: 23,
    image: ''
  },
  {
    id: '12',
    status: ProductStatus.Ativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '04/04/2021',
    value: 299.90,
    stock: 23,
    image: ''
  },
  {
    id: '13',
    status: ProductStatus.Desativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    stock: 0,
    image: ''
  },
  {
    id: '14',
    status: ProductStatus.Desativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '04/04/2021',
    value: 299.90,
    stock: 0,
    image: ''
  },
  {
    id: '15',
    status: ProductStatus.Desativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    stock: 23,
    image: ''
  },
  {
    id: '16',
    status: ProductStatus.Desativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '04/04/2021',
    value: 299.90,
    stock: 23,
    image: ''
  },
]

export const getStaticProps: GetStaticProps = async () => {
  return ({
    props: {
      products: productsFromApi
    },
    revalidate: 10
  });
}

export default Products;
