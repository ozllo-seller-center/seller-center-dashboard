//
//     Global interfaces
//

/**
 * Rewrite Interface `global.NodeJS.ProcessEnv`
 */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'test' | 'production'
      NEXT_PUBLIC_HELLO: string
      API_URL: string
    }
  }
}

// convert it into a module by adding an empty export statement.
export { }
