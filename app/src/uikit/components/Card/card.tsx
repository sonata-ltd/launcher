import { Component, JSX, Show } from "solid-js";
import css from "./card.module.less";
import { CubeIcon } from "components/Icons/cube";

type CardProps = {
    children?: JSX.Element | JSX.Element[],
    name?: string,
    description?: string,
    img?: string | null,
    size?: string
}

const Card: Component<CardProps> = (props) => {
    return (
        <>
            <div
                class={css["card-component"]}
                style={`
                    height: ${props.size};
                    width: ${props.size}
                `}
            >
                <div class={css["preview"]}>
                    <div class={css["action-container"]}>
                        {props.children}
                    </div>
                    <div class={css["shade"]}></div>
                    <Show
                        when={props.img}
                        fallback={
                            <CubeIcon />
                        }
                    >
                        <img src={props.img ?? undefined} alt="" />
                    </Show>
                </div>
                <Show
                    when={props.name && props.description}
                >
                    <div class={css.Details}>
                        <p>{props.name}</p>
                        <p>{props.description}</p>
                    </div>
                </Show>
            </div>
        </>
    )
}

export default Card;
