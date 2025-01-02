export interface Component {
    name: string,
    enable?: boolean
}

export interface LocalRouter extends Component {
    cacheChange: boolean,
    scroll: boolean,
    urlChange: boolean
}

export interface WSManager extends Component {
    connectionFailed: boolean
}

export type LoggerSettingsType = {
    enable?: boolean,
    localRouter: LocalRouter,
    wsManager: WSManager
}
