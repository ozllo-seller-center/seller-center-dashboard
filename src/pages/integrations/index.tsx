import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import styles from './styles.module.scss'

import Card from 'src/components/Card'

import img1 from '../../../public/assets/bling.png'
import img2 from '../../../public/assets/ecoys.jpg'
import img3 from '../../../public/assets/ihub.png'
import img4 from '../../../public/assets/infra.jpg'
import img5 from '../../../public/assets/linxC.png'
import img6 from '../../../public/assets/linxE.png'
import img7 from '../../../public/assets/linxO.png'
import img8 from '../../../public/assets/lojaI.png'
import img9 from '../../../public/assets/magento.png'
import img10 from '../../../public/assets/opencart.png'
import img11 from '../../../public/assets/tiny.png'
import img12 from '../../../public/assets/tray.png'
import img13 from '../../../public/assets/vtex.png'
import img14 from '../../../public/assets/woo.png'
import img15 from '../../../public/assets/magento2.png'
import img16 from '../../../public/assets/softvar.png'
import img17 from '../../../public/assets/Bseller.png'
import img18 from '../../../public/assets/idealeWare.png'

const Integrations: React.FC = () => {

  return (
    <div className={styles.container}>

      <div className={styles.header}>
        <h1>Ecommerce</h1>
      </div>

      <div className={styles.cardContainer}>
        <Card imgSrc={img17.src} reference="bseller" title="BSeller" />
        <Card imgSrc={img18.src} reference="idealeware" title="IdealeWare" />
        <Card imgSrc={img3.src} reference="ihub" title="iHUB" />
        <Card imgSrc={img4.src} reference="infracommerce" title="Infra.Commerce" />
        <Card imgSrc={img8.src} reference="lojaintegrada" title="Loja integrada" />
        <Card imgSrc={img9.src} reference="magento" title="Magento" />
        <Card imgSrc={img15.src} reference="magento2" title="Magento 2" />
        <Card imgSrc={img10.src} reference="opencart" title="Opencart" />
        <Card imgSrc={img12.src} reference="trayio" title="Tray.io" />
        <Card imgSrc={img13.src} reference="vtex" title="Vtex" />
        <Card imgSrc={img14.src} reference="woo" title="Woo Commerce" />
      </div>

      <div className={styles.header} style={{ marginTop: '2rem' }}>
        <h1>ERPs</h1>
      </div>
      <div className={styles.cardContainer}>
        <Card imgSrc={img1.src} reference="bling" title="Bling!" />
        <Card imgSrc={img2.src} reference="ecoys" title="Ecoys" />
        <Card imgSrc={img5.src} reference="linxc" title="Linx Commerce" />
        <Card imgSrc={img6.src} reference="linxe" title="Linx Emillennium" />
        <Card imgSrc={img7.src} reference="linxo" title="Linx Omnichannel" />
        <Card imgSrc={img16.src} reference="softvar" title="Softvar" />
        <Card imgSrc={img11.src} reference="tiny" title="Tiny" />
      </div>
    </div>
  )
}

export default Integrations;
