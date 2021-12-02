import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { FiCheck, FiX } from 'react-icons/fi';

import styles from './styles.module.scss';

import MessageModal from '../../components/MessageModal';
import { Loader } from 'src/components/Loader';
import { useLoading } from 'src/hooks/loading';
import MarketplaceButton from 'src/components/MarketplaceButton';

type MarketplaceData = {
  name: string,
  url: string,
  image: string,
}

const SignUp: React.FC = () => {

  const { isLoading, setLoading } = useLoading()

  const [marketplaces, setMarketplaces] = useState<MarketplaceData[]>([])

  useEffect(() => {
    setMarketplaces([
      {
        name: 'amazon',
        url: 'https://www.amazon.com.br/s?me=A3NLIHGRNR1YJA&marketplaceID=A2Q3Y263D00KWC',
        image: '/assets/amazon-transparent.png',
      },
      {
        name: 'americanas',
        url: 'https://www.americanas.com.br/lojista/ozllo?origem=blancalojista',
        image: '/assets/americanas-transparent.png',
      },
      {
        name: 'C&A',
        url: 'https://www.cea.com.br/search?_query=Loja%20Ozllo',
        image: '/assets/cea-transparent.png',
      },
      {
        name: 'carrefour',
        url: 'https://www.carrefour.com.br',
        image: '/assets/carrefour-transparent.png',
      },
      {
        name: 'dafiti',
        url: 'https://www.dafiti.com.br/all-products/?seller=OZLLO',
        image: '/assets/dafiti-transparent.png',
      },
      {
        name: 'drogaraia',
        url: 'https://www.drogaraia.com.br/',
        image: '/assets/drogaraia.png',
      },
      {
        name: 'drograsil',
        url: 'https://www.drogasil.com.br/search?w=ozllo',
        image: '/assets/drograsil.png',
      },
      {
        name: 'enjoei',
        url: 'https://www.enjoei.com.br/@ozllo360',
        image: '/assets/enjoei4.png',
      },
      {
        name: 'extra',
        url: 'https://www.clubeextra.com.br/',
        image: '/assets/extra-transparent.png',
      },
      {
        name: 'magalu',
        url: 'https://www.magazineluiza.com.br/lojista/ozllobrasil/',
        image: '/assets/magalu-transparent.png',
      },
      {
        name: 'mercadolivre',
        url: 'https://loja.mercadolivre.com.br/ozllo',
        image: '/assets/mercadolivre-transparent.png',
      },
      {
        name: 'netshoes',
        url: 'https://www.netshoes.com.br/lojista/loja-ozllo',
        image: '/assets/netshoes-transparent.png',
      },
      {
        name: 'pao-de-açucar',
        url: 'https://www.paodeacucar.com/',
        image: '/assets/paodeacucar-transparent.png',
      },
      {
        name: 'shoptime',
        url: 'https://www.shoptime.com.br/lojista/ozllo?origem=blancalojista',
        image: '/assets/shoptime-transparent.png',
      },
      {
        name: 'submarino',
        url: 'https://www.submarino.com.br/lojista/ozllo?origem=blancalojista',
        image: '/assets/submarino-transparent.png',
      },
      {
        name: 'zatini',
        url: 'https://www.zatini.com.br/lojista/loja-ozllo',
        image: '/assets/zatini-transparent.png',
      },
    ])
  }, [])


  return (
    <div className={styles.marketplacesContainer}>
      {
        marketplaces.map(marketplaces => (
          <MarketplaceButton
            name={marketplaces.name}
            image={marketplaces.image}
            url={marketplaces.url}
          />
        ))
      }
      {
        isLoading && (
          <div className={styles.loadingContainer}>
            <Loader />
          </div>
        )
      }
    </div >
  );
};

export default SignUp;
