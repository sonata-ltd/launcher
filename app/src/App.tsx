import { createSignal, For, onCleanup, onMount, useTransition, type Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { routeNames, routeTabs } from './routes';


import logo from './logo.svg';
import styles from './App.module.less';
import { Transition } from 'solid-transition-group';

import Icon from "@/assets/images/home.svg";
import { createOverlayScrollbars, OverlayScrollbarsComponent } from 'overlayscrollbars-solid';
import 'overlayscrollbars/overlayscrollbars.css';

const App: Component = (props: any) => {
    const navigate = useNavigate();

    const Redirect = (name: string, index: number) => {
        navigate(name);

        start(() => setTab(index));
    }

    const [tab, setTab] = createSignal(0);
    const [pending, start] = useTransition();

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
    })

    return (
        <>
            <header class={styles["app-header"]}>
                <div class={styles["header-menu"]}>
                    <For each={routeTabs}>{(tabInstance, i) =>
                        <button
                            classList={{ [styles.selected]: tab() === i() }}
                            onClick={() => Redirect(tabInstance.path, i())}
                        >
                            <Icon />
                            <p>{tabInstance.name}</p>
                        </button>
                    }
                    </For>
                </div>
            </header>
            <div id="content-view">
                {props.children}
            </div>
        </>
    );
};

export default App;
