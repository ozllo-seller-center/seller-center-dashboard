import { useState, useEffect } from 'react'

export default function useTimer() {
  const [seconds, setSeconds] = useState( 0 )
  const [isActive, setIsActive] = useState( false )

  const start = () => {
    setIsActive( !isActive )
  }

  const reset = () => {
    setSeconds( 0 )
    setIsActive( false )
  }

  useEffect( () => {
    let interval: any = null
    if ( isActive ) {
      interval = setInterval( () => {
        setSeconds( sec => sec + 1 )
      }, 1000 )
    } else if ( !isActive && seconds !== 0 ) {
      clearInterval( interval )
    }
    return () => clearInterval( interval )
  }, [isActive, seconds] )

  return [seconds, start, reset]
}
