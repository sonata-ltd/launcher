import { Component } from 'solid-js';
import styles from './button.module.less';
import { animate, spring } from 'motion';
import { animationValues as av } from '../definitions';

enum ButtonSizes {
    sm,
    md,
    lg
}

type ButtonProps = {
    primary?: boolean,
    secondary?: boolean,
    tertiary?: boolean,
    disabled?: boolean,
    size?: ButtonSizes,
    icon?: string,
    children?: any,
}

const Button: Component<ButtonProps> = (props) => {
    const animateMouseDown = (e: Event) => {
        console.log("Mouse down registered");

        if (e.target && !props.disabled) {
            animate(
                e.target as HTMLElement,
                av.elementsPoints.button.mouseDown,
                av.defaultAnimationType
            )
        }
    }

    const animateMouseUp = (e: Event) => {
        console.log("Mouse up registered");

        if (e.target && !props.disabled) {
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
                classList={{
                    [styles.primary]: props.primary,
                    [styles.secondary]: props.secondary,
                    [styles.tertiary]: props.tertiary,
                    [styles.disabled]: props.disabled
                }}
                onMouseDown={animateMouseDown}
                onMouseUp={animateMouseUp}
                onMouseLeave={animateMouseUp}
            >
                {props.children || "Button"}
            </button>
        </>
    )
}

export default Button;
