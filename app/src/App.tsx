import { onMount, type Component } from 'solid-js';
import Header from 'components/Header/header';
import { TabsProvider } from 'data/tabs';
import { createOverlayScrollbars } from 'overlayscrollbars-solid';
import 'overlayscrollbars/overlayscrollbars.css';
import { WebSocketProvider } from 'data/wsManager';


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
                <TabsProvider count={1}>
                    <Header />
                    <div id="content-view">
                        {props.children}
                    </div>
                </TabsProvider>
            </WebSocketProvider>
        </>
    );
};

export default App;
