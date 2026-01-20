import { createSignal, JSX, JSXElement, Show } from "solid-js";
import css from "./input.module.less";

interface IInput {
  size?: "sm";
  placeholder?: string;
  label?: string;
  hint?: string;
  width?: number;
  error?: boolean | string;

  onInput?: (e: InputEvent) => void;
  onClick?: () => void;
  onKeyDown?: (e: KeyboardEvent) => void;

  value?: string;
  children?: JSXElement | JSXElement[];
  expand?: boolean;
  readOnly?: boolean;
  type?: string;
  sideIcon?: JSX.Element;
  reserveTooltipSpace?: boolean;
}

export const Input = (props: IInput) => {
  const [showTooltip, setShowTooptip] = createSignal(false);

  const errorValueIsString = () => {
    if (typeof props.error === "string") return true;
    return false;
  };

  const handleShowTooltip = () => {
    if (props.error && errorValueIsString()) {
      setShowTooptip(true);
    }
  };

  const handleHideTooltip = () => {
    setShowTooptip(false);
  };

  return (
    <>
      <div
        class={css["wrapper"]}
        style={props.expand ? `width: 100%` : `width: fit-cotent`}
      >
        <div
          class={css["container"]}
          style={
            props.expand
              ? `width: 100%`
              : props.width
              ? `width: ${props.width}px`
              : ``
          }
        >
          {props.label && <p class={css["label"]}>{props.label}</p>}
          <div class={css["input-wrapper"]}>
            <input
              type={props.type ? props.type : "text"}
              placeholder={props.placeholder}
              class={css["input"]}
              // Events
              onInput={props.onInput}
              onClick={props.onClick}
              onKeyDown={props.onKeyDown}
              onMouseEnter={handleShowTooltip}
              onMouseLeave={handleHideTooltip}
              onFocusIn={handleShowTooltip}
              onFocusOut={handleHideTooltip}
              // Other properties
              value={props.value ? props.value : ""}
              classList={{
                [css["error"]]: props.error !== undefined,
              }}
              readOnly={props.readOnly}
            />
            <Show when={props.sideIcon}>
              <div class={css.sideicon}>{props.sideIcon}</div>
            </Show>
            <Show when={showTooltip() && errorValueIsString()}>
              <div class={css.tooltip} role="status" aria-live="polite">
                <p class={css["tooltip-text"]}>{props.error}</p>

                <svg
                  class={css["tooltip-arrow"]}
                  width="44"
                  height="22"
                  viewBox="0 0 44 22"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M0,0 C8,0 14,6 18,10 L22,14 C23.5,16 24,18 24,18 C24,18 24.5,16 26,14 L30,10 C34,6 40,0 44,0"
                    fill="#FDC3BE"
                  />
                </svg>
              </div>
            </Show>
          </div>
          {props.hint && (
            <p
              class={css["hint"]}
              classList={{
                [css["error"]]: props.error !== undefined,
              }}
            >
              {props.hint}
            </p>
          )}
        </div>
        <Show when={props.children}>{props.children}</Show>
      </div>
    </>
  );
};
