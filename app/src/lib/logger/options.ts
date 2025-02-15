export interface Component {
    name: string,
    enable?: boolean
}

export interface LocalRouter extends Component {
    scroll: boolean,
    urlChange: boolean
}

export interface KeepAlive extends Component {
    cacheChange: boolean,
}

export interface WSManager extends Component {
    connectionFailed: boolean
}

export type LoggerSettingsType = {
    enable?: boolean,
    localRouter: LocalRouter,
    keepAlive: KeepAlive,
    wsManager: WSManager
}

export const defaultLoggerSettings: LoggerSettingsType = {
    enable: true,
    localRouter: {
        name: "LocalRouter",
        enable: false,
        scroll: true,
        urlChange: true,
    },
    keepAlive: {
        name: "KeepAlive",
        enable: false,
        cacheChange: true,
    },
    wsManager: {
        name: "WebSocketManager",
        enable: true,
        connectionFailed: true,
    }
}
