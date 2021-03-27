import { useState, useEffect } from 'react'
import { throttle } from 'utils/util'

export default function useHeightToTop( updateInterval = 200 ) {

  const [heightToTop, setHeightToTop] = useState( 0 )

  useEffect( () => {
    const handleScroll = throttle( () => {
      setHeightToTop( window.pageYOffset )
    }, updateInterval )

    window.addEventListener( 'scroll', handleScroll )
    return () => window.removeEventListener( 'scroll', handleScroll )
  }, [heightToTop] )

  return heightToTop
}