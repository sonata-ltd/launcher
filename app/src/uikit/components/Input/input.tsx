import { JSXElement, Show } from "solid-js";
import css from "./input.module.less";


interface IInput {
    size?: "sm",
    placeholder?: string,
    label?: string,
    hint?: string,
    width?: number,
    error?: boolean,
    onInput?: (e: InputEvent) => void,
    value?: string,
    children?: JSXElement | JSXElement[],
    expand?: boolean
}

export const Input = (props: IInput) => {
    return (
        <>
            <div class={css["wrapper"]}>
                <div
                    class={css["container"]}
                    style={props.expand ? `width: 100%` : props.width ? `width: ${props.width}px` : ``}
                >
                    {props.label
                        && <p class={css["label"]}>{props.label}</p>
                    }
                    <input
                        type="text"
                        placeholder={props.placeholder}
                        class={css["input"]}
                        onInput={props.onInput}
                        value={props.value ? props.value : ""}
                        classList={{
                            [css["error"]]: props.error
                        }}
                    />
                    {props.hint
                        && <p
                            class={css["hint"]}
                            classList={{
                                [css["error"]]: props.error
                            }}
                        >
                            {props.hint}
                        </p>
                    }
                </div>
                <Show
                    when={props.children}
                >
                    {props.children}
                </Show>
            </div>
        </>
    )
}
