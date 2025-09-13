import { createMemo } from 'solid-js'
import * as m from './paraglide/messages'

type MessageFunction = (params?: object, options?: { languageTag?: 'en' | 'ru' }) => string;
type MessagesModule = typeof m;
type FunctionKeys<T> = { [P in keyof T]: T[P] extends (...args: any[]) => any ? P : never }[keyof T];
type FnOf<
    Mod extends MessagesModule,
    K extends keyof Mod
> = Extract<Mod[K], (...args: any[]) => any>;

const messagesMap = Object.keys(m).reduce<Record<string, MessageFunction>>((acc, key) => {
    const val = (m as any)[key]

    if (typeof val === 'function') {
        acc[key] = val as MessageFunction;
    }

    return acc;
}, {})

const capitalizeFirst = (input: string) => {
    if (!input) return input
    return String(input).charAt(0).toUpperCase() + String(input).slice(1).toLowerCase();
}

export const useTranslatedMessages = () => {
    const t = createMemo(() => m)

    function capitalizeWords(s: string) {
        return s.split(/\s+/).map(w => w ? w[0].toUpperCase() + w.slice(1) : w).join(' ')
    }

    function get<K extends FunctionKeys<MessagesModule>>(
        key: K,
        params?: Parameters<FnOf<MessagesModule, K>>[0],
        options?: Parameters<FnOf<MessagesModule, K>>[1]
    ): string
    function get(key: string, params?: any, options?: any): string

    // Реализация (единственная)
    function get(key: string, params?: any, options?: any): string {
        const dict = t() as MessagesModule
        // runtime-проверка: ключ действительно существует в словаре и это функция
        if (key in dict) {
            const maybeFn = (dict as any)[key]
            if (typeof maybeFn === 'function') {
                return maybeFn(params ?? {}, options ?? {})
            }
            // если экспорт есть, но он не функция — приводим к строке
            return String(maybeFn ?? key)
        }

        // Key отсутствует — безопасный fallback (можно вернуть key, пустую строку или логировать)
        return String(key)
    }

    function capFirst<K extends FunctionKeys<MessagesModule>>(
        key: K,
        params?: Parameters<FnOf<MessagesModule, K>>[0],
        options?: Parameters<FnOf<MessagesModule, K>>[1]
    ): string {
        return capitalizeFirst(get(key, params, options));
    }

    return {
        get,
        capFirst
    }
}
