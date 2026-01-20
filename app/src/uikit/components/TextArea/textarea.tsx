import { Component, JSX } from "solid-js";
import css from "./textarea.module.less";

export interface TextAreaProps {
  autocomplete?: string | undefined;
  autofocus?: boolean | undefined;
  cols?: number | string | undefined;
  dirname?: string | undefined;
  disabled?: boolean | undefined;
  enterkeyhint?:
    | "enter"
    | "done"
    | "go"
    | "next"
    | "previous"
    | "search"
    | "send"
    | undefined;
  form?: string | undefined;
  maxlength?: number | string | undefined;
  minlength?: number | string | undefined;
  name?: string | undefined;
  placeholder?: string | undefined;
  readonly?: boolean | undefined;
  required?: boolean | undefined;
  rows?: number | string | undefined;
  value?: string | string[] | number | undefined;
  wrap?: "hard" | "soft" | "off" | undefined;
  maxLength?: number | string | undefined;
  minLength?: number | string | undefined;
  readOnly?: boolean | undefined;
  resize?: boolean;
  expand?: boolean;
  height?: number;

  onInput?: JSX.EventHandler<HTMLTextAreaElement, InputEvent>;
  onChange?: JSX.EventHandler<HTMLTextAreaElement, Event>;
}

export const TextArea: Component<TextAreaProps> = (props) => {
  return (
    <>
      <textarea
        class={css.textarea}
        {...props}
        style={{
          resize: props.resize ? "both" : "none",
          width: props.expand ? "100%" : "",
          height: props.height ? `${props.height}px` : "",
        }}
        value={props.value as any}
      />
    </>
  );
};
