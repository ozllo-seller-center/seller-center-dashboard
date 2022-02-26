import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'

import { FormHandles, Scope } from '@unform/core'
import { Form } from '@unform/web'
import * as Yup from 'yup'

import Button from '../../../components/PrimaryButton'
import Input from '../../../components/Input'
import RadioButtonGroup from '../../../components/RadioButtonGroup'
import VariationsController from '../../../components/VariationsController'
import getValidationErrors from '../../../utils/getValidationErrors'

import { FiCheck, FiChevronLeft, FiInfo, FiX } from 'react-icons/fi'

import styles from './styles.module.scss'

import api from 'src/services/api'
import { useAuth } from 'src/hooks/auth'
import { Product, ProductImage } from 'src/shared/types/product'
import TextArea from 'src/components/Textarea'
import { useLoading } from 'src/hooks/loading'
import { useModalMessage } from 'src/hooks/message'
import { Loader } from 'src/components/Loader'
import MessageModal from 'src/components/MessageModal'
import Variation from 'src/components/VariationsController/Variation'
import { Attribute } from 'src/shared/types/category'
import ImageController from 'src/components/ImageController'
import RuledHintbox, { Rule } from 'src/components/RuledHintbox'
import { matchingWords } from 'src/utils/util'
import HintedInput from 'src/components/HintedInput'

import Compressor from 'compressorjs'

type VariationDTO = {
  _id?: string
  size?: number | string,
  stock?: number,
  color?: string,
}

export function EditProductForm() {
  const [files, setFiles] = useState<ProductImage[]>([])
  const [filesUrl, setFilesUrl] = useState<string[]>([])

  const [totalFields, setTotalFields] = useState(14)

  const [oldStock, setOldStock] = useState<number[]>([])
  const [priceChanged, setPriceChange] = useState(false)
  const [isHintDisabled, setHintDisabled] = useState(false)
  const [brandInName, setBrandInName] = useState(false)
  const [colorInName, setColorInName] = useState(false)

  const [variations, setVariations] = useState<VariationDTO[]>([{}])
  const [nationality, setNationality] = useState('')
  const [category, setCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [genderRadio, setGenderRadio] = useState('M')

  const formRef = useRef<FormHandles>(null)

  const router = useRouter()

  const { user, token, updateUser, signOut } = useAuth()
  const { isLoading, setLoading } = useLoading()
  const { showModalMessage: showMessage, modalMessage, handleModalMessage } = useModalMessage()

  const [attributes, setAttributes] = useState<Attribute[]>([])

  const hintRules = useMemo(() => {
    if (isHintDisabled)
      return []

    const rules = [
      { state: !brandInName, descr: 'Não deve conter o nome da marca' },
      { descr: 'Identifique o produto' },
      { descr: 'Use palavras chave' }
    ] as Rule[]

    if (attributes.findIndex(attr => attr.name === 'color') >= 0)
      rules.splice(1, 0, { state: !colorInName, descr: 'Não deve conter cor' })

    return rules
  }, [attributes, brandInName, colorInName, isHintDisabled])

  useEffect(() => {
    // setLoading(true)

    api.get(`auth/token/${token}`).then(response => {
      const { isValid } = response.data

      if (!isValid) {
        signOut()
        router.push('/')
        return
      }

      api.get('/account/detail').then(response => {
        updateUser({ ...user, shopInfo: { ...user.shopInfo, _id: response.data.shopInfo._id, userId: response.data.shopInfo.userId } })
      }).catch(err => {
        console.log(err)
      })

    }).catch((error) => {
      signOut()
      router.push('/')
      return
    })
  }, [])


  useEffect(() => {
    setLoading(true)

    if (!!formRef.current && !!user) {
      const { id } = router.query

      api.get(`/product/${id}`, {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        }
      }).then(response => {
        const urls = response.data.images.filter((url: string) => (!!url && url !== null))
        setFilesUrl(urls)

        let files: ProductImage[]
        files = urls.map((url: string) => {
          return {
            url,
            uploaded: true,
          } as ProductImage
        })

        setFiles(files)

        setGenderRadio(response.data.gender)

        setVariations(response.data.variations)
        setOldStock(response.data.variations.map((v: VariationDTO) => v.stock))

        setNationality(response.data.nationality)
        setCategory(response.data.category)
        setSubCategory(response.data.subcategory)

        formRef.current?.setData(response.data)
        // setFormData(response.data)

        setLoading(false)
      }).catch(err => {
        console.log(err)

        setLoading(false)
        handleModalMessage(true, { title: 'Erro', message: ['Erro ao carregar o produto'], type: 'error' })
      })
    }
  }, [user, formRef])

  useEffect(() => {
    setLoading(true)

    if (!!category) {
      api.get(`/category/${category}/attributes`).then(response => {
        setAttributes(response.data[0].attributes)

        response.data[0].attributes.map((attr: Attribute) => {
          if (attr.name === 'flavor') {
            setHintDisabled(true)
          }
        })

        setLoading(false)
      }).catch(err => {
        console.log(err)

        setLoading(false)
      })
    }
  }, [category])

  useEffect(() => {
    if (variations.length > 0) {
      setTotalFields(10 + variations.length * (attributes.length + 1))
      return
    }

    setTotalFields(10 + (attributes.length + 1))
  }, [variations, attributes])

  const setNameChecks = useCallback((name: string) => {
    if (!name || name.length === 0 || !formRef.current?.getFieldValue('brand') || isHintDisabled) {
      setBrandInName(false)
      setColorInName(false)
      return
    }

    let brandCheck = matchingWords(name, formRef.current?.getFieldValue('brand'))

    setBrandInName(brandCheck)

    let colorCheck = false

    attributes.map(async attr => {
      if (attr.name === 'color') {
        attr.values?.map(color => {
          if (colorCheck)
            return

          colorCheck = matchingWords(name, color)
        })
      }
    })

    setColorInName(colorCheck)

    if (brandCheck || colorCheck) {
      formRef.current?.setFieldError('name', brandCheck ? 'Não insira a marca no nome do produto' : 'Não informe a cor no nome do produto')
      return
    }

    formRef.current?.setFieldError('name', '')
  }, [attributes, isHintDisabled])

  const handleModalVisibility = useCallback(() => {
    handleModalMessage(false)
  }, [])


  const handleOnFileUpload = useCallback((acceptedFiles: File[], dropZoneRef: React.RefObject<any>) => {
    acceptedFiles = acceptedFiles.filter((f, i) => {
      if (files.length + (i + 1) > 6) {
        handleModalMessage(true, {
          type: 'error',
          title: 'Muitas fotos!',
          message: ['Um produto pode ter no máximo 6 fotos']
        })

        return false
      }

      return true
    })

    const newFiles = acceptedFiles.map(f => {
      return {
        file: f
      } as ProductImage
    })

    setLoading(true)

    let urls: string[] = []
    newFiles.forEach(f => {
      if (f.file) {
        f.uploaded = false

        new Compressor(f.file, {
          width: 1000,
          height: 1000,
          success(result) {
            const url = URL.createObjectURL(result)

            urls.push(url)

            f.file = result as File
            f.url = url

            setLoading(false)
          },
          error(err) {
            console.log(err.message)

            setLoading(false)
          },
        })

      }
    })

    dropZoneRef.current.acceptedFiles = [...files, ...newFiles].map(f => f.url)

    setFiles([...files, ...newFiles])
    setFilesUrl([...filesUrl, ...urls])
  }, [files, filesUrl])

  const handleDeleteFile = useCallback((url: string) => {
    URL.revokeObjectURL(url)

    const deletedIndex = files.findIndex(f => f.url === url)

    const urlsUpdate = filesUrl.filter((f, i) => i !== deletedIndex)
    const filesUpdate = files.filter((f, i) => i !== deletedIndex)

    formRef.current?.setFieldValue('images', filesUpdate)
    setFilesUrl(urlsUpdate)
    setFiles(filesUpdate)
  }, [filesUrl, files])

  const handleFileOrder = useCallback((draggedFile: number, droppedAt: number) => {

    if (draggedFile === droppedAt)
      return

    let newFiles = [...files]

    const auxFile = newFiles[draggedFile]

    newFiles = newFiles.filter((item, i) => i != draggedFile)

    newFiles.splice(droppedAt, 0, auxFile)

    setFiles([...newFiles])
  }, [files])

  const filledFields = useMemo(() => {

    if (!formRef.current)
      return 0

    const data = formRef.current?.getData() as Product;

    if (!data)
      return 0

    let filled = 0

    if (data.name)
      filled++

    if (data.brand)
      filled++

    if (data.description)
      filled++

    if (data.sku)
      filled++

    if (data.height)
      filled++

    if (data.width)
      filled++

    if (data.length)
      filled++

    if (data.weight)
      filled++

    if (data.price)
      filled++

    if (files.length >= 2)
      filled++


    data.variations.forEach(variation => {
      !!variation.size && filled++
      !!variation.stock && filled++
      !!variation.color && filled++
      !!variation.flavor && filled++

      attributes.map(attribute => {
        switch (attribute.name) {
          case 'gluten_free':
            filled++
            break
          case 'lactose_free':
            filled++
            break
        }
      })
    })

    return filled
  }, [files, totalFields, attributes, formRef.current?.getData()])

  const yupVariationSchema = useCallback((): object => {
    return attributes.findIndex(attribute => attribute.name === 'flavor') >= 0 ?
      {
        variations: Yup.array().required().of(Yup.object().shape({
          size: Yup.string().required('Campo obrigatório'),
          flavor: Yup.string().required('Campo obrigatório'),
          stock: Yup.number().typeError('Campo obrigatório').required('Campo obrigatório').min(0, 'Valor mínimo 0'),
        }))
      }
      :
      {
        variations: Yup.array().required().of(Yup.object().shape({
          size: Yup.string().required('Campo obrigatório'),
          color: Yup.string().required('Campo obrigatório'),
          stock: Yup.number().typeError('Campo obrigatório').required('Campo obrigatório').min(0, 'Valor mínimo 0'),
        }))
      }
  }, [attributes])

  const handleSubmit = useCallback(async (data) => {
    if (filledFields < totalFields) {
      handleModalMessage(true, { type: 'error', title: 'Formulário incompleto', message: ['Preencha todas as informações obrigatórias antes de continuar.'] })
      return
    }

    if (colorInName || brandInName) {
      handleModalMessage(true, { type: 'error', title: 'Nome de produto inválido', message: [brandInName ? 'Remova a marca do nome do produto.' : 'Remova a cor do nome do produto.', 'Quando necessário o sistema adicionará essas informações ao nome do produto.'] })
      return
    }

    if (data.price_discounted === "") {
      data.price_discounted = data.price
    }

    try {
      setLoading(true)
      formRef.current?.setErrors({})

      const schema = Yup.object().shape({
        images: Yup.array().min(2, 'Escolha pelo menos duas imagens').max(8, 'Pode atribuir no máximo 8 imagens'),
        name: Yup.string().required('Campo obrigatório').min(2, "Deve conter pelo menos 2 caracteres"),
        description: Yup.string()
          .required('Campo obrigatório').min(2, 'Deve conter pelo menos 2 caracteres').max(1800, 'Deve conter no máximo 1800 caracteres'),
        brand: Yup.string().required('Campo obrigatório').min(2, "Deve conter pelo menos 2 caracteres"),
        ean: Yup.string(),
        sku: Yup.string().required('Campo obrigatório'),
        height: Yup.number().min(10, 'Mínimo de 10cm'),
        width: Yup.number().min(10, 'Mínimo de 10cm'),
        length: Yup.number().min(10, 'Mínimo de 10cm'),
        weight: Yup.number().required('Campo obrigatório'),
        gender: Yup.string(),
        price: Yup.number().required('Campo obrigatório'),
        price_discounted: Yup.number().nullable().min(0, 'Valor mínimo de R$ 0').max(data.price, `Valor máximo de R$ ${data.price}`),
        ...yupVariationSchema(),
      })

      await schema.validate(data, { abortEarly: false })

      const {
        id
      } = router.query

      var dataContainer = new FormData()

      files.forEach((f, i) => (!!f.file && !f.uploaded) && dataContainer.append("images", f.file, f.file.name))

      const oldImages = files.map(f => {
        if (!!f.url && f.uploaded)
          return f.url
      })

      let newImages = await api.post('/product/upload', dataContainer, {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        }
      }).then(response => {
        return response.data.urls as string[]
      })

      if (!!oldImages)
        newImages = [...oldImages as string[], ...newImages]

      await api.patch(`/product/${id}/images`, { images: newImages }, {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        }
      }).then(response => {

      })

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
        variations
      } = data

      if (priceChanged) {
        api.patch(`/product/${id}/price`, {
          price,
          price_discounted
        }, {
          headers: {
            authorization: token,
            shop_id: user.shopInfo._id,
          }
        }).then(response => {

        })
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
      }

      await variations.forEach(async (variation: VariationDTO, i: number) => {
        if (!!variation._id && variation._id !== '') {
          const variationId = variation._id

          if (oldStock[i] != variation.stock) {
            api.patch(`/product/${id}/variation/${variationId}`,
              { stock: variation.stock },
              {
                headers: {
                  authorization: token,
                  shop_id: user.shopInfo._id,
                }
              })
          }

          delete variation._id
          delete variation.stock

          await api.patch(`/product/${id}/variation/${variationId}`, variation, {
            headers: {
              authorization: token,
              shop_id: user.shopInfo._id,
            }
          }).then(response => {

          })

          return
        }

        delete variation._id

        await api.post(`/product/${id}/variation`, variation, {
          headers: {
            authorization: token,
            shop_id: user.shopInfo._id,
          }
        }).then(response => {

        })
      })

      await api.patch(`/product/${id}`, product, {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        }
      }).then(response => {
        setLoading(false)

        if (window.innerWidth >= 768) {
          router.push('/products')
          return
        }

        router.push('/products-mobile')
      })
    } catch (err) {
      setLoading(false)
      console.log(err)
      if (err instanceof Yup.ValidationError) {
        const errors = getValidationErrors(err)
        formRef.current?.setErrors(errors)

        return
      }
    }
  }, [router, token, user, files, filesUrl, filledFields, totalFields, priceChanged, colorInName, brandInName])

  async function handleDeleteVariation(deletedIndex: number): Promise<void> {
    setVariations(formRef.current?.getData().variations)

    const tempVars = variations.filter((vars, i) => i !== deletedIndex)
    const deletedVariation = variations[deletedIndex]

    setVariations(tempVars)

    formRef.current?.setFieldValue('variations', tempVars)
    formRef.current?.setData({ ...formRef.current?.getData(), variations: tempVars })

    const { id } = router.query
    await api.delete(`/product/${id}/variation/${deletedVariation._id}`, {
      headers: {
        authorization: token,
        shop_id: user.shopInfo._id,
      },
    }).then(response => { })
  }

  const handleAddVariation = useCallback(() => {
    setVariations([...variations, {}])
  }, [variations])

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

          {/* TODO: Definir api para recuperar os dados das categorias */}

          {/* <div className={styles.breadCumbs}>
            {
              !!nationality && (
                <span className={!!category ? styles.crumb : styles.activeCrumb}>{nationality}</span>
              )
            }
            {
              !!category && (
                <>
                  <span className={styles.separator}>/</span>
                  <span className={!!subCategory ? styles.crumb : styles.activeCrumb}>{category}</span>
                </>
              )
            }
            {
              !!subCategory && (
                <>
                  <span className={styles.separator}>/</span>
                  <span className={styles.activeCrumb}>{subCategory}</span>
                </>
              )
            }
          </div> */}
        </section>
        <div className={styles.divider} />
        <section className={styles.content}>
          <Form
            ref={formRef}
            onSubmit={handleSubmit}
            // onChange={(e) => { calcFilledFields(formRef.current?.getData() as Product) }}
          >
            <p className={styles.imagesTitle}>Fotos do produto</p>
            <ImageController
              files={files}
              handleFileOrder={handleFileOrder}
              handleOnFileUpload={handleOnFileUpload}
              handleDeleteFile={handleDeleteFile}
            />
            <div className={styles.doubleInputContainer}>
              <HintedInput
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
              />
              <Input
                name='brand'
                label='Marca'
                placeholder='Insira a marca'
                autoComplete='off'
              />

            </div>

            <div className={styles.singleInputContainer}>
              <TextArea
                name='description'
                label='Descrição do produto'
                placeholder='Insira a descrição do produto'
                autoComplete='off'
                maxLength={1800}
              />
            </div>

            <div className={styles.titledContainer}>
              <p className={styles.title}>Selecione o gênero</p>
              <RadioButtonGroup
                name='gender'
                defaultRadio={genderRadio}
                radios={[
                  { name: 'masculino', value: 'M', label: 'Masculino' },
                  { name: 'feminino', value: 'F', label: 'Feminino' },
                  { name: 'unissex', value: 'U', label: 'Unissex' }]}
              />
            </div>
            <div className={styles.multipleInputContainer}>
              <Input
                name='ean'
                label='EAN'
                placeholder='EAN do produto (opcional)'
                autoComplete='off'
              />
              <Input
                name='sku'
                label='SKU'
                placeholder='SKU do produto'
                autoComplete='off'
              // disabled //TODO: gerar automagico o SKU
              />
              <Input
                name='price'
                label='Preço (R$)'
                placeholder='Preço'
                autoComplete='off'
                type='number'
                min={0}
                onChange={() => {
                  setPriceChange(true)
                }}
              />
              <Input
                name='price_discounted'
                label='Preço com desconto (R$)'
                placeholder='Preço com desconto (opcional)'
                autoComplete='off'
                type='number'
                min={0}
                onChange={() => {
                  setPriceChange(true)
                }}
              />
            </div>
            <div className={styles.multipleInputContainer}>
              <Input
                name='height'
                label='Alturam da embalagem (cm)'
                placeholder='Altura'
                autoComplete='off'
                type='number'
              />
              <Input
                name='width'
                label='Largura da embalagem (cm)'
                placeholder='Largura'
                autoComplete='off'
                type='number'
              />
              <Input
                name='length'
                label='Comprimento da embalagem (cm)'
                placeholder='Comprimento'
                autoComplete='off'
                type='number'
              />
              <Input
                name='weight'
                label='Peso total (g)'
                placeholder='Peso'
                autoComplete='off'
                type='number'
              />
            </div>
            <div className={styles.variationsContainer}>
              <div className={styles.variationsContainerTitle}>
                <div className={styles.variationsTitle}>
                  <h3>Informações das variações do produto</h3>
                  <span>Preencha <b>todos</b> os campos</span>
                </div>
              </div>
              <VariationsController handleAddVariation={handleAddVariation}>
                {
                  variations.map((variation, i) => {
                    return (
                      <Scope key={i} path={`variations[${i}]`}>
                        <Variation
                          variation={variation}
                          index={i}
                          handleDeleteVariation={handleDeleteVariation}
                          attributes={attributes}
                          allowDelete={i >= 1}
                        />
                      </Scope>
                    )
                  })
                }
              </VariationsController>
            </div>
          </Form>
        </section>
      </div>

      <div className={styles.footerContainer}>
        <span>{filledFields}/{totalFields} Informações inseridas</span>
        {filledFields >= totalFields && <Button type='submit' onClick={() => { formRef.current?.submitForm() }}>Cadastrar produto</Button>}
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
              {modalMessage.message.map((message, i) => <p key={i} className={styles.messages}>{message}</p>)}
            </div>
          </MessageModal>
        )
      }
    </>
  )
}

export default EditProductForm
