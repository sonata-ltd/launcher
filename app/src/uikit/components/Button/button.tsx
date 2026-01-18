import { Component } from "solid-js";
import styles from "./button.module.less";
import { animate, spring } from "motion";
import { animationValues as av } from "../definitions";

export enum ButtonSizes {
  sm,
  md,
  lg,
}

export enum ButtonTypes {
  primary,
  secondary,
  tertiary,
  acryl,
}

type ButtonProps = {
  type?: ButtonTypes;
  primary?: boolean;
  secondary?: boolean;
  tertiary?: boolean;
  acryl?: boolean;
  disabled?: boolean;
  destructive?: boolean;
  size?: ButtonSizes;
  icon?: boolean;
  children?: any;
  class?: string;
  onClick?: () => void;
  expand?: boolean;
  startAlign?: boolean;
};

const Button: Component<ButtonProps> = (props) => {
  let button: HTMLButtonElement | undefined = undefined;

  const getButtonType = () => {
    if (props.primary) return ButtonTypes.primary;
    if (props.secondary) return ButtonTypes.secondary;
    if (props.tertiary) return ButtonTypes.tertiary;
    if (props.acryl) return ButtonTypes.acryl;
    return props.type;
  };

  const animateMouseDown = (e: Event) => {
    if (button && !props.disabled) {
      animate(
        button,
        av.elementsPoints.button.mouseDown,
        av.defaultAnimationType,
      );
    }
  };

  const animateMouseUp = (e: Event) => {
    if (button && !props.disabled) {
      animate(
        button,
        av.elementsPoints.button.mouseUp,
        av.defaultAnimationType,
      );
    }
  };

  return (
    <>
      <div
        class={props.class}
        classList={{
          [styles.expand]: props.expand,
        }}
      >
        <button
          ref={button}
          class={styles["button"]}
          classList={{
            [styles.primary]: getButtonType() === ButtonTypes.primary,
            [styles.secondary]: getButtonType() === ButtonTypes.secondary,
            [styles.tertiary]: getButtonType() === ButtonTypes.tertiary,
            [styles.acryl]: getButtonType() === ButtonTypes.acryl,
            [styles.disabled]: props.disabled,
            [styles.destructive]: props.destructive,
            [styles.icon]: props.icon,
            [styles.sm]: props.size === ButtonSizes.sm || !props.size,
            [styles.md]: props.size === ButtonSizes.md,
            [styles["start-align"]]: props.startAlign,
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
  );
};

export default Button;
