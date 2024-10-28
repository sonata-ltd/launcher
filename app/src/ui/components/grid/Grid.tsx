import { JSX, ref } from 'hywer/jsx-runtime';
import css from './grid.module.less';
import { For } from 'hywer/x/html';
import InstanceLogo from '@/assets/images/InstanceDefaultLogo.svg';
import { InstanceCardButton } from '@/ui/components/buttons/Buttons';
import Store from "@/data/store";
import { gsap } from 'gsap/all';


interface IGrid {
    children: JSX.Element | JSX.Element[],
}

export function Grid(props: IGrid) {
    return (
        <>
            <div class={css.Grid}>
                <For in={props.children}>
                    {(item, i) => {
                        return item;
                    }}
                </For>
            </div>
        </>
    )
}


interface IInstanceGrid {
    children: JSX.Element | JSX.Element[]
}

export function InstanceGrid(props: IInstanceGrid) {
    return (
        <>
            <div class={css.InstanceGridContainer}>
                <div class={css.InstanceGrid}>
                    <For in={props.children}>
                        {(item) => {
                            return item;
                        }}
                    </For>
                </div>
            </div>
        </>
    )
}


interface IInstanceGridChildren {
    name: string,
    loader: string,
    version: string,
    onClick?: () => void
}

export function InstanceGridChildren(props: IInstanceGridChildren) {
    const buttonId = `InstanceButton_${Store.makeId(6)}`;

    const TriggerButtonVisibility = (e: any) => {
        const button = document.getElementById(buttonId);

        if (e.type === 'mouseenter') {
            gsap.to(button, {
                opacity: 1,
                scale: 1,
                ease: 'power1.In',
                duration: 0.25
            })
        } else {
            gsap.to(button, {
                opacity: 0,
                scale: 1.2,
                ease: 'power1.Out',
                duration: 0.25
            })
        }
    }

    const TriggerButtonPress = (e: Event) => {
        const button = document.getElementById(buttonId);

        if (e.type === 'mousedown') {
            gsap.to(button, {
                scale: .9,
                ease: 'power1.In',
                duration: .25
            })
        } else {
            gsap.to(button, {
                scale: 1,
                ease: 'power1.Out',
                duration: .25
            })
        }
    }

    setTimeout(() => {
        const button = document.getElementById(buttonId);

        gsap.to(button, {
            scale: 1.2,
            duration: 0
        })
    })

    return (
        <>
            <div class={css.Children}
                onMouseEnter={TriggerButtonVisibility}
                onMouseLeave={TriggerButtonVisibility}
            >
                <div class={css.imgContainer}>
                    <img src={InstanceLogo} alt="" />
                    <div class={css.imgDimmer}></div>
                    <InstanceCardButton
                        text="Play"
                        zIndex={2}
                        id={buttonId}
                        onClick={props.onClick}
                        onMouseDown={TriggerButtonPress}
                        onMouseUp={TriggerButtonPress}
                    />
                </div>
                <div class={css.Details}>
                    <p>{props.name}</p>
                    <p>{props.loader} {props.version}</p>
                </div>
            </div>
        </>
    )
}
