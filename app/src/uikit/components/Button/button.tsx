import { Component } from 'solid-js';
import styles from './button.module.less';
import { animate, spring } from 'motion';
import { animationValues as av } from '../definitions';

type ButtonProps = {
    primary?: boolean,
    children?: any,
}

const Button: Component<ButtonProps> = (props) => {
    const animateMouseDown = (e: Event) => {
        console.log("Mouse down registered");

        if (e.target) {
            animate(
                e.target as HTMLElement,
                av.elementsPoints.button.mouseDown,
                av.defaultAnimationType
            )
        }
    }

    const animateMouseUp = (e: Event) => {
        console.log("Mouse up registered");

        if (e.target) {
            animate(
                e.target as HTMLElement,
                av.elementsPoints.button.mouseUp,
                av.defaultAnimationType
            )
        }
    }

    return (
        <>
            <button
                class={styles["button"]}
                classList={{ [styles.primary]: props.primary }}
                onMouseDown={animateMouseDown}
                onMouseUp={animateMouseUp}
            >
                {props.children || "Button"}
            </button>
        </>
    )
}

export default Button;
