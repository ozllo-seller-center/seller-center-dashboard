import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/router';

import { FormHandles, Scope } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';

import { FiCheck, FiChevronLeft, FiX } from 'react-icons/fi';

import api from 'src/services/api';
import { useAuth } from 'src/hooks/auth';
import {
  Product,
  ProductImage,
  Validation_Errors,
} from 'src/shared/types/product';
import TextArea from 'src/components/Textarea';
import { useLoading } from 'src/hooks/loading';
import { useModalMessage } from 'src/hooks/message';
import Loader from 'src/components/Loader';
import MessageModal from 'src/components/MessageModal';
import VariationField from 'src/components/VariationsController/Variation';
import { Attribute, SubCategory } from 'src/shared/types/category';
import ImageController from 'src/components/ImageController';
import Compressor from 'compressorjs';
import styles from './styles.module.scss';
import getValidationErrors from '../../../utils/getValidationErrors';
import VariationsController from '../../../components/VariationsController';
import RadioButtonGroup from '../../../components/RadioButtonGroup';
import Input from '../../../components/Input';
import Button from '../../../components/PrimaryButton';

import ProductCategories from 'src/components/ProductCategories';

type VariationDTO = {
  _id?: string;
  size?: number | string;
  stock?: number;
  color?: string;
  flavor?: string;
  color_flavor?: string;
  gluten_free?: boolean;
  lactose_free?: boolean;
};

export function EditProductForm() {
  const [files, setFiles] = useState<ProductImage[]>([]);
  const [filesUrl, setFilesUrl] = useState<string[]>([]);

  const [totalFields, setTotalFields] = useState(14);

  const [oldStock, setOldStock] = useState<number[]>([]);
  const [priceChanged, setPriceChange] = useState(false);

  const [variations, setVariations] = useState<VariationDTO[]>([{}]);
  const [nationality, setNationality] = useState('');
  const [category, setCategory] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');

  const formRef = useRef<FormHandles>(null);

  const router = useRouter();

  const { user, token, updateUser, signOut } = useAuth();
  const { isLoading, setLoading } = useLoading();
  const {
    showModalMessage: showMessage,
    modalMessage,
    handleModalMessage,
  } = useModalMessage();

  const [attributes, setAttributes] = useState<Attribute[]>([]);

  const [validationErrors, setValidationErrors] = useState<Validation_Errors[]>(
    [],
  );

  const [isProductCategoriesOpened, setProductCategoriesOpened] =
    useState(false);

  useEffect(() => {
    // setLoading(true)

    api
      .get(`auth/token/${token}`)
      .then(response => {
        const { isValid } = response.data;

        if (!isValid) {
          signOut();
          router.push('/');
          return;
        }

        api
          .get('/account/detail')
          .then(resp => {
            updateUser({
              ...user,
              shopInfo: {
                ...user.shopInfo,
                _id: resp.data.shopInfo._id,
                userId: resp.data.shopInfo.userId,
              },
            });
          })
          .catch(err => {
            // eslint-disable-next-line no-console
            console.log(err);
          });
      })
      .catch(() => {
        signOut();
        router.push('/');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!!formRef.current && !!user) {
      setLoading(true);

      const { id } = router.query;

      api
        .get(`/product/${id}`, {
          headers: {
            authorization: token,
            shop_id: user.shopInfo._id,
          },
        })
        .then(response => {
          const urls = response.data.images.filter(
            (url: string) => !!url && url !== null,
          );
          setFilesUrl(urls);

          const fs: ProductImage[] = urls.map(
            (url: string) =>
              ({
                url,
                uploaded: true,
              } as ProductImage),
          );

          setFiles(fs);

          setVariations(response.data.variations);
          setOldStock(
            response.data.variations.map((v: VariationDTO) => v.stock),
          );

          setNationality(response.data.nationality);
          setCategory(response.data.category);
          setSubCategory(response.data.subcategory);

          formRef.current?.setData(response.data);
          // setFormData(response.data)

          if (response.data?.validation?.errors?.length) {
            setValidationErrors(
              response.data.validation.errors.map((error: any) => {
                if ('category' === error.field) error.message = 'Categoria';
                if ('images' === error.field) error.message = 'Fotos';
                if ('name' === error.field) error.message = 'Nome';
                if ('brand' === error.field) error.message = 'Marca';
                if ('description' === error.field) error.message = 'Descri????o';
                if ('sku' === error.field) error.message = 'SKU';
                if ('height' === error.field) error.message = 'Altura';
                if ('width' === error.field) error.message = 'Largura';
                if ('length' === error.field) error.message = 'Comprimento';
                if ('weight' === error.field) error.message = 'Peso';
                if ('variations' === error.field) error.message = 'Varia????o 1';
                if (error.field.endsWith('.size'))
                  error.message = `Varia????o ${
                    response.data.variations.findIndex(
                      (v: any) => v._id === error.field.split('.')[1],
                    ) + 1
                  }: Tamanho`;
                if (error.field.endsWith('.attr'))
                  error.message = `Varia????o ${
                    response.data.variations.findIndex(
                      (v: any) => v._id === error.field.split('.')[1],
                    ) + 1
                  }: Cor ou Sabor`;
                if (error.field.endsWith('.stock'))
                  error.message = `Varia????o ${
                    response.data.variations.findIndex(
                      (v: any) => v._id === error.field.split('.')[1],
                    ) + 1
                  }: Estoque`;
                if (!error.message) error.message = error.field;
                return error;
              }),
            );
          }

          setLoading(false);
        })
        .catch(err => {
          // eslint-disable-next-line no-console
          console.log(err);
          setLoading(false);
          handleModalMessage(true, {
            title: 'Erro',
            message: ['Erro ao carregar o produto'],
            type: 'error',
          });
        });
    }
  }, [user, formRef, token, setLoading, router.query, handleModalMessage]);

  useEffect(() => {
    const { id } = router.query;

    api
      .get(`/product/${id}/ad`, {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        },
      })
      .then(response => {
        console.table(response.data);
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log(err);
      });
  }, [router.query, token, user.shopInfo._id]);

  useEffect(() => {
    setLoading(true);

    if (category) {
      api
        .get(`/category/${category}/attributes`)
        .then(response => {
          setAttributes(response.data[0].attributes);
          setCategoryName(response.data[0].value);
          setLoading(false);
        })
        .catch(err => {
          // eslint-disable-next-line no-console
          console.log(err);

          setLoading(false);
        });
    }
  }, [category, setLoading]);

  useEffect(() => {
    if (category) {
      setLoading(true);
      api
        .get(`/category/${category}/subcategories`)
        .then(response => {
          const categoryName = response.data.find(
            (c: SubCategory) => Number(c.code) === Number(subCategory),
          )?.value;
          setSubCategoryName(categoryName || '');
          setLoading(false);
        })
        .catch(err => {
          // eslint-disable-next-line no-console
          console.log(err);
          setLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subCategory, setLoading]);

  useEffect(() => {
    if (variations.length > 0) {
      setTotalFields(10 + variations.length * (attributes.length + 1));
      return;
    }

    setTotalFields(10 + (attributes.length + 1));
  }, [variations, attributes]);

  const handleModalVisibility = useCallback(() => {
    handleModalMessage(false);
  }, [handleModalMessage]);

  const handleOnFileUpload = useCallback(
    (acceptedFiles: File[], dropZoneRef: React.RefObject<any>) => {
      const accepted = acceptedFiles.filter((f, i) => {
        if (files.length + (i + 1) > 6) {
          handleModalMessage(true, {
            type: 'error',
            title: 'Muitas fotos!',
            message: ['Um produto pode ter no m??ximo 6 fotos'],
          });

          return false;
        }

        return true;
      });

      const newFiles = accepted.map(
        f =>
          ({
            file: f,
          } as ProductImage),
      );

      setLoading(true);

      const urls: string[] = [];
      newFiles.forEach(f => {
        if (f.file) {
          f.uploaded = false;

          new Compressor(f.file, {
            width: 1000,
            height: 1000,
            success(result) {
              const url = URL.createObjectURL(result);

              urls.push(url);

              f.file = result as File;
              f.url = url;

              setLoading(false);
            },
            error(err) {
              // eslint-disable-next-line no-console
              console.log(err.message);
              setLoading(false);
            },
          });
        }
      });

      dropZoneRef.current.acceptedFiles = [...files, ...newFiles].map(
        f => f.url,
      );

      setFiles([...files, ...newFiles]);
      setFilesUrl([...filesUrl, ...urls]);
    },
    [files, filesUrl, handleModalMessage, setLoading],
  );

  const handleDeleteFile = useCallback(
    (url: string) => {
      URL.revokeObjectURL(url);

      const deletedIndex = files.findIndex(f => f.url === url);

      const urlsUpdate = filesUrl.filter((f, i) => i !== deletedIndex);
      const filesUpdate = files.filter((f, i) => i !== deletedIndex);

      formRef.current?.setFieldValue('images', filesUpdate);

      const drop = formRef.current?.getFieldRef('images');

      if (drop) {
        drop.value = '';
      }

      setFilesUrl(urlsUpdate);
      setFiles(filesUpdate);
    },
    [filesUrl, files],
  );

  const handleFileOrder = useCallback(
    (draggedFile: number, droppedAt: number) => {
      if (draggedFile === droppedAt) {
        return;
      }

      let newFiles = [...files];

      const auxFile = newFiles[draggedFile];

      newFiles = newFiles.filter((item, i) => i !== draggedFile);

      newFiles.splice(droppedAt, 0, auxFile);

      setFiles([...newFiles]);
    },
    [files],
  );

  const filledFields = useMemo(() => {
    if (!formRef.current) {
      return 0;
    }

    const data = formRef.current?.getData() as Product;

    if (!data) {
      return 0;
    }

    let filled = 0;

    if (data.name) {
      filled += 1;
    }

    if (data.brand) {
      filled += 1;
    }

    if (data.description) {
      filled += 1;
    }

    if (data.sku) {
      filled += 1;
    }

    if (data.height) {
      filled += 1;
    }

    if (data.width) {
      filled += 1;
    }

    if (data.length) {
      filled += 1;
    }

    if (data.weight) {
      filled += 1;
    }

    if (data.price) {
      filled += 1;
    }

    if (files.length >= 2) {
      filled += 1;
    }

    variations.forEach(variation => {
      if (variation.size) {
        filled += 1;
      }
      if (variation.stock || variation.stock === 0) {
        filled += 1;
      }
      if (variation.color) {
        filled += 1;
      }
      if (variation.flavor) {
        filled += 1;
      }

      attributes.forEach(attribute => {
        switch (attribute.name) {
          case 'gluten_free':
            filled += 1;
            break;
          case 'lactose_free':
            filled += 1;
            break;
          default:
            break;
        }
      });
    });

    return filled;
  }, [files, variations, attributes]);

  const yupVariationSchema = useCallback(
    (): object =>
      attributes.findIndex(attribute => attribute.name === 'flavor') >= 0
        ? {
            variations: Yup.array()
              .required()
              .of(
                Yup.object().shape({
                  size: Yup.string(),
                  flavor: Yup.string(),
                  stock: Yup.number()
                    .nullable(true)
                    .min(0, 'Valor m??nimo 0')
                    .transform(v => (v === '' || Number.isNaN(v) ? null : v)),
                }),
              ),
          }
        : {
            variations: Yup.array()
              .required()
              .of(
                Yup.object().shape({
                  size: Yup.string(),
                  color: Yup.string(),
                  stock: Yup.number()
                    .nullable(true)
                    .min(0, 'Valor m??nimo 0')
                    .transform(v => (v === '' || Number.isNaN(v) ? null : v)),
                }),
              ),
          },
    [attributes],
  );

  const handleSubmit = useCallback(
    async data => {
      // if (filledFields < totalFields) {
      //   handleModalMessage(true, {
      //     type: 'error',
      //     title: 'Formul??rio incompleto',
      //     message: [
      //       'Preencha todas as informa????es obrigat??rias antes de continuar.',
      //     ],
      //   });
      //   return;
      // }

      if (data.price_discounted === '') {
        data.price_discounted = data.price;
      }

      try {
        setLoading(true);
        formRef.current?.setErrors({});

        // https://stackoverflow.com/questions/66795388/yup-validation-for-a-non-required-field
        const schema = Yup.object().shape(
          {
            images: Yup.array()
              .nullable()
              .notRequired()
              .when('images', {
                is: (images: any[]) => images?.length > 0,
                then: rule =>
                  rule
                    .min(2, 'Escolha pelo menos duas imagens')
                    .max(8, 'Pode atribuir no m??ximo 8 imagens'),
              }),
            name: Yup.string()
              .nullable()
              .notRequired()
              .when('name', {
                is: (value: any) => value?.length,
                then: rule =>
                  rule
                    .min(2, 'Deve conter pelo menos 2 caracteres')
                    .max(100, 'Deve conter no m??ximo 100 caracteres'),
              }),
            description: Yup.string()
              .nullable()
              .notRequired()
              .when('description', {
                is: (value: any) => value?.length,
                then: rule =>
                  rule
                    .min(2, 'Deve conter pelo menos 2 caracteres')
                    .max(1800, 'Deve conter no m??ximo 1800 caracteres'),
              }),
            brand: Yup.string()
              .nullable()
              .notRequired()
              .when('brand', {
                is: (value: any) => value?.length,
                then: rule =>
                  rule.min(2, 'Deve conter pelo menos 2 caracteres'),
              }),
            ean: Yup.string(),
            sku: Yup.string(),
            height: Yup.number()
              .min(10, 'M??nimo de 10cm')
              .nullable(true)
              .transform(v => (v === '' || Number.isNaN(v) ? null : v)),
            width: Yup.number()
              .nullable(true)
              .min(10, 'M??nimo de 10cm')
              .transform(v => (v === '' || Number.isNaN(v) ? null : v)),
            length: Yup.number()
              .nullable(true)
              .min(10, 'M??nimo de 10cm')
              .transform(v => (v === '' || Number.isNaN(v) ? null : v)),
            weight: Yup.number()
              .min(100, 'M??nimo de 100 gramas')
              .nullable(true)
              .transform(v => (v === '' || Number.isNaN(v) ? null : v)),
            gender: Yup.string(),
            price: Yup.number().typeError('Campo obrigat??rio'),
            price_discounted: Yup.number()
              .nullable(true)
              .min(0, 'Valor m??nimo de R$ 0')
              .max(data.price, `Valor m??ximo de R$ ${data.price}`)
              .transform(v => (v === '' || Number.isNaN(v) ? null : v)),
            ...yupVariationSchema(),
          },
          [
            // Add Cyclic deps here because when require itself
            ['name', 'name'],
            ['images', 'images'],
            ['description', 'description'],
            ['brand', 'brand'],
          ],
        );

        await schema.validate(data, { abortEarly: false });

        const { id } = router.query;

        const dataContainer = new FormData();

        files.forEach(
          f =>
            !!f.file &&
            !f.uploaded &&
            dataContainer.append('images', f.file, f.file.name),
        );

        const oldImages = files.map(f => {
          if (!!f.url && f.uploaded) return f.url;
        });

        let newImages = await api
          .post('/product/upload', dataContainer, {
            headers: {
              authorization: token,
              shop_id: user.shopInfo._id,
            },
          })
          .then(response => response.data.urls as string[]);

        if (oldImages) newImages = [...(oldImages as string[]), ...newImages];

        await api.patch(
          `/product/${id}/images`,
          { images: newImages },
          {
            headers: {
              authorization: token,
              shop_id: user.shopInfo._id,
            },
          },
        );

        const {
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
          vars = data.variations,
        } = data;

        if (priceChanged) {
          api.patch(
            `/product/${id}/price`,
            {
              price,
              price_discounted,
            },
            {
              headers: {
                authorization: token,
                shop_id: user.shopInfo._id,
              },
            },
          );
        }

        const product = {
          category,
          subcategory: subCategory,
          nationality,
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
          images: newImages,
        };

        await vars.forEach(async (variation: VariationDTO, i: number) => {
          if (!!variation._id && variation._id !== '') {
            if (!category) {
              delete variation.size;
              delete variation.color_flavor;
            }

            const variationId = variation._id;

            if (oldStock[i] !== variation.stock) {
              api.patch(
                `/product/${id}/variation/${variationId}`,
                { stock: variation.stock },
                {
                  headers: {
                    authorization: token,
                    shop_id: user.shopInfo._id,
                  },
                },
              );
            }

            delete variation._id;
            delete variation.stock;

            await api.patch(
              `/product/${id}/variation/${variationId}`,
              variation,
              {
                headers: {
                  authorization: token,
                  shop_id: user.shopInfo._id,
                },
              },
            );

            return;
          }

          await api.post(`/product/${id}/variation`, variation, {
            headers: {
              authorization: token,
              shop_id: user.shopInfo._id,
            },
          });
        });

        await api
          .patch(`/product/${id}`, product, {
            headers: {
              authorization: token,
              shop_id: user.shopInfo._id,
            },
          })
          .then(() => {
            setLoading(false);

            if (window.innerWidth >= 768) {
              router.push('/products');
              return;
            }

            router.push('/products-mobile');
          });
      } catch (err) {
        setLoading(false);
        // eslint-disable-next-line no-console
        console.log(err);
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);
        }
      }
    },
    [
      setLoading,
      yupVariationSchema,
      router,
      files,
      token,
      user.shopInfo._id,
      priceChanged,
      category,
      subCategory,
      nationality,
      oldStock,
    ],
  );

  const handleDeleteVariation = useCallback(
    async (deletedIndex: number): Promise<void> => {
      const vars = formRef.current?.getData().variations;

      const tempVars = vars.filter((v: any, i: number) => i !== deletedIndex);
      const deletedVariation = variations[deletedIndex];

      formRef.current?.setFieldValue('variations', [...tempVars]);
      formRef.current?.setData({
        ...formRef.current?.getData(),
        variations: tempVars,
      });

      const { id } = router.query;
      await api.delete(`/product/${id}/variation/${deletedVariation._id}`, {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        },
      });

      setVariations([...tempVars]);
    },
    [variations, token, user, router],
  );

  const handleAddVariation = useCallback(() => {
    setVariations([...variations, {}]);
  }, [variations]);

  const nationalities = [
    { id: '1', name: 'Nacional' },
    { id: '2', name: 'Internacional' },
  ];

  return (
    <>
      <div className={styles.container}>
        <section className={styles.header}>
          <Button
            customStyle={{ className: styles.backButton }}
            onClick={() => router.back()}
            icon={FiChevronLeft}
          >
            Voltar
          </Button>
          <div className={styles.breadCumbs}>
            <div
              className="container"
              onClick={() =>
                !isProductCategoriesOpened
                  ? setProductCategoriesOpened(true)
                  : setProductCategoriesOpened(false)
              }
            >
              {categoryName && subCategoryName ? (
                <>
                  <span className={styles.crumb}>
                    {'1' === nationality
                      ? 'Nacional'
                      : '2' === nationality
                      ? 'Internacional'
                      : 'Nacional'}
                  </span>

                  <span className={styles.separator}>/</span>

                  <span className={styles.crumb}>{categoryName}</span>

                  <span className={styles.separator}>/</span>

                  <span className={styles.activeCrumb}>{subCategoryName}</span>
                </>
              ) : (
                <span className={styles.activeCrumb}>
                  Escolha uma categoria
                </span>
              )}
            </div>
          </div>
        </section>
        <section className={styles.content}>
          {isProductCategoriesOpened && (
            <ProductCategories
              nationalities={nationalities}
              setNationality={setNationality}
              setCategory={setCategory}
              setSubCategory={setSubCategory}
              setDisplay={setProductCategoriesOpened}
              category={category}
              subCategory={subCategory}
              nationality={nationality}
            ></ProductCategories>
          )}
        </section>
        <div className={styles.divider} />
        {validationErrors.length > 0 && (
          <div className="container">
            <div className={styles.alert}>
              <h3 className={styles.title}>Status</h3>
              <p>
                Preencha corretamente{' '}
                {validationErrors.length > 1
                  ? 'os seguintes campos'
                  : 'o seguinte campo'}{' '}
                para conectar o produto nos canais de vendas:
              </p>
              <ul>
                {validationErrors.map(item => (
                  <li key={item.field}>{item.message}</li>
                ))}
              </ul>
              <br />
            </div>
          </div>
        )}
        <section className={styles.content}>
          <Form
            ref={formRef}
            onSubmit={handleSubmit}
            onChange={() => {
              if (formRef.current) {
                const vars = formRef.current.getData().variations;

                if (vars) {
                  setVariations(vars);
                }
              }
            }}
          >
            <p className={styles.imagesTitle}>Fotos do produto</p>
            <ImageController
              files={files}
              handleFileOrder={handleFileOrder}
              handleOnFileUpload={handleOnFileUpload}
              handleDeleteFile={handleDeleteFile}
            />
            <p>
              {' '}
              *Obrigat??rio: 1 foto de capa fundo branco/neutro + 3 imagens
              ??ngulos diferentes +1 foto pr??ximo ao corpo + 1 tabela de medidas
            </p>
            <p>
              *Observa????o: todas as fotos ser??o redimensionadas automaticamente
              para <b>1000x1000px</b>
            </p>

            <div className={styles.doubleInputContainer}>
              <Input
                name="name"
                label="Nome do produto"
                placeholder="Insira o nome do produto"
                autoComplete="off"
                maxLength={60}
              />
              <Input
                name="brand"
                label="Marca"
                placeholder="Insira a marca"
                autoComplete="off"
              />
            </div>
            <p>
              *Obrigat??rio: Nome do produto + Principais Caracter??sticas +
              Cor/Sabor + Marca
            </p>
            <p>
              *Limite: <b>60</b> caracteres.
            </p>

            <div className={styles.singleInputContainer}>
              <TextArea
                name="description"
                label="Descri????o do produto"
                placeholder="Insira a descri????o do produto"
                autoComplete="off"
                maxLength={1800}
              />
              <p>
                {' '}
                *Obrigat??rio: detalhes do produto + Nome da marca +
                Funcionalidades e como usar o produto + Composi????o + Medidas +
                Validade
              </p>
              <p>
                *Limite: <b>1800</b> caracteres.
              </p>
            </div>

            <div className={styles.titledContainer}>
              <p className={styles.title}>Selecione o g??nero</p>
              <RadioButtonGroup
                name="gender"
                defaultRadio={'U'}
                radios={[
                  { name: 'masculino', value: 'M', label: 'Masculino' },
                  { name: 'feminino', value: 'F', label: 'Feminino' },
                  { name: 'unissex', value: 'U', label: 'Unissex' },
                ]}
              />
            </div>
            <div className={styles.multipleInputContainer}>
              <Input
                name="ean"
                label="EAN"
                placeholder="EAN do produto (opcional)"
                autoComplete="off"
              />
              <Input
                name="sku"
                label="SKU"
                placeholder="SKU do produto"
                autoComplete="off"
                // disabled //TODO: gerar automagico o SKU
              />
              <Input
                name="price"
                label="Pre??o (R$)"
                placeholder="Pre??o"
                autoComplete="off"
                type="number"
                min={0}
                onChange={() => {
                  setPriceChange(true);
                }}
              />
              <Input
                name="price_discounted"
                label="Pre??o com desconto (R$)"
                placeholder="Pre??o com desconto (opcional)"
                autoComplete="off"
                type="number"
                min={0}
                onChange={() => {
                  setPriceChange(true);
                }}
              />
            </div>
            <div className={styles.multipleInputContainer}>
              <Input
                name="height"
                label="Alturam da embalagem (cm)"
                placeholder="Altura"
                autoComplete="off"
                type="number"
              />
              <Input
                name="width"
                label="Largura da embalagem (cm)"
                placeholder="Largura"
                autoComplete="off"
                type="number"
              />
              <Input
                name="length"
                label="Comprimento da embalagem (cm)"
                placeholder="Comprimento"
                autoComplete="off"
                type="number"
              />
              <Input
                name="weight"
                label="Peso total (g)"
                placeholder="Peso"
                autoComplete="off"
                type="number"
              />
            </div>
            <div className={styles.variationsContainer}>
              <div className={styles.variationsContainerTitle}>
                <div className={styles.variationsTitle}>
                  <h3>Informa????es das varia????es do produto</h3>
                  <span>
                    Preencha <b>todos</b> os campos
                  </span>
                </div>
              </div>
              <VariationsController handleAddVariation={handleAddVariation}>
                {variations.map((variation, i) => (
                  <Scope
                    key={variation._id ? variation._id : i}
                    path={`variations[${i}]`}
                  >
                    <VariationField
                      variation={variation}
                      index={i}
                      handleDeleteVariation={handleDeleteVariation}
                      attributes={attributes}
                      allowDelete={i >= 1}
                    />
                  </Scope>
                ))}
              </VariationsController>
            </div>
          </Form>
        </section>
      </div>

      <div className={styles.footerContainer}>
        <span>
          {filledFields}/{totalFields} Informa????es inseridas
        </span>
        <Button
          type="submit"
          onClick={() => {
            formRef.current?.submitForm();
          }}
        >
          Salvar produto
        </Button>
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
            <p className={styles.title}>{modalMessage.title}</p>
            {modalMessage.message.map(message => (
              <p key={message} className={styles.messages}>
                {message}
              </p>
            ))}
          </div>
        </MessageModal>
      )}
    </>
  );
}

export default EditProductForm;
