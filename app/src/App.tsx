import { type Component } from 'solid-js';
import Header from 'components/Header/header';
import { TabsProvider } from 'data/tabs';


const App: Component = (props: any) => {
    return (
        <>
            <TabsProvider count={1}>
                <Header />
                <div id="content-view">
                    {props.children}
                </div>
            </TabsProvider>
        </>
    );
};

export default App;
