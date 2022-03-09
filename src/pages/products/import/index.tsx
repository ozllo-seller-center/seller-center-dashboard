import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { useRouter } from 'next/router';

import XLSX from 'xlsx';

import {
  FiCheck, FiDownloadCloud, FiUploadCloud, FiX,
} from 'react-icons/fi';
import { FaExclamation } from 'react-icons/fa';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';
import { importLines, ProductImport } from 'src/shared/types/productImport';
import api from 'src/services/api';
import { Nationality } from 'src/shared/types/nationality';
import { Category, SubCategory } from 'src/shared/types/category';
import Loader from 'src/components/Loader';
import { useLoading } from 'src/hooks/loading';
import { useModalMessage } from 'src/hooks/message';
import ErrorMessages from 'src/shared/errors/ImportSheetError';
import { InitProductImport } from 'src/shared/validators/importValidators';
import importToProduct from 'src/shared/converters/importToProduct';
import { Product } from 'src/shared/types/product';
import { useAuth } from 'src/hooks/auth';
import getValidationErrors from 'src/utils/getValidationErrors';
import styles from './styles.module.scss';
import MessageModal from '../../../components/MessageModal';
import Importzone from '../../../components/Importzone';
import BulletedButton from '../../../components/BulletedButton';

type VariationDTO = {
  _id?: string
  size?: number | string,
  stock?: number,
  color?: string,
}

const Import: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);

  const [isModalVisible, setModalVisibility] = useState(false);

  const [isUploading, setUploading] = useState(false);
  const [successfull, setSuccessfull] = useState(false);
  const [error, setError] = useState(false);

  const [imports, setImports] = useState<ProductImport[]>([]);
  const [nationalities, setNationalities] = useState([] as Nationality[]);
  const [categories, setCategories] = useState([] as Category[]);
  const [subCategories, setSubCategories] = useState([] as SubCategory[]);

  const { showModalMessage: showMessage, modalMessage, handleModalMessage } = useModalMessage();
  const { setLoading, isLoading } = useLoading();

  const {
    user, token, updateUser, signOut,
  } = useAuth();

  const formRef = useRef<FormHandles>(null);

  const router = useRouter();

  const { screenWidth } = useMemo(() => {
    if (typeof window !== 'undefined') {
      return { screenWidth: window.innerWidth };
    }

    return {
      screenWidth: undefined,
    };
  }, []);

  const handleFileUpload = useCallback((uploads: File[]) => {
    setFiles(uploads);
  }, []);

  const handleSubmit = useCallback(async (product, newImages, products) => {
    try {
      /* if (!isVariation) {
        //imagens - verificar se e necessario
        await api.patch(`/product/${product._id}/images`, { images: newImages }, {
          headers: {
            authorization: token,
            shop_id: user.shopInfo._id,
          }
        }).then(response => {
        })/
      } */

      const {
        variations,
      } = product;
      const price = product.price.toString();
      const price_discounted = product.price_discounted.toString();
      api.patch(`/product/${product._id}/price`, {
        price,
        price_discounted,
      }, {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        },
      });

      await variations.forEach(async (variation: VariationDTO, i: number) => {
        if (!!product.grouperId && product.grouperId !== '') {
          const variationId = product.grouperId;
          await api.patch(`/product/${product._id}/variation/${variationId}`, variation, {
            headers: {
              authorization: token,
              shop_id: user.shopInfo._id,
            },
          });

          return;
        }
        delete variation._id;
      });
      await api.patch(`/product/${product._id}`, product, {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        },
      }).then(() => {
        setLoading(false);
        handleModalMessage(true, { title: 'Produtos alterados!', message: [`Foram alterados ${products.length} produtos e suas variações`], type: 'success' });
        if (window.innerWidth >= 768) {
          router.push('/products');
          return;
        }

        router.push('/products-mobile');
      });
    } catch (err) {
      setLoading(false);
      handleModalMessage(true, { title: 'Erro', message: ['Ocorreu um erro inesperado'], type: 'error' });
      console.log(err);
      if (err instanceof Yup.ValidationError) {
        const errors = getValidationErrors(err);
        formRef.current?.setErrors(errors);
      }
    }
  }, [token, user.shopInfo._id, setLoading, handleModalMessage, router]);

  const importProducts = useCallback(async (imprts: ProductImport[]) => {
    let products: Product[] = [];

    try {
      if (imprts.length === 0) {
        setLoading(false);
        return;
      }

      products = importToProduct(imprts);

      setLoading(true);

      if (error) {
        setLoading(false);
        return;
      }

      products.map(async (product) => {
        // FIXME: Carregar as imagens e enviar os arquivos para o back-end
        // console.log('[Init] Loading blobs')
        // const blobs = product.images.map(img => {
        //   return fetch(img.url)
        //     .then((e) => {
        //       return e.blob()
        //     })
        // })

        // let files = await blobs.map(async (blob, i) => {
        //   let b: any = await blob.then(b => b)
        //   b.lastModifiedDate = new Date()
        //   b.name = product.images[i].name

        //   return b as File
        // })

        // console.log(files)
        // console.log('[End] Loading blobs')

        // let dataContainer = new FormData();

        // await files.map(async (f) => {
        //   await f.then((file) => {
        //     if (!!file) {
        //       console.log('Adding file to request: ')
        //       console.log(file)

        //       dataContainer.append("images", file, file.name)
        //     }
        //   })
        // });

        // console.log('Calling images upload')

        // const imagesUrls = await api.post('/product/upload', dataContainer, {
        //   headers: {
        //     authorization: token,
        //     shop_id: user.shopInfo._id,
        //   }
        // }).then(response => {
        //   return response.data.urls
        // }).catch(err => {
        //   console.log(err)
        // });
        const isVariation = false;

        const imagesUrls = product.images.map((img) => img.url);

        const nationalityIndex = nationalities.findIndex((nat) => nat.name === product.nationality);
        const nationality = nationalityIndex > -1 ? nationalities[nationalityIndex] : nationalities[0];

        const categoryIndex = categories.findIndex((cat) => cat.value === product.category);
        const category = categoryIndex > -1 ? categories[categoryIndex] : categories[0];

        const subCats = await api.get(`/category/${category.code}/subcategories`).then((response) => response.data as SubCategory[]).catch((err) => []);

        const subCategoryIndex = subCats.findIndex((sub) => sub.value === product.subcategory);
        const subcategory = subCategoryIndex > -1 ? subCats[subCategoryIndex] : subCats[0];

        const {
          // category,
          // subcategory,
          // nationality,
          name,
          description,
          brand,
          ean,
          sku,
          gender,
          height,
          width,
          length,
          weight,
          price,
          price_discounted,
          variations,
        } = product;

        const p = {
          category: category.code,
          subcategory: subcategory.code,
          nationality: nationality.id as number,
          name,
          description,
          brand,
          ean,
          sku,
          gender,
          height,
          width,
          length,
          weight,
          price: price?.toString(),
          price_discounted: !price_discounted ? price?.toString() : price_discounted?.toString(),
          images: imagesUrls,
          variations,
        };

        if (product._id) {
          const newImages: string[] = product.images.map((img) => img.url);
          handleSubmit(product, newImages, products);
        } else {
          await api.post('/product', p, {
            headers: {
              authorization: token,
              shop_id: user.shopInfo._id,
            },
          }).then((response) => {
            handleModalMessage(true, { title: 'Produtos cadastrados!', message: [`Foram cadastrados ${products.length} produtos e suas variações`], type: 'success' });
          }).catch((err) => {
            console.log(err.response);

            handleModalMessage(true, { title: 'Erro', message: ['Ocorreu um erro inesperado'], type: 'error' });
          });
        }
      });

      setLoading(false);

      // FIXME: Realizar chamada na API para salvar as informações importadas
      // await products.forEach(async (product) => {
      //   try {

      //   } catch (err) {

      //   }
      // });
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  }, [setLoading, error, nationalities, categories, handleSubmit, token, user.shopInfo._id, handleModalMessage]);

  const handleImport = useCallback(async () => {
    const importedProducts: ProductImport[] = [];

    setLoading(true);
    setError(false);

    files.map(async (file) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        if (!e.target || e.target.result === null) { return; }

        let data = e.target.result;

        if (!(data instanceof ArrayBuffer)) {
          return;
        }

        data = new Uint8Array(data);

        const workbook = XLSX.read(data, { type: 'array' });
        const result: any = {};

        workbook.SheetNames.forEach((sheet) => {
          const roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { header: 1 });
          if (roa.length) { result[sheet] = roa; }
        });

        let count = 0;
        let stop = false;

        if (!!result.Planilha1 || !!result.data) {
          const sheet: any[] = result.Planilha1 ? result.Planilha1 : result.data;

          console.log(sheet);

          sheet.forEach(async (line, i) => {
            // Ignorar o cabeçalho
            if (i > 1 && line.length > 0) {
              count += 1;

              const productValidation: ProductImport = InitProductImport();

              if (!line[3]) {
                handleModalMessage(true, {
                  type: 'error',
                  title: 'Id Agrupador não encontrado!',
                  message: [`Não foi encontrado um id arupador na linha ${i + 1}`],
                });

                stop = true;

                setError(true);
              }
              const size = line.length - 1;
              for (let attrI = 0; attrI <= size && !stop; attrI += 1) {
                const attribute = importLines[attrI];

                const validate = productValidation[attribute].validate;

                switch (attrI) {
                  case 0:
                    const value = line[attrI].split('>');

                    productValidation[attribute].value.nationality = value[0].trim();
                    productValidation[attribute].value.category = value[1].trim();
                    productValidation[attribute].value.subCategory = value[2].trim();
                    break;
                  case 16:
                    const gender = line[attrI].charAt(0).toUpperCase();
                    productValidation[attribute].value = gender;

                    break;

                  case 19:
                  case 20:
                  case 21:
                  case 22:
                  case 23:
                  case 24:
                    if (line[attrI]) { productValidation[attribute].value.push(line[attrI]); }
                    break;
                  case 25:
                    if (line[attrI]) { productValidation[attribute].value = line[attrI]; }
                    break;
                  default:
                    if (line[attrI]) { productValidation[attribute].value = line[attrI]; }
                    break;
                }

                if (validate && !validate(productValidation[attribute].value)) {
                  const err = ErrorMessages[attribute];

                  if (err) {
                    handleModalMessage(true, {
                      type: 'error',
                      title: err.title,
                      message: [err.message.replace('%s', line[3]).replace('%d', (i + 1).toString())],
                    });
                  }

                  setError(true);

                  return;
                }
              }

              if (productValidation.image.value.length < 2) {
                const err = ErrorMessages.image;

                handleModalMessage(true, {
                  type: 'error',
                  title: err.title,
                  message: [err.message.replace('%s', line[3]).replace('%d', (i + 1).toString())],
                });

                setError(true);

                return;
              }

              if (stop) { return; }

              importedProducts.push(productValidation);
            }
          });

          if (count === 0) {
            handleModalMessage(true, {
              type: 'error',
              title: 'Nenhum produto encontrado',
              message: ['A planilha selecionada não possui nenhum registro válido'],
            });

            setImports([]);
            return;
          }

          // setImports(importedProducts)
          importProducts(importedProducts);
        }
      };

      reader.readAsArrayBuffer(file);
    });
  }, [files, isUploading, successfull, error]);

  const handleModalVisibility = useCallback(() => {
    handleModalMessage(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    // isTokenValid(token).then(valid => {
    //   if (valid) {
    api.get(`auth/token/${token}`).then((response) => {
      const { isValid } = response.data;

      if (!isValid) {
        setLoading(false);

        signOut();
        router.push('/');
        return;
      }

      api.get('/account/detail').then((resp) => {
        updateUser({ ...user, shopInfo: { ...user.shopInfo, _id: resp.data.shopInfo._id, userId: resp.data.shopInfo.userId } });
      }).catch((err) => {
        console.log(err);
      });

      api.get('/category/all').then((resp) => {
        setCategories(resp.data);

        setLoading(false);
      }).catch((err) => {
        console.log(err);

        setLoading(false);

        return [];
      });
    }).catch((err) => {
      signOut();
      router.push('/');

      setLoading(false);
    });

    // return
    //   }
    // })

    setNationalities([{
      id: '1',
      name: 'Nacional',
    }, {
      id: '2',
      name: 'Internacional',
    }]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className={styles.importContainer}>
        <section className={styles.importHeader}>
          <BulletedButton
            onClick={() => { router.push((!!screenWidth && screenWidth < 768) ? '/products-mobile' : '/products'); }}
          >
            Meus produtos
          </BulletedButton>
          <BulletedButton
            onClick={() => { router.push('/products/create'); }}
          >
            Criar novo produto
          </BulletedButton>
          <BulletedButton
            isActive
          >
            Importar ou exportar
          </BulletedButton>
        </section>
        <div className={styles.divider} />
        <section className={styles.importContent}>
          <div className={styles.exportPanel}>
            <FiDownloadCloud />
            <h3>Exportar planilha inicial</h3>
            <p>
              A planilha inicial é um arquivo com todos os campos que você precisa preencher
              para realizar a importação.
            </p>
            {/* <button type='button'> */}
            <a href="/assets/CadastroProduto.xlsx" target="_blank" download>Exportar Planilha</a>
            {/* </button> */}
          </div>
          <div className={styles.importPanel}>
            <FiUploadCloud />
            <h3>Importar ou Alterar Produto(s)</h3>
            <p>Solte ou clique na caixa abaixo para realizar o upload</p>
            <p className={styles.smallText}>São aceitas planilhas no formato *.xlsx, *.xls e *.csv com tamanho de até 10MB</p>
            <Form
              ref={formRef}
              onSubmit={async () => {
                await handleImport();
              }}
            >
              <Importzone name="import" onFileUploaded={handleFileUpload} />
              <button type="submit">Importar Planilha</button>
            </Form>
          </div>
        </section>
        {
          isModalVisible && (
            <MessageModal handleVisibility={() => setModalVisibility(false)} alterStyle={successfull}>
              <div className={styles.modalContent}>
                {isUploading
                  && (
                    <>
                      <div className={styles.loader} />
                      <p>Importando a lista de produtos...</p>
                    </>
                  )}
                {successfull && (
                  <>
                    <p>Produtos cadastrado</p>
                    <p>com sucesso!</p>
                  </>
                )}
                {error && (
                  <>
                    <FaExclamation />
                    <p>Ops, tem algo errado na sua planilha.</p>
                    <p>Revise os dados e faça o upload novamente</p>
                  </>
                )}
              </div>
            </MessageModal>
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
      {
        isLoading && (
          <div className={styles.loadingContainer}>
            <Loader />
          </div>
        )
      }
    </>
  );
};

export default Import;
