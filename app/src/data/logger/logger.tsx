import { Accessor, createContext, ParentProps, Setter, useContext } from "solid-js"
import { createStore } from "solid-js/store";
import { codes, CSSMarks } from "./codes";
import { LoggerSettingsType } from "./options";


type Store = [
    LoggerSettingsType,
    Setter<LoggerSettingsType>,
    {
        log: (option: string, msg: string) => void,
    }
]

const LoggerContext = createContext<Store>();

export const LoggerProvider = (props: ParentProps) => {
    const [loggerSettings, setLoggerSettings] = createStore<LoggerSettingsType>({
        enable: false,
        localRouter: {
            name: "LocalRouter",
            enable: false,
            cacheChange: true,
            scroll: true,
            urlChange: true,
        },
        wsManager: {
            name: "WebSocketManager",
            enable: false,
            connectionFailed: true,
        }
    });

    const getTimestamp = () => {
        const date = new Date();

        const timestamp = date.toISOString().split('.')[0];

        return timestamp;
    }

    const formatOutputLog = (component: string, msg: string) => {
        return [ `${getTimestamp()} %c[${component}]`, CSSMarks.component, `> ${msg}` ];
    }

    const getComponentInfo = (option: string): [string, boolean, boolean] | [undefined] => {
        if (!loggerSettings.enable) {
            return [undefined];
        }

        const keys = option.split('.');
        let result: any = loggerSettings;

        const componentName = keys[0];
        const enabled = result[componentName].enable;
        const name = result[componentName].name;

        for (const key of keys) {
            result = result?.[key];
        }

        if (name && enabled) {
            return [name, enabled, result];
        } else {
            return [undefined]
        }
    }

    const store: Store = [
        loggerSettings,
        setLoggerSettings,
        {
            log(option: string, msg: string) {
                const [name, enabled, result] = getComponentInfo(option);

                if (name && enabled && result) {
                    const [f, s, t] = formatOutputLog(name, msg);

                    console.log(f, s, t);
                }
            },
        }
    ];

    return (
        <LoggerContext.Provider value={store}>
            {props.children}
        </LoggerContext.Provider>
    )
}

export const useLogger = () => {
    const context = useContext(LoggerContext);

    if (!context) {
      throw new Error("useLogger must be used inside LoggerProvider");
    }

    return context;
}
