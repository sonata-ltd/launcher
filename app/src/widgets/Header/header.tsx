import { createEffect, createSignal, For, onCleanup, onMount, type Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';

import styles from './header.module.less';

import Icon from "@/assets/images/home.svg";
import { createOverlayScrollbars } from 'overlayscrollbars-solid';
import 'overlayscrollbars/overlayscrollbars.css';
import { useTabs } from 'lib/tabs';
import HeaderAnimation from './anims';
import { useLocalRouter } from 'lib/localRouter';

export const tabStyles = {
    enter: {
        opacity: [1, 1],
        transform: [`translateY(-102%)`, `translateY(0%)`]
    },
    exit: {
        opacity: [1, 1],
        transform: [`translateY(0%)`, `translateY(-102%)`]
    }
}


const Header: Component = (props: any) => {
    const [currentRoute, {setRoute}] = useLocalRouter();
    const [headerTabs, { addHeaderTab, removeHeaderTab }] = useTabs();
    const [selectedTab, setSelectedTab] = createSignal(0);


    // Navigation Managment
    // const navigate = useNavigate();

    const redirect = (name: string, index: number) => {
        // navigate(name);
        setRoute(name);
        setSelectedTab(index);
    }


    // Animations
    let headerMenu: HTMLDivElement | undefined = undefined;
    let headerAnimation: HeaderAnimation;

    const initializeHeaderAnimation = () => {
        if (headerMenu) {
            headerAnimation = new HeaderAnimation(headerMenu);
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

    const animateOnMount = () => {
        if (headerAnimation && headerMenu) {
            headerAnimation.animateOnFirstMount(headerMenu);
        }
    }


    createEffect(() => {
        if (headerMenu) {
            initializeHeaderAnimation();
            animateOnMount();
        }
    });

    // Update selected tab after manual route change
    createEffect(() => {
        const currentTab = headerTabs().find((e) => e.path === currentRoute());

        if (currentTab) {
            setSelectedTab(headerTabs().indexOf(currentTab));
        }
    })


    return (
        <>
            <header class={styles["app-header"]}>
                <div ref={headerMenu} class={styles["header-menu"]}>
                    <For each={headerTabs()}>{(tabInstance, i) =>
                        <button
                            class={styles["header-tab"]}
                            classList={{ [styles.selected]: selectedTab() === i() }}
                            onClick={() => redirect(tabInstance.path, i())}
                            data-headertab-path={`header-tab:${tabInstance.path}`}
                        >
                            <Icon />
                            <p>{tabInstance.name}</p>
                        </button>
                    }
                    </For>
                </div>
            </header>
        </>
    );
};

export default Header;
