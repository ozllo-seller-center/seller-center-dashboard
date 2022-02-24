import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Form } from '@unform/web'
import { FormHandles } from '@unform/core'
import { Alert, AlertColor, Snackbar } from '@mui/material'
import router from 'next/router'

import styles from './styles.module.scss'
import Input from 'src/components/Input'

import img1 from '../../../../public/assets/bling.png'
import img2 from '../../../../public/assets/ecoys.jpg'
import img3 from '../../../../public/assets/ihub.png'
import img4 from '../../../../public/assets/infra.jpg'
import img5 from '../../../../public/assets/linxC.png'
import img6 from '../../../../public/assets/linxE.png'
import img7 from '../../../../public/assets/linxO.png'
import img8 from '../../../../public/assets/lojaI.png'
import img9 from '../../../../public/assets/magento.png'
import img10 from '../../../../public/assets/opencart.png'
import img11 from '../../../../public/assets/tiny.png'
import img12 from '../../../../public/assets/tray.png'
import img13 from '../../../../public/assets/vtex.png'
import img14 from '../../../../public/assets/woo.png'
import img15 from '../../../../public/assets/magento2.png'
import img16 from '../../../../public/assets/softvar.png'
import img17 from '../../../../public/assets/Bseller.png'
import img18 from '../../../../public/assets/idealeWare.png'
import Textfield from 'src/components/Textfield'
import Button from 'src/components/PrimaryButton'

interface PlatformInfo {
  title: string,
  img: string,
  apiUrl?: boolean,
  url?: boolean,
  ecommerceUrl?: boolean,
  apiKey?: boolean,
  secret?: boolean,
  token?: boolean,
  jwt?: boolean,
  clientId?: boolean,
  channelId?: boolean,
  sellerdId?: boolean,
  shopId?: boolean,
  shopName?: boolean,
  userId?: boolean,
  user?: boolean,
  email?: boolean,
  password?: boolean,
  eMillenium?: boolean,
  websiteId?: boolean,
  storeView?: boolean,
  adminIdOpenCart?: boolean,
  stockId?: boolean,
  ecommerceId?: boolean,
  vtexKey?: boolean,
  vtexToken?: boolean,
  vtexPoliticId?: boolean,

  wooCommerceKey?: boolean,
  wooCommerceConsumer?: boolean,
}

const Platform: React.FC = () => {

  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>({ title: '', img: '' })

  const [open, setOpen] = useState(false)
  const [type, setType] = useState<AlertColor>('success')
  const [message, setMessage] = useState('')

  const formRef = useRef<FormHandles>(null)

  const handleClose = useCallback((event, reason) => {
    setOpen(false)
  }, [])

  const { platform } = router.query

  useEffect(() => {
    let info: PlatformInfo

    switch (platform) {
      case 'bling':

        info = {
          title: 'Bling',
          img: img1.src,
          apiKey: true
        }

        setPlatformInfo(info)

        break

      case 'bseller':

        info = {
          title: 'Seller',
          img: img17.src,
          apiKey: true
        }

        setPlatformInfo(info)

        break

      case 'eccoys':

        info = {
          title: 'Eccoys',
          img: img2.src,
          url: true,
          apiKey: true,
          secret: true,
          ecommerceUrl: true,
        }

        setPlatformInfo(info)

        break

      case 'idealaware':

        info = {
          title: 'IdealaWare',
          img: img18.src,
          url: true,
          email: true,
          password: true,
        }

        setPlatformInfo(info)

        break

      case 'ihub':

        info = {
          title: 'IHub',
          img: img3.src,
          apiUrl: true,
          jwt: true,
          sellerdId: true,
        }

        setPlatformInfo(info)

        break

      case 'infracommerce':

        info = {
          title: 'Infra.commerce',
          img: img4.src,
          shopName: true,
          url: true,
          user: true,
          password: true,
        }

        setPlatformInfo(info)

        break

      case 'linxc':

        info = {
          title: 'Linx Commerce',
          img: img5.src,
          user: true,
          password: true,
        }

        setPlatformInfo(info)

        break

      case 'linxe':

        info = {
          title: 'Linx Emillenium',
          img: img6.src,
          url: true,
          user: true,
          password: true,
          eMillenium: true,
        }

        setPlatformInfo(info)

        break

      case 'linxo':

        info = {
          title: 'Linx OMS',
          img: img7.src,
          user: true,
          password: true,
          apiUrl: true,
          clientId: true,
          channelId: true,
        }

        setPlatformInfo(info)

        break

      case 'lojaintegrada':

        info = {
          title: 'Loja Integrada',
          img: img8.src,
          apiKey: true,
        }

        setPlatformInfo(info)

        break

      case 'magento':

        info = {
          title: 'Magento',
          img: img9.src,
          url: true,
          apiKey: true,
          userId: true,
          websiteId: true,
          storeView: true,
        }

        setPlatformInfo(info)

        break

      case 'magento2':

        info = {
          title: 'Magento2',
          img: img15.src,
          token: true,
          url: true,
        }

        setPlatformInfo(info)

        break

      case 'opencart':

        info = {
          title: 'Opencart',
          img: img10.src,
          apiKey: true,
          url: true,
          adminIdOpenCart: true,
        }

        setPlatformInfo(info)

        break

      case 'softvar':

        info = {
          title: 'Softvar',
          img: img16.src,
          apiKey: true,
          userId: true,
          shopId: true,
          stockId: true,
        }

        setPlatformInfo(info)

        break

      case 'tiny':

        info = {
          title: 'Tiny',
          img: img11.src,
          token: true,
          ecommerceId: true,
        }

        setPlatformInfo(info)

        break

      case 'trayio':

        info = {
          title: 'Tray.io',
          img: img12.src,
          url: true,
        }

        setPlatformInfo(info)

        break

      case 'vtex':

        info = {
          title: 'Vtex',
          img: img13.src,
          url: true,
          vtexKey: true,
          vtexToken: true,
          sellerdId: true,
          vtexPoliticId: true,
        }

        setPlatformInfo(info)

        break

      case 'woo':

        info = {
          title: 'WooCommerce',
          img: img14.src,
          url: true,
          wooCommerceKey: true,
          wooCommerceConsumer: true,
        }

        setPlatformInfo(info)

        break
    }
  }, [platform])

  const handleSubmit = useCallback((data) => {
    // const fieldKey = keyRef.current.value

    // if (!fieldKey) {
    //   setMessage("Verifique se os campos estão preenchidos!")
    //   setType("error")
    //   setOpen(true)
    //   return
    // }

    setMessage("Enviado com sucesso")
    setType("success")
    setOpen(true)
  }, [])

  const paperStyle = { padding: '1rem', height: '70vh', width: 350, margin: "1rem auto" }
  const btnstyle = { margin: '0.5rem 0' }

  return (
    <div className={styles.container}>
      <Form
        ref={formRef}
        onSubmit={handleSubmit}>
        <div className={styles.card}>
          {/* <img src={platformInfo.img} /> */}
          <h1>Integração {platformInfo.title}</h1>

          {platformInfo.apiUrl &&
            <Textfield
              name='apiUrl'
              label='URL da API'
              placeholder={`Insira o URL da API ${platformInfo.title}`}
              fullWidth
              required
            />}

          {platformInfo.apiKey &&
            <Textfield
              name='apiKey'
              label='API Key'
              placeholder={`Insira a API Key do ${platformInfo.title}`}
              fullWidth
              required
            />}

          {platformInfo.secret &&
            <Textfield
              name='secretKey'
              label='Secret Key'
              placeholder={`Insira a Secret Key de acesso ao ${platformInfo.title}`}
              fullWidth
              required
            />}

          {platformInfo.email &&
            <Textfield
              name='email'
              label='Email'
              placeholder={`Insira o email`}
              fullWidth
              required
            />}

          {platformInfo.password &&
            <Textfield
              name='password'
              label=''
              placeholder={`Insira a senha`}
              fullWidth
              required
            />}

          {platformInfo.shopName &&
            <Textfield
              name='shopName'
              label={`Nome da loja ${platformInfo.title}`}
              placeholder={`Insira a API Key do ${platformInfo.title}`}
              fullWidth
              required
            />}

          {platformInfo.apiKey &&
            <Textfield
              name='apiKey'
              label=''
              placeholder={`Insira a API Key do ${platformInfo.title}`}
              fullWidth
              required
            />}

          {platformInfo.apiKey &&
            <Textfield
              name='apiKey'
              label=''
              placeholder={`Insira a API Key do ${platformInfo.title}`}
              fullWidth
              required
            />}

          {platformInfo.apiKey &&
            <Textfield
              name='apiKey'
              label=''
              placeholder={`Insira a API Key do ${platformInfo.title}`}
              fullWidth
              required
            />}

          {platformInfo.apiKey &&
            <Textfield
              name='apiKey'
              label=''
              placeholder={`Insira a API Key do ${platformInfo.title}`}
              fullWidth
              required
            />}

          {platformInfo.apiKey &&
            <Textfield
              name='apiKey'
              label=''
              placeholder={`Insira a API Key do ${platformInfo.title}`}
              fullWidth
              required
            />}

          {platformInfo.apiKey &&
            <Textfield
              name='apiKey'
              label=''
              placeholder={`Insira a API Key do ${platformInfo.title}`}
              fullWidth
              required
            />}

          {platformInfo.eMillenium &&
            <Textfield
              name='eMillenium'
              label='Vitrine da Loja E-millenium'
              placeholder={`Insira a API Key do ${platformInfo.title}`}
              fullWidth
              required
            />}

          {platformInfo.url &&
            <Textfield
              name='shopUrl'
              label='URL da loja'
              placeholder={`Insira o URL da loja ${platformInfo.title}`}
              fullWidth
              required
            />}

          {platformInfo.ecommerceUrl &&
            <Textfield
              name='apiKey'
              label='URL do Ecommerce'
              placeholder={`Insira o URL do seu ecommerce`}
              fullWidth
              required
            />}

          {platformInfo.jwt &&
            <Textfield
              name='jwt'
              label='Token JWT da API'
              placeholder={`Insira o token JWT para a API ${platformInfo.title}`}
              fullWidth
              required
            />}

          {platformInfo.ecommerceId &&
            <Textfield
              name='ecommerceId'
              label='Id Ecommerce'
              placeholder={`Insira o Id Ecommerce para criação de pedidos (opcional)`}
              fullWidth
            />}

          {platformInfo.channelId &&
            <Textfield
              name='channelId'
              label='ChannelId'
              placeholder={`Insira o channelId do ${platformInfo.title}`}
              fullWidth
              required
            />}

          {platformInfo.clientId &&
            <Textfield
              name='clientId'
              label='ClientId'
              placeholder={`Insira a clientId do ${platformInfo.title}`}
              fullWidth
              required
            />}

          <Button type='submit' onClick={() => { formRef.current?.submitForm() }}>Cadastrar integração</Button>
        </div>
        <Snackbar open={open} autoHideDuration={10000} anchorOrigin={{ vertical: 'top', horizontal: 'center', }} onClose={handleClose}>
          <Alert severity={type} sx={{ width: '100%' }}>
            {message}
          </Alert>
        </Snackbar>
      </Form>
    </div>
  )
}

export default Platform
