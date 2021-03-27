import { useState, useEffect } from 'react'
import { throttle } from 'utils/util'

interface WindowDimension {
  width: number | undefined
  height: number | undefined
}

export default function useWindowSize( interval = 500 ) {
  const isClient = typeof window === 'object'

  function getSize(): WindowDimension {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined
    }
  }

  const [windowSize, setWindowSize] = useState( getSize() )

  useEffect( () => {
    if ( !isClient ) return

    const handleResize = throttle( () => {
      setWindowSize( getSize() )
    }, interval )

    window.addEventListener( 'resize', handleResize )
    return () => window.removeEventListener( 'resize', handleResize )
  }, [] ) // Empty array ensures that effect is only run on mount and unmount

  return windowSize
}