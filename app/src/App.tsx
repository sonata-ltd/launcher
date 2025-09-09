import { Accessor, createEffect, createSignal, For, onMount, Setter, Show, useContext, type Component } from 'solid-js';
import Header from 'widgets/Header/header';
import { TabsProvider } from 'lib/tabs';
import { createOverlayScrollbars } from 'overlayscrollbars-solid';
import 'overlayscrollbars/overlayscrollbars.css';
import { useWebSockets, WebSocketProvider } from 'lib/wsManagment';
import { InstancesStateProvider } from 'lib/instancesManagment';
import { Route, Router } from '@solidjs/router';
import { routes } from 'routes';
import { RenderRoute, useLocalRouter } from 'lib/localRouter';

import "./App.css";
import { LoggerProvider } from 'lib/logger';
import { KeepAliveWrapper, KeepAliveProvider } from 'lib/keepAlive';
import { DBDataProvider } from 'lib/dbInterface/provider';
import { WindowHolder } from 'components/WindowHolder/windowHolder';
import { StartupScreen } from 'lib/startupScreen';
import { useLocator } from '@solid-devtools/debugger/setup';
import { ReconnectScreen } from 'widgets/OnScreen/Reconnect/reconnect';

const UIBuilder = () => {
    return (
        <>
            <WindowHolder />
            <TabsProvider>
                <Header />
            </TabsProvider>
            <RenderRoute keepAlive="cacheAll" />
        </>
    );
}


interface AppServiceHandlerProps {
    setWSAllConnected: Setter<boolean>,
    reconnectScreenThenFn: Accessor<(() => Promise<void>) | undefined>,
}

const AppServicesHandler = (props: AppServiceHandlerProps) => {
    const wsData = useWebSockets();

    createEffect(() => {
        const run = async () => {
            if (wsData.allRequiredConnected() === true) {
                const fn = props.reconnectScreenThenFn();
                if (fn) await fn();
            }

            props.setWSAllConnected(wsData.allRequiredConnected());
        }
        run();
    })

    return <></>;
}


const App: Component = (props: any) => {

    // Custom Scrollbar Initialization
    const [initBodyOverlayScrollbars, getBodyOverlayScrollbarsInstance] =
        createOverlayScrollbars({
            defer: true,
            options: {
                scrollbars: {
                    autoHide: 'scroll',
                    clickScroll: true
                },
            },
        });

    onMount(() => {
        initBodyOverlayScrollbars(document.body);
    });

    const [startupScreenPassed, setStartupScreenPassed] = createSignal(true);
    const [wsAllConnected, setWSAllConnected] = createSignal(false);

    const [reconnectScreenTriggerFn, setReconnectScreenTriggerFn] = createSignal<(() => Promise<void>) | undefined>();

    return (
        <>
            <Show
                when={startupScreenPassed() === true}
                fallback={
                    <StartupScreen />
                }
            >
                <WebSocketProvider>
                    <DBDataProvider>
                        <InstancesStateProvider>
                            <AppServicesHandler setWSAllConnected={setWSAllConnected} reconnectScreenThenFn={reconnectScreenTriggerFn} />
                            <Show
                                when={wsAllConnected()}
                                fallback={
                                    <>
                                        <ReconnectScreen exposeTrigger={(fn) => (setReconnectScreenTriggerFn(() => fn))} />
                                    </>
                                }
                            >
                                <UIBuilder />
                            </Show>
                        </InstancesStateProvider>
                    </DBDataProvider>
                </WebSocketProvider>
            </Show>
        </>
    );
};

export default App;
