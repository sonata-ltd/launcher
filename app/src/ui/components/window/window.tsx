import { JSX, Reactive, derive, effect, ref } from 'hywer/jsx-runtime';
import css from './window.module.less';
import { For } from 'hywer/x/html';
import { gsap, ScrollToPlugin } from 'gsap/all';
import Store from "@/data/store";


interface IWindow {
    children: JSX.Element | JSX.Element[],
    name: string,
    minimize?: boolean,
    maximize?: boolean,
    style?: string,
    shown: Reactive<boolean>,
}

export function Window(props: IWindow) {
    const componentId = Store.makeId(6);
    const shouldBeVisible = ref(false);

    const changeVisibility = (shown: boolean) => {
        const window = document.getElementById(`Window-${componentId}`);
        if (window) {
            if (shown === true) {
                console.log("Show");
                gsap.to(window, {
                    beforeStart: () => {
                        window.style.display = "block";
                    },
                    opacity: 1,
                    scale: 1,
                    ease: 'power1.Out',
                    duration: 0.25,
                    onComplete: () => {
                        shouldBeVisible.val = true;
                    }
                })
            } else if (shown === false) {
                console.log("Hide");
                gsap.to(window, {
                    opacity: 0,
                    scale: 1.1,
                    ease: 'power1.In',
                    duration: 0.25,
                    onComplete: () => {
                        shouldBeVisible.val = false;
                        window.style.display = "none";
                    }
                })
            }
        } else {
            console.warn("Window is not found");
        }
    }

    setTimeout(() => {
        shouldBeVisible.val = props.shown.val;
        changeVisibility(props.shown.val);
    }, 0);

    props.shown.sub = (val) => {
        setTimeout(() => {
            changeVisibility(val);
        }, 0);
    };

    return (
        <>
            <div
                className={css.Window}
                style={`${props.style}`}
                id={`Window-${componentId}`}
            >
                <div className={css.WindowHeader}>
                    <div className={css.Name}>
                        <p className="Inter-Display-Semibold">{props.name}</p>
                    </div>
                    <div className={css.ControlsWrapper}>
                        {
                            props.minimize ? <button className={css.Minimize}></button> : <></>
                        }
                        {
                            props.maximize ? <button className={css.Maximize}></button> : <></>
                        }
                    </div>
                </div>
                {props.children}
            </div>
        </>
    )
}


interface IWindowControls {
    children: JSX.Element | JSX.Element[],
}

export function WindowControls(props: IWindowControls) {
    return (
        <div className={css.WindowControls}>
            {props.children}
        </div>
    )
}


interface IFlexBox {
    children: JSX.Element | JSX.Element[],
    expand?: boolean,
}

export function FlexBox(props: IFlexBox) {
    return (
        <div className={props.expand ? `${css.FlexBox} ${css.expand}` : `${css.FlexBox}`}>
            {props.children}
        </div>
    )
}


interface IVerticalStack {
    children: JSX.Element | JSX.Element[],
}

export function VerticalStack(props: IVerticalStack) {
    return (
        <>
            <div class={css.VerticalStack}>
                {props.children}
            </div>
        </>
    )
}


interface IContentStack {
    children: JSX.Element[],
    showIndex: Reactive<number>,
}

export function ContentStack(props: IContentStack) {
    const contentHeight = ref<number>(0);
    const OldIndex = ref<number | null>(null);
    const currentIndex = ref<number>(props.showIndex.val);
    const Loaded = ref(false);
    gsap.registerPlugin(ScrollToPlugin);

    const asd = (i: number) => {
        console.log(`key: ${i} | value: ${props.showIndex.val} | ${props.showIndex.derive(val => val === i)}`);
    }

    effect(() => {
        WindowContentWidth();
    }, [])

    const WindowContentWidth = () => {
        const animContent = document.getElementById('WindowContent');
        let scrollValue = 0;


        const nextWindowComponent = document.getElementById(`Content[${props.showIndex.val}]`);

        if (nextWindowComponent) {
            if (props.showIndex.val === 0) {
                scrollValue = 0;
            } else {
                scrollValue = nextWindowComponent.getBoundingClientRect().width * props.showIndex.val;
            }
        }

        if (animContent) {
            gsap.to(animContent, {
                scrollTo: { x: scrollValue },
                height: (animContent.children[props.showIndex.val]?.children[0] as HTMLDivElement).offsetHeight + 30,
                ease: 'power1.inOut',
                duration: 0.35,
            })
        }
    }

    props.showIndex.sub = (val) => {
        setTimeout(() => {
            if (val >= 0 && val <= props.children.length - 1)
                WindowContentWidth();
        }, 0)
    }

    return (
        <div id="WindowContent" class={css.WindowContent}>
            <For in={props.children}>
                {(item, i) => {
                    return <div class={css.Content} id={`Content[${i}]`}>
                        {item}
                    </div>
                }}
            </For>
    </div>
    )
}
