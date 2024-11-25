import { createEffect, createSignal, For, onCleanup, onMount, type Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';

import styles from './header.module.less';

import Icon from "@/assets/images/home.svg";
import { createOverlayScrollbars, OverlayScrollbarsComponent } from 'overlayscrollbars-solid';
import 'overlayscrollbars/overlayscrollbars.css';
import { useTabs } from 'data/tabs';
import HeaderAnimation from './anims';

export const tabStyles = {
    enter: {
        opacity: [1, 1],
        transform: [`translateY(-71px)`, `translateY(0px)`]
    },
    exit: {
        opacity: [1, 1],
        transform: [`translateY(0px)`, `translateY(-71px)`]
    }
}


const Header: Component = (props: any) => {
    const [headerTabs, { addHeaderTab, removeHeaderTab }] = useTabs();


    // Navigation Managment
    const navigate = useNavigate();

    const redirect = (name: string, index: number) => {
        navigate(name);
        setSelectedTab(index);
    }

    const [selectedTab, setSelectedTab] = createSignal(0);


    // Custom Scrolls Initialization
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


    // Animations
    let headerMenu: HTMLElement;
    let headerContainer: HTMLElement;
    let headerAnimation: HeaderAnimation;

    const initializeHeaderAnimation = () => {
        if (headerMenu) {
            headerAnimation = new HeaderAnimation(headerMenu, headerContainer);
        }
    }

    const addTab = () => {
        const rnd = Date.now();

        headerAnimation?.animateItemAddition("asd", () => {
            addHeaderTab({ name: "asd", path: "asd" });
        });
    }

    const removeTab = () => {
        headerAnimation?.animateItemRemoval("asd", () => {
            removeHeaderTab("asd");
        })
    }

    const animateOnFirstMount = (el: HTMLElement) => {
        if (headerAnimation) {
            headerAnimation.animateOnFirstMount(el);
        }
    }

    createEffect(() => {
        if (headerMenu) {
            initializeHeaderAnimation();
        }
    });


    return (
        <>
            <header ref={headerContainer} class={styles["app-header"]}>
                <div ref={headerMenu} class={styles["header-menu"]}>
                    {/* <button onClick={() => addTab()}>+</button> */}
                    <For each={headerTabs()}>{(tabInstance, i) =>
                        <button
                            classList={{ [styles.selected]: selectedTab() === i() }}
                            onClick={() => redirect(tabInstance.path, i())}
                            data-headertab-path={`header-tab:${tabInstance.path}`}
                        >
                            <Icon />
                            <p>{tabInstance.name}</p>
                        </button>
                    }
                    </For>
                    {/* <button onClick={() => removeTab()}>Remove</button> */}
                </div>
            </header>
        </>
    );
};

export default Header;
