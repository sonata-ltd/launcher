import { createEffect, For, onMount, Show, useContext, type Component } from 'solid-js';
import Header from 'widgets/Header/header';
import { TabsProvider } from 'lib/tabs';
import { createOverlayScrollbars } from 'overlayscrollbars-solid';
import 'overlayscrollbars/overlayscrollbars.css';
import { WebSocketProvider } from 'lib/wsManagment';
import { InstancesStateProvider } from 'lib/instancesManagment';
import { Route, Router } from '@solidjs/router';
import { routes } from 'routes';
import { RenderRoute, useLocalRouter } from 'lib/localRouter';

import "./App.css";
import { LoggerProvider } from 'lib/logger';
import { KeepAliveWrapper, KeepAliveProvider } from 'lib/keepAlive';
import { DBDataProvider } from 'lib/dbInterface/provider';
import { WindowHolder } from 'components/WindowHolder/windowHolder';


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


    return (
        <>
            <WebSocketProvider>
                <DBDataProvider>
                    <InstancesStateProvider>
                        <WindowHolder />
                        <TabsProvider>
                            <Header />
                        </TabsProvider>
                        <RenderRoute keepAlive="cacheAll" />
                    </InstancesStateProvider>
                </DBDataProvider>
            </WebSocketProvider>
        </>
    );
};

export default App;
