import { Component } from 'solid-js';
import styles from './button.module.less';

type ButtonProps = {
    primary?: boolean,
    children?: any,
}

const Button: Component<ButtonProps> = (props) => {
    return (
        <>
            <button
                class={styles["button"]}
                classList={{ [styles.primary]: props.primary }}
            >
                {props.children || "Button"}
            </button>
        </>
    )
}

export default Button;
