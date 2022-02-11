import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { MuiThemeProvider, createTheme, Switch } from '@material-ui/core';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import { FiSearch, FiCameraOff, FiCheck, FiX } from 'react-icons/fi';

import api from 'src/services/api';
import { useAuth, User } from 'src/hooks/auth';
import BulletedButton from '../../components/BulletedButton';
import FilterInput from '../../components/FilterInput';

import { ProductSummary as Product, Variation } from 'src/shared/types/product';

import styles from './styles.module.scss';

import { useLoading } from 'src/hooks/loading';
import { useModalMessage } from 'src/hooks/message';
import { Loader } from 'src/components/Loader';
import MessageModal from 'src/components/MessageModal';
import ProductTableItem from 'src/components/ProductTableItem';

import XLSX from 'xlsx';
import { Nationalities } from 'src/shared/enums/Nationalities';
import { Categories } from 'src/shared/enums/Categories';
import { Subcategories } from 'src/shared/enums/Subcategories';
import { Genres } from 'src/shared/enums/Genres';

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


  const [disabledActions, setDisableActions] = useState(false);

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

  const getVariations = (produto: any) => {
    const { variations } = produto
    return variations.map((variacao: Variation, index: number) => {

      return {
        Categoria: index == 0 ? getCategory(produto) : "",
        Nome_do_Produto: index == 0 ? produto.name : "",
        Marca: index == 0 ? produto.brand : "",
        Id_agupador: variacao._id ? variacao._id : "",
        Tamanho: variacao.size ? variacao.size : "",
        Cor_ou_Sabor: variacao.color ? variacao.color : "",
        Quantidade: variacao.stock ? variacao.stock : "",
        Descricao_do_Produto: index == 0 ? produto.description : "",
        EAN: index == 0 ? produto.ean : "",
        SKU: index == 0 ? produto.sku : "",
        Valor_cheio: index == 0 ? produto.price : "",
        Valor_promocional: index == 0 ? produto.price_discounted : "",
        Altura_embalagem: index == 0 ? produto.height : "",
        Largura_embalagem: index == 0 ? produto.width : "",
        Comprimento_embalagem: index == 0 ? produto.length : "",
        Peso_embalagem: index == 0 ? produto.weight : "",
        Genero: index == 0 ? getGender(produto) : "",
        Lactose: index == 0 ? produto.lactose_free : "",
        Gluten: index == 0 ? produto.gluten_free : "",
        ...getImages(produto.images),
        Id_Produto: index == 0 ? produto._id : "",
      }
    })
  }

  const getHeader = () => {

      return {
        Categoria: "Obrigatório",
        Nome_do_Produto: "Obrigatório",
        Marca: "Obrigatório",
        Id_agupador: "Obrigatório",
        Tamanho: "Obrigatório",
        Cor_ou_Sabor: "Obrigatório",
        Quantidade: "Obrigatório",
        Descricao_do_Produto: "Obrigatório",
        EAN: "Opcional",
        SKU: "Obrigatório",
        Valor_cheio: "Obrigatório",
        Valor_promocional: "Obrigatório",
        Altura_embalagem: "Obrigatório",
        Largura_embalagem: "Obrigatório",
        Comprimento_embalagem: "Obrigatório",
        Peso_embalagem: "Obrigatório",
        Genero: "Obrigatório",
        Lactose: "Obrigatório para Alimentos",
        Gluten: "Obrigatório para alimentos",
        ...getImagesHeader(),
        Id_Produto: "Obrigatório",
      }
  }

  const getProducts = () => {
    const produtosFiltrados = items.filter(p => p.checked)
    let produtosCSV: any = []
    produtosCSV.push(getHeader())
    produtosFiltrados.forEach(produto => {
      produtosCSV = [...produtosCSV, ...getVariations(produto)]
    });
    return produtosCSV
  }

  const getGender = (produto: any) => {
    if (Genres.Masculino === produto.gender.trim()) {
      return Genres.M;
    } else if (Genres.Feminino === produto.gender.trim()) {
      return Genres.F;
    } else if (Genres.Unissex === produto.gender.trim()) {
      return Genres.U;
    }
    return "";
  }

  const getCategory = (produto: any) => {
    let nacionalidade = Nationalities[produto.nationality]; // nacionalidade
    let categoria = Categories[produto.category]; //categoria
    let subCategoria = Subcategories[produto.subcategory]; //subcategoria
    return nacionalidade + " > " + categoria + " > " + subCategoria;
  }


  const getImages = (images: any) => {
    let objetoImagem = {}
    for (let i = 0; i <= 5; i++) {
      objetoImagem = { ...objetoImagem, [`image_${i + 1}`]: images[i] ? images[i] : "" }
    }
    return objetoImagem
  }
  const getImagesHeader = () => {
    let objetoImagem = {}
    for (let i = 0; i <= 5; i++) {
      objetoImagem = { ...objetoImagem, [`image_${i + 1}`]: i <= 1 ? "Obrigatório" : "Opcional" }
    }
    return objetoImagem
  }

  const exportToCSV = () => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const csvData = getProducts();

    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });

    const a = document.createElement('a');
    a.download = "Produtos.xlsx";
    a.href = URL.createObjectURL(data);
    a.addEventListener('click', (e) => {
      setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
    });
    a.click();
  }


  return (
    <div className={styles.productsContainer}>
      <div className={styles.productsHeader}>
        <BulletedButton
          onClick={() => { }}
          isActive>
          Meus produtos
        </BulletedButton>
        <BulletedButton
          onClick={exportToCSV}>
          Exportar produtos
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
                  <th>Selecione</th>
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
                    disabledActions={disabledActions}
                    setDisabledActions={setDisableActions}
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
