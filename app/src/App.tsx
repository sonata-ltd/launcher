import { createEffect, For, onMount, Show, useContext, type Component } from 'solid-js';
import Header from 'widgets/Header/header';
import { TabsProvider } from 'data/tabs';
import { createOverlayScrollbars } from 'overlayscrollbars-solid';
import 'overlayscrollbars/overlayscrollbars.css';
import { WebSocketProvider } from 'data/wsManagment';
import { InstancesStateProvider } from 'data/instancesManagment';
import { Route, Router } from '@solidjs/router';
import { routes } from 'routes';
import { RenderRoute, useLocalRouter } from 'data/localRouter';

import "./App.css";
import { LoggerProvider } from 'data/logger';
import { KeepAliveWrapper, KeepAliveProvider } from 'data/keepAlive';
import { LSManagerProvider } from 'data/DBInterface/provider';


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
                <InstancesStateProvider>
                    <TabsProvider>
                        <Header />
                    </TabsProvider>
                        <RenderRoute keepAlive="cacheAll" />
                </InstancesStateProvider>
            </WebSocketProvider>
        </>
    );
};

export default App;
