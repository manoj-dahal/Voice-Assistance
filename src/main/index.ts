export * from './lib'

/**
 * Typed main-process surface for desktop packaging.
 *
 * The current local HTTP runtime is started by `index.mjs` through
 * `bin/era-ai.mjs`. A future Electron main process can import the channel and
 * system guards exported here without coupling the renderer to Node APIs.
 */
export const eraMainRuntime = {
  serverEntrypoint: 'src/main/index.mjs',
  preloadEntrypoint: 'src/preload/index.ts'
} as const
