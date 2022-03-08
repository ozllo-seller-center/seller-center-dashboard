import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { useRouter } from 'next/router';

import { FormHandles, Scope } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';

import {
  FiCheck, FiChevronLeft, FiX,
} from 'react-icons/fi';

import api from 'src/services/api';
import { useAuth } from 'src/hooks/auth';
import { Product, ProductImage, Variation } from 'src/shared/types/product';
import TextArea from 'src/components/Textarea';
import { useLoading } from 'src/hooks/loading';
import { useModalMessage } from 'src/hooks/message';
import Loader from 'src/components/Loader';
import MessageModal from 'src/components/MessageModal';
import VariationField from 'src/components/VariationsController/Variation';
import { Attribute } from 'src/shared/types/category';
import ImageController from 'src/components/ImageController';
import { Rule } from 'src/components/RuledHintbox';
import { matchingWords } from 'src/utils/util';
import Compressor from 'compressorjs';
import styles from './styles.module.scss';
import getValidationErrors from '../../../../utils/getValidationErrors';
import VariationsController from '../../../../components/VariationsController';
import RadioButtonGroup from '../../../../components/RadioButtonGroup';
import Input from '../../../../components/Input';
import Button from '../../../../components/PrimaryButton';

type VariationDTO = {
  size?: number | string,
  stock?: number,
  color?: string,
  flavor?: string;
  gluten_free?: boolean;
  lactose_free?: boolean;
}

export function ProductForm() {
  const [files, setFiles] = useState<ProductImage[]>([]);

  const [filledFields, setFilledFields] = useState(0);
  const [totalFields, setTotalFields] = useState(14);
  const [isHintDisabled, setHintDisabled] = useState(false);
  const [brandInName, setBrandInName] = useState(false);
  const [colorInName, setColorInName] = useState(false);

  const [variations, setVariations] = useState<VariationDTO[]>([{}]);

  const formRef = useRef<FormHandles>(null);

  const router = useRouter();

  const { user, token, updateUser } = useAuth();
  const { isLoading, setLoading } = useLoading();
  const { showModalMessage: showMessage, modalMessage, handleModalMessage } = useModalMessage();

  const [attributes, setAttributes] = useState<Attribute[]>([]);

  const breadCrumbs = useMemo(() => ({
    category: router.query.categoryName,
    subCategory: router.query.subCategoryName,
    nationality: router.query.nationality === '1' ? 'Nacional' : 'Internacional',
  }), [router]);

  const hintRules = useMemo(() => {
    if (isHintDisabled) { return []; }

    const rules = [
      { state: !brandInName, descr: 'Não deve conter o nome da marca' },
      { descr: 'Identifique o produto' },
      { descr: 'Use palavras chave' },
    ] as Rule[];

    if (attributes.findIndex((attr) => attr.name === 'color') >= 0) { rules.splice(1, 0, { state: !colorInName, descr: 'Não deve conter cor' }); }

    return rules;
  }, [attributes, brandInName, colorInName, isHintDisabled]);

  useEffect(() => {
    if (variations.length > 0) {
      setTotalFields(10 + variations.length * (attributes.length + 1));
      return;
    }

    setTotalFields(10 + (attributes.length + 1));
  }, [variations, attributes]);

  const calcFilledFields = useCallback((data: Product) => {
    let filled = 0;

    if (data.name) { filled += 1; }
    if (data.brand) { filled += 1; }
    if (data.description) { filled += 1; }
    if (data.sku) { filled += 1; }
    if (data.height) { filled += 1; }
    if (data.width) { filled += 1; }
    if (data.length) { filled += 1; }
    if (data.weight) { filled += 1; }
    if (data.price) { filled += 1; }
    if (data.images?.length > 0) { filled += 1; }

    data.variations.forEach((variation) => {
      if (variation.size) { filled += 1; }
      if (variation.stock) { filled += 1; }
      if (variation.color) { filled += 1; }
      if (variation.flavor) { filled += 1; }

      attributes.map((attribute) => {
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

    setFilledFields(filled);
  }, [attributes]);

  useEffect(() => {
    setLoading(true);

    api.get('/account/detail').then((response) => {
      updateUser({ ...user, shopInfo: { ...user.shopInfo, _id: response.data.shopInfo._id, userId: response.data.shopInfo.userId } });
    }).catch((err) => {
      console.log(err);
    });

    api.get(`/category/${router.query.category}/attributes`).then((response) => {
      setAttributes(response.data[0].attributes);

      response.data[0].attributes.map((attr: Attribute) => {
        if (attr.name === 'flavor') {
          setHintDisabled(true);
        }
      });

      setLoading(false);
    }).catch((err) => {
      console.log(err);
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setNameChecks = useCallback((name: string) => {
    if (!name || name.length === 0 || !formRef.current?.getFieldValue('brand') || isHintDisabled) {
      setBrandInName(false);
      setColorInName(false);
      return;
    }

    const brandCheck = matchingWords(name, formRef.current?.getFieldValue('brand'));

    setBrandInName(brandCheck);

    let colorCheck = false;

    attributes.map(async (attr) => {
      if (attr.name === 'color') {
        attr.values?.map((color) => {
          if (colorCheck) { return; }

          colorCheck = matchingWords(name, color);
        });
      }
    });

    setColorInName(colorCheck);

    if (brandCheck || colorCheck) {
      formRef.current?.setFieldError('name', brandCheck ? 'Não insira a marca no nome do produto' : 'Não informe a cor no nome do produto');
      return;
    }

    formRef.current?.setFieldError('name', '');
  }, [attributes, isHintDisabled]);

  const handleOnFileUpload = useCallback((acceptedFiles: File[], dropZoneRef: React.RefObject<any>) => {
    calcFilledFields(formRef.current?.getData() as Product);

    acceptedFiles = acceptedFiles.filter((f, i) => {
      if (files.length + (i + 1) > 6) {
        handleModalMessage(true, {
          type: 'error',
          title: 'Muitas fotos!',
          message: ['Um produto pode ter no máximo 6 fotos'],
        });

        return false;
      }

      return true;
    });

    const newFiles = acceptedFiles.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
    } as ProductImage));

    newFiles.forEach((nf) => {
      // console.log(nf.file?.size)
      if (nf.file) {
        const compressor = new Compressor(nf.file, {
          width: 1000,
          height: 1000,
          success(result) {
            nf.file = result as File;
            nf.url = URL.createObjectURL(result);
          },
          error(err) {
            console.log(err.message);
          },
        });
      }
    });

    dropZoneRef.current.acceptedFiles = [...files, ...newFiles].map((f) => f.url);
    setFiles([...files, ...newFiles]);
  }, [calcFilledFields, files, handleModalMessage]);

  const handleDeleteFile = useCallback((file: string) => {
    URL.revokeObjectURL(file);

    const deletedIndex = files.findIndex((f) => f.url === file);

    const filesUpdate = files.filter((f, i) => i !== deletedIndex);

    formRef.current?.setFieldValue('images', filesUpdate);

    const drop = formRef.current?.getFieldRef('images');

    if (drop) {
      drop.value = '';
    }

    setFiles(filesUpdate);

    calcFilledFields(formRef.current?.getData() as Product);
  }, [calcFilledFields, files]);

  const handleFileOrder = useCallback((draggedFile: number, droppedAt: number) => {
    if (draggedFile === droppedAt) { return; }

    let newFiles = [...files];

    const auxFile = newFiles[draggedFile];

    newFiles = newFiles.filter((item, i) => i !== draggedFile);

    newFiles.splice(droppedAt, 0, auxFile);

    setFiles([...newFiles]);
  }, [files]);

  const handleModalVisibility = useCallback(() => {
    handleModalMessage(false);
  }, [handleModalMessage]);

  const yupVariationSchema = useCallback((): object => (attributes.findIndex((attribute) => attribute.name === 'flavor') >= 0
    ? {
      variations: Yup.array().required().of(Yup.object().shape({
        size: Yup.string().required('Campo obrigatório'),
        flavor: Yup.string().required('Campo obrigatório'),
        stock: Yup.number().typeError('Campo obrigatório').required('Campo obrigatório').min(0, 'Valor mínimo 0'),
      })),
    }
    : {
      variations: Yup.array().required().of(Yup.object().shape({
        size: Yup.string().required('Campo obrigatório'),
        color: Yup.string().required('Campo obrigatório'),
        stock: Yup.number().typeError('Campo obrigatório').required('Campo obrigatório').min(0, 'Valor mínimo 0'),
      })),
    }), [attributes]);

  const handleSubmit = useCallback(async (data) => {
    if (filledFields < totalFields) {
      handleModalMessage(true, { type: 'error', title: 'Formulário incompleto', message: ['Preencha todas as informações obrigatórias antes de continuar.'] });
      return;
    }

    if (colorInName || brandInName) {
      handleModalMessage(true, { type: 'error', title: 'Nome de produto inválido', message: [brandInName ? 'Remova a marca do nome do produto.' : 'Remova a cor do nome do produto.', 'Quando necessário o sistema adicionará essas informações ao nome do produto.'] });
      return;
    }

    if (data.price_discounted === '') {
      data.price_discounted = data.price;
    }

    try {
      setLoading(true);
      formRef.current?.setErrors({});

      const schema = Yup.object().shape({
        images: Yup.array().min(2, 'Escolha pelo menos duas imagens').max(8, 'Pode atribuir no máximo 8 imagens'),
        name: Yup.string().required('Campo obrigatório').min(2, 'Deve conter pelo menos 2 caracteres'),
        description: Yup.string()
          .required('Campo obrigatório').min(2, 'Deve conter pelo menos 2 caracteres').max(1800, 'Deve conter no máximo 1800 caracteres'),
        brand: Yup.string().required('Campo obrigatório').min(2, 'Deve conter pelo menos 2 caracteres'),
        ean: Yup.string(),
        sku: Yup.string().required('Campo obrigatório').min(2, 'Deve conter pelo menos 2 caracteres'),
        height: Yup.number().min(10, 'Mínimo de 10cm'),
        width: Yup.number().min(10, 'Mínimo de 10cm'),
        length: Yup.number().min(10, 'Mínimo de 10cm'),
        weight: Yup.number().required('Campo obrigatório'),
        gender: Yup.string(),
        price: Yup.number().required('Campo obrigatório'),
        price_discounted: Yup.number().nullable().min(0, 'Valor mínimo de R$ 0').max(data.price, `Valor máximo de R$ ${data.price}`),
        ...yupVariationSchema(),
      });

      await schema.validate(data, { abortEarly: false });

      const {
        category,
        subCategory,
        nationality,
      } = router.query;

      const dataContainer = new FormData();

      files.forEach((f) => {
        if (f.file) { dataContainer.append('images', f.file, f.file.name); }
      });

      const imagesUrls = await api.post('/product/upload', dataContainer, {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        },
      }).then((response) => response.data.urls);

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

      vars.map((v: Variation) => {
        delete v._id;
      });

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
        price,
        price_discounted,
        images: imagesUrls,
        variations: vars,
      };

      await api.post('/product', product, {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        },
      }).then(() => {
        setLoading(false);

        if (window.innerWidth >= 768) {
          router.push('/products');
          return;
        }

        router.push('/products-mobile');
      }).catch((err) => {
        console.log(err.response.data);

        handleModalMessage(true, { title: 'Erro', message: ['Ocorreu um erro inesperado'], type: 'error' });
      });

      setLoading(false);
    } catch (err) {
      setLoading(false);

      if (err instanceof Yup.ValidationError) {
        const errors = getValidationErrors(err);

        formRef.current?.setErrors(errors);

        if (err.name === 'images') {
          handleModalMessage(true, {
            type: 'error',
            title: 'Erro!',
            message: [err.message],
          });
        }

        return;
      }

      console.log(err);
    }
  }, [filledFields, totalFields, colorInName, brandInName, handleModalMessage, setLoading, yupVariationSchema, router, files, token, user.shopInfo._id]);

  async function handleDeleteVariation(deletedIndex: number): Promise<void> {
    setVariations(formRef.current?.getData().variations);

    const tempVars = formRef.current?.getData().variations;
    tempVars.splice(deletedIndex, 1);

    setVariations(tempVars);

    formRef.current?.setData({ ...formRef.current?.getData(), variations: tempVars });
    calcFilledFields({ ...formRef.current?.getData(), variations: tempVars } as Product);
    setTotalFields(10 + tempVars.length * 3);
  }

  const handleAddVariation = useCallback(() => {
    setVariations([...variations, {}]);
  }, [variations]);

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
            {
              !!breadCrumbs.nationality && (
                <span className={breadCrumbs.category ? styles.crumb : styles.activeCrumb}>{breadCrumbs.nationality}</span>
              )
            }
            {
              !!breadCrumbs.category && (
                <>
                  <span className={styles.separator}>/</span>
                  <span className={breadCrumbs.subCategory ? styles.crumb : styles.activeCrumb}>{breadCrumbs.category}</span>
                </>
              )
            }
            {
              !!breadCrumbs.subCategory && (
                <>
                  <span className={styles.separator}>/</span>
                  <span className={styles.activeCrumb}>{breadCrumbs.subCategory}</span>
                </>
              )
            }
          </div>
        </section>

        <div className={styles.divider} />

        <section className={styles.content}>
          <Form
            ref={formRef}
            onSubmit={handleSubmit}
            onChange={(e) => {
              calcFilledFields(formRef.current?.getData() as Product);
            }}
          >
            <p className={styles.imagesTitle}>Seleciones as fotos do produto</p>

            <ImageController
              files={files}
              handleFileOrder={handleFileOrder}
              handleOnFileUpload={handleOnFileUpload}
              handleDeleteFile={handleDeleteFile}
            />
            <p> *Padrão: 1 foto de capa fundo branco/neutro + 3 imagens ângulos diferentes +1 foto próximo ao corpo + 1 tabela de medidas</p>

            <div className={styles.doubleInputContainer}>
              {/* <HintedInput
                name='name'
                label='Nome do produto'
                placeholder='Insira o nome do produto'
                autoComplete='off'
                maxLength={100}
                hint={!isHintDisabled && (
                  <RuledHintbox
                    title={'Orientações para nomeação'}
                    rules={hintRules}
                    example='Ex.: Sapato Cano Alto Fit'
                    icon={FiInfo}
                  />
                )}
                onChange={(e) => {
                  setNameChecks(e.currentTarget.value)
                }}
              /> */}
              <Input
                name="name"
                label="Nome do produto"
                placeholder="Insira o nome do produto"
                autoComplete="off"
                maxLength={100}
              />

              <Input
                name="brand"
                label="Marca"
                placeholder="Insira a marca"
                autoComplete="off"
              />
            </div>
            <p>*Padrão: Nome do produto + Principais Características + Cor/Sabor</p>

            <div className={styles.singleInputContainer}>
              <TextArea
                name="description"
                label="Descrição do produto"
                placeholder="Insira a descrição do produto"
                autoComplete="off"
                maxLength={1800}
              />
              <p> *Padrão: detalhes do produto + Nome da marca + Funcionalidades e como usar o produto + Composição + Medidas +  Validade</p>
            </div>

            <div className={styles.titledContainer}>
              <p className={styles.title}>Selecione o gênero</p>

              <RadioButtonGroup
                name="gender"
                defaultRadio="M"
                radios={[
                  { name: 'masculino', value: 'M', label: 'Masculino' },
                  { name: 'feminino', value: 'F', label: 'Feminino' },
                  { name: 'unissex', value: 'U', label: 'Unissex' }]}
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
                label="Preço (R$)"
                placeholder="Preço"
                autoComplete="off"
                type="number"
                min={0}
              />

              <Input
                name="price_discounted"
                label="Preço com desconto (R$)"
                placeholder="Preço com desconto (opcional)"
                autoComplete="off"
                type="number"
                min={0}
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
                placeholder="Largura da embalagem"
                autoComplete="off"
                type="number"
              />

              <Input
                name="length"
                label="Comprimento da embalagem (cm)"
                placeholder="Comprimento da embalagem"
                autoComplete="off"
                type="number"
              />

              <Input
                name="weight"
                label="Peso total (g)"
                placeholder="Peso total"
                autoComplete="off"
              />
            </div>

            <div className={styles.variationsContainer}>
              <div className={styles.variationsContainerTitle}>
                <div className={styles.variationsTitle}>
                  <h3>Informações das variações do produto</h3>
                  <span>
                    Preencha
                    {' '}
                    <b>todos</b>
                    {' '}
                    os campos
                  </span>
                </div>
              </div>

              <VariationsController handleAddVariation={handleAddVariation}>
                {
                  variations.map((variation, i) => (
                    <Scope key={JSON.stringify(variation)} path={`variations[${i}]`}>
                      <VariationField
                        variation={variation}
                        index={i}
                        handleDeleteVariation={() => handleDeleteVariation(i)}
                        attributes={attributes}
                        allowDelete={variations.length > 1}
                      />
                    </Scope>
                  ))
                }
              </VariationsController>
            </div>
          </Form>
        </section>
      </div>

      <div className={styles.footerContainer}>
        <span>
          {filledFields}
          /
          {totalFields}
          {' '}
          Informações inseridas
        </span>
        {filledFields >= totalFields && <Button type="submit" onClick={() => { formRef.current?.submitForm(); }}>Cadastrar produto</Button>}
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
              <p className={styles.title}>{modalMessage.title}</p>
              {modalMessage.message.map((message) => <p key={message} className={styles.messages}>{message}</p>)}
            </div>
          </MessageModal>
        )
      }
    </>
  );
}

export default ProductForm;
