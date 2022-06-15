import TablePagination from '@material-ui/core/TablePagination/TablePagination';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiCheck, FiChevronLeft, FiSearch, FiX } from 'react-icons/fi';
import Loader from 'src/components/Loader';
import MessageModal from 'src/components/MessageModal';
import ActionModal from 'src/components/ModalAction';
import Button from 'src/components/PrimaryButton';
import ProductTableItem from 'src/components/ProductTableItem';
import { useAuth } from 'src/hooks/auth';
import { useLoading } from 'src/hooks/loading';
import { useModalMessage } from 'src/hooks/message';
import api from 'src/services/api';
import { getHeader, getVariations } from 'src/shared/functions/products';
import { ProductSummary as Product } from 'src/shared/types/product';
import XLSX from 'xlsx';
import BulletedButton from '../../components/BulletedButton';
import FilterInput from '../../components/FilterInput';
import styles from './styles.module.scss';

interface SearchFormData {
  search: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState([] as Product[]);
  const [items, setItems] = useState([] as Product[]);

  const [disabledActions, setDisableActions] = useState(false);

  const { isLoading, setLoading } = useLoading();
  const {
    showModalMessage: showMessage,
    modalMessage,
    handleModalMessage,
  } = useModalMessage();

  const { token, user, updateUser } = useAuth();
  const [checked, setChecked] = useState(false);

  const [isDisabledAcoes, setIsDisabledAcoes] = React.useState(true);
  const [valorAcoes, setValorAcoes] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formRef = useRef<FormHandles>(null);

  const [page, setPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [search, setSearch] = useState('');

  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    api
      .get('/account/detail')
      .then(response => {
        updateUser({
          ...user,
          shopInfo: { ...user.shopInfo, _id: response.data.shopInfo._id },
        });
        setLoading(false);
        // return response.data as User;
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(true);

      api
        .get(`/product?page=${page + 1}&limit=${rowsPerPage}`, {
          headers: {
            authorization: token,
            shop_id: user.shopInfo._id,
          },
        })
        .then(response => {
          formatProducts(response.data.products);
          setTotalItems(response.data.total);
          setLoading(false);
        })
        .catch(err => {
          console.log(err);
          setProducts([]);
          setItems([]);

          setLoading(false);
        });
    }
  }, [setLoading, token, user]);

  const formatProducts = useCallback(
    (products: Product[]) => {
      const productsDto = products.map(product => {
        let stockCount = 0;

        if (product.variations) {
          product.variations.forEach(variation => {
            stockCount += Number(variation.stock);
          });
        }

        product.stock = stockCount;
        product.checked = false;

        return product;
      });

      setProducts(productsDto);
      setItems(productsDto);
    },
    [setProducts, setItems],
  );

  const handleModalVisibility = useCallback(() => {
    handleModalMessage(false);
  }, [handleModalMessage]);

  const selectOrDeselectAllProducts = useCallback(async () => {
    const produtos = items;
    produtos.forEach(item => {
      item.checked = !checked;
    });

    setItems(produtos);
    setChecked(!checked);
    setIsDisabledAcoes(checked);
  }, [checked, items]);

  const handleCheckboxChange = useCallback(
    async (id: any) => {
      // const index = products.findIndex(product => product._id === id);
      // const updateProducts = [...products];
      // updateProducts[index].checked = !updateProducts[position].checked;

      const indexItem = items.findIndex(item => item._id === id);
      const updateItems = [...items];

      updateItems[indexItem].checked = !updateItems[indexItem].checked;

      setChecked(
        updateItems.reduce(
          (accumulator, item) => accumulator && item.checked,
          false,
        ),
      );

      let isChecked = true;
      updateItems.map(item => {
        if (item.checked) {
          isChecked = false;
        }
      });
      setIsDisabledAcoes(isChecked);

      // setProducts(updateProducts);
      setItems(updateItems);
    },
    [items],
  );

  const getProducts = useCallback(() => {
    const produtosFiltrados = items.filter(p => p.checked);
    let produtosCSV: any = [];
    produtosCSV.push(getHeader());
    produtosFiltrados.forEach(produto => {
      produtosCSV = [...produtosCSV, ...getVariations(produto)];
    });
    return produtosCSV;
  }, [items]);

  const exportToCSV = useCallback(() => {
    const fileType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const csvData = getProducts();

    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });

    const a = document.createElement('a');
    a.download = 'Produtos.xlsx';
    a.href = URL.createObjectURL(data);
    a.addEventListener('click', e => {
      setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
    });
    a.click();
  }, [getProducts]);

  const findItems = useCallback(async () => {
    api
      .get('/product', {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        },
      })
      .then(response => {
        formatProducts(response.data.products);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setProducts([]);
        setItems([]);

        setLoading(false);
      });
  }, [products, items]);

  const deleteProducts = useCallback(async () => {
    try {
      setIsModalOpen(false);
      const produtosFiltrados = items.filter(p => p.checked);
      setLoading(true);
      produtosFiltrados.forEach(produto => {
        api
          .delete(`/product/${produto._id}`, {
            headers: {
              authorization: token,
              shop_id: user.shopInfo._id,
            },
          })
          .then(() => {
            console.log('produto deletado');
          })
          .catch(err => {
            console.log(err);

            setLoading(false);
          });
      });
      setTimeout(() => {
        setLoading(false);
        handleModalMessage(true, {
          title: 'Produto(s) excluido(s)!',
          message: [`Foram excluido(s) ${produtosFiltrados.length} produto(s)`],
          type: 'success',
        });
        setItems([]);
        setProducts([]);
        setIsDisabledAcoes(true);
        findItems();
      }, 1500);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  }, [
    findItems,
    handleModalMessage,
    items,
    setLoading,
    token,
    user.shopInfo._id,
  ]);

  const setValorAcao = useCallback(value => {
    setValorAcoes(value.target.value);
  }, []);

  const executarAcao = useCallback(() => {
    if (valorAcoes === '1') {
      exportToCSV();
    }
    if (valorAcoes === '2') {
      setIsModalOpen(true);
    }
  }, [exportToCSV, valorAcoes]);

  const handleActionModalVisibility = useCallback(() => {
    setIsModalOpen(false);
  }, [isModalOpen]);

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setLoading(true);
    api
      .get(
        `/product?page=${newPage + 1}&limit=${rowsPerPage}&search=${search}`,
        {
          headers: {
            authorization: token,
            shop_id: user.shopInfo._id,
          },
        },
      )
      .then(response => {
        setPage(newPage);
        formatProducts(response.data.products);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setLoading(true);
    api
      .get(`/product?page=1&limit=${event.target.value}&search=${search}`, {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        },
      })
      .then(response => {
        setPage(0);
        if (response.status === 200) {
          setRowsPerPage(parseInt(event.target.value, 10));
          formatProducts(response.data.products);
          setTotalItems(response.data.total);
        } else {
          setProducts([]);
          setTotalItems(0);
          setItems([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  };

  const handleSubmit = (event: any) => {
    setLoading(true);
    setSearch(event.search);
    api
      .get(
        `/product?page=1&limit=${rowsPerPage}&search=${event.search}`,
        {
          headers: {
            authorization: token,
            shop_id: user.shopInfo._id,
          },
        },
      )
      .then(response => {
        setPage(0);
        if (response.status === 200) {
          formatProducts(response.data.products);
          setTotalItems(response.data.total);
        } else {
          setProducts([]);
          setTotalItems(0);
          setItems([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  };

  return (
    <>
      <div className={styles.productsContainer}>
        <div className={styles.productsHeader}>
          <BulletedButton isActive>Meus produtos</BulletedButton>
          <BulletedButton
            onClick={() => {
              router.push('/products/create');
            }}
          >
            Criar novo produto
          </BulletedButton>
          <BulletedButton
            onClick={() => {
              router.push('/products/import');
            }}
          >
            Importar ou exportar
          </BulletedButton>
        </div>
        <div className={styles.divider} />
        <div className={styles.productsContent}>
          <div className={styles.productsOptions}>
            <div className={styles.contentFilters}>
              <div className={styles.panelFooter}>
                <select
                  value={valorAcoes || ''}
                  onChange={setValorAcao}
                  className={styles.selectOption}
                >
                  <option value="0">Ação em massa</option>
                  <option value="1">Exportar Produto(s)</option>
                  <option value="2">Excluir Produto(s)</option>
                </select>
                <button
                  type="button"
                  onClick={executarAcao}
                  disabled={isDisabledAcoes}
                >
                  Aplicar
                </button>
              </div>
              <div style={{ display: 'flex', flex: 1 }}>
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
          </div>
          <TablePagination
            component="div"
            count={totalItems}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Produtos por página"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count}`
            }
          />
          <div className={styles.tableContainer}>
            {items.length > 0 ? (
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>
                      <input
                        className={styles.checkbox}
                        type="checkbox"
                        name="todos"
                        value="todos"
                        onChange={selectOrDeselectAllProducts}
                        checked={checked}
                        key={Math.random()}
                      />
                    </th>
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
                  {items.map(item => (
                    <ProductTableItem
                      key={item._id}
                      item={item}
                      products={products}
                      setProducts={setProducts}
                      userInfo={{
                        token,
                        shop_id:
                          user && user.shopInfo._id ? user.shopInfo._id : '',
                      }}
                      handleCheckboxChange={handleCheckboxChange}
                      disabledActions={disabledActions}
                      setDisabledActions={setDisableActions}
                    />
                  ))}
                </tbody>
              </table>
            ) : (
              <span className={styles.emptyList}>
                {' '}
                Nenhum item foi encontrado{' '}
                {search && (
                  <span>
                    para {'"'}
                    {search}
                    {'"'}
                  </span>
                )}
                {search && (
                  <span className={styles.back}>
                    <Button
                      onClick={() => {
                        setSearch('');
                        formRef.current?.reset();
                        handleSubmit({ search: '' });
                      }}
                      type="button"
                      icon={FiChevronLeft}
                      className={styles.backButton}
                    >
                      Voltar
                    </Button>
                  </span>
                )}
              </span>
            )}
          </div>
          {rowsPerPage < totalItems && (
            <TablePagination
              component="div"
              count={totalItems}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Produtos por página"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count}`
              }
            />
          )}
        </div>
      </div>
      {isLoading && (
        <div className={styles.loadingContainer}>
          <Loader />
        </div>
      )}
      {showMessage && (
        <MessageModal handleVisibility={handleModalVisibility}>
          <div className={styles.modalContent}>
            {modalMessage.type === 'success' ? (
              <FiCheck style={{ color: 'var(--green-100)' }} />
            ) : (
              <FiX style={{ color: 'var(--red-100)' }} />
            )}
            <p>{modalMessage.title}</p>
            <p>{modalMessage.message}</p>
          </div>
        </MessageModal>
      )}
      {isModalOpen && (
        <ActionModal
          handleVisibility={handleActionModalVisibility}
          titulo="Excluir Produto(s)"
          mensagem="Deseja relmente excluir o(s) produto(s) selecionado(s) ?"
          execute={deleteProducts}
        />
      )}
    </>
  );
};

export default Products;
