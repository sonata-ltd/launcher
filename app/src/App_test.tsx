import { createEffect, onMount, type Component } from 'solid-js';
import Header from 'components/Header/header';
import { TabsProvider } from 'data/tabs';
import { createOverlayScrollbars } from 'overlayscrollbars-solid';
import 'overlayscrollbars/overlayscrollbars.css';
import { WebSocketProvider } from 'data/wsManagment';
import { InstancesStateProvider } from 'data/instancesManagment';
import { KeepAlive } from 'solid-keep-alive';
import News from 'pages/NewsList/news';
import { Route, Router } from '@solidjs/router';


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

    createEffect(() => {
        console.log(props);
    });


    return (
        <>
            <Router>
                <Route path="/" component={
                    <KeepAlive>
                        <News />
                    </KeepAlive>
                } />
                <Route path="/instances" component={
                    <KeepAlive>
                        <News />
                    </KeepAlive>
                } />
            </Router>
        </>
    );
};

export default App;
