import { createEffect, createSignal, For, onCleanup, onMount, type Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';

import styles from './header.module.less';

import Icon from "@/assets/images/home.svg";
import { createOverlayScrollbars } from 'overlayscrollbars-solid';
import 'overlayscrollbars/overlayscrollbars.css';
import { useTabs } from 'data/tabs';
import HeaderAnimation from './anims';

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
    const [headerTabs, { addHeaderTab, removeHeaderTab }] = useTabs();
    const [selectedTab, setSelectedTab] = createSignal(0);


    // Navigation Managment
    const navigate = useNavigate();

    const redirect = (name: string, index: number) => {
        navigate(name);
        setSelectedTab(index);
    }


    // Animations
    let headerMenu: HTMLDivElement;
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

    const animateOnFirstMount = () => {
        if (headerAnimation && headerMenu) {
            headerAnimation.animateOnFirstMount(headerMenu);
        }
    }

    createEffect(() => {
        if (headerMenu) {
            initializeHeaderAnimation();
            animateOnFirstMount();
        }
    });


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
