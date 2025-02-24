import { createMemo } from 'solid-js'
import * as m from './paraglide/messages'

type MessageFunction = (params?: object, options?: { languageTag?: 'en' | 'ru' }) => string

export const useMessages = () => {
  const t = createMemo((prev: Record<string, MessageFunction> = m) => prev)

  return {
    get: <K extends keyof typeof m>(
      key: K,
      params?: Parameters<typeof m[K]>[0],
      options?: { languageTag?: 'en' | 'ru' }
    ) => {
      const fn = t()[key]
      return typeof fn === 'function'
        ? fn(params || {}, options || {})
        : fn
    }
  }
}
