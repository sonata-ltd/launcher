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
    size?: ButtonSizes,
    icon?: string,
    children?: any,
    class?: string,
    onClick?: () => void,
}

const Button: Component<ButtonProps> = (props) => {
    const getButtonType = () => {
        if (props.primary) return ButtonTypes.primary;
        if (props.secondary) return ButtonTypes.secondary;
        if (props.tertiary) return ButtonTypes.tertiary;
        if (props.acryl) return ButtonTypes.acryl;
        return props.type;
    }

    const animateMouseDown = (e: Event) => {
        if (e.target && !props.disabled) {
            animate(
                e.target as HTMLElement,
                av.elementsPoints.button.mouseDown,
                av.defaultAnimationType
            )
        }
    }

    const animateMouseUp = (e: Event) => {
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
            <div class={props.class}>
                <button
                    class={styles["button"]}
                    classList={{
                        [styles.primary]: getButtonType() === ButtonTypes.primary,
                        [styles.secondary]: getButtonType() === ButtonTypes.secondary,
                        [styles.tertiary]: getButtonType() === ButtonTypes.tertiary,
                        [styles.acryl]: getButtonType() === ButtonTypes.acryl,
                        [styles.disabled]: props.disabled
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
