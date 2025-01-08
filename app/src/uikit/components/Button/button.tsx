import { Component } from 'solid-js';
import styles from './button.module.less';
import { animate, spring } from 'motion';
import { animationValues as av } from '../definitions';

enum ButtonSizes {
    sm,
    md,
    lg
}

export enum ButtonTypes {
    primary,
    secondary,
    tertiary,
    acryl
}

type ButtonProps = {
    type?: ButtonTypes,
    primary?: boolean,
    secondary?: boolean,
    tertiary?: boolean,
    acryl?: boolean,
    disabled?: boolean,
    size?: "sm",
    icon?: boolean,
    children?: any,
    class?: string,
    onClick?: () => void,
}

const Button: Component<ButtonProps> = (props) => {
    let button: HTMLButtonElement | undefined = undefined;

    const getButtonType = () => {
        if (props.primary) return ButtonTypes.primary;
        if (props.secondary) return ButtonTypes.secondary;
        if (props.tertiary) return ButtonTypes.tertiary;
        if (props.acryl) return ButtonTypes.acryl;
        return props.type;
    }

    const animateMouseDown = (e: Event) => {
        if (button && !props.disabled) {
            animate(
                button,
                av.elementsPoints.button.mouseDown,
                av.defaultAnimationType
            )
        }
    }

    const animateMouseUp = (e: Event) => {
        if (button && !props.disabled) {
            animate(
                button,
                av.elementsPoints.button.mouseUp,
                av.defaultAnimationType
            )
        }
    }

    return (
        <>
            <div class={props.class}>
                <button
                    ref={button}
                    class={styles["button"]}
                    classList={{
                        [styles.primary]: getButtonType() === ButtonTypes.primary,
                        [styles.secondary]: getButtonType() === ButtonTypes.secondary,
                        [styles.tertiary]: getButtonType() === ButtonTypes.tertiary,
                        [styles.acryl]: getButtonType() === ButtonTypes.acryl,
                        [styles.disabled]: props.disabled,
                        [styles.icon]: props.icon,
                        [styles.sm]: props.size === "sm" || !props.size,
                    }}
                    onMouseDown={animateMouseDown}
                    onMouseUp={animateMouseUp}
                    onMouseLeave={animateMouseUp}
                    onClick={props.onClick}
                >
                    {props.children || "Button"}
                </button>
            </div>
        </>
    )
}

export default Button;
