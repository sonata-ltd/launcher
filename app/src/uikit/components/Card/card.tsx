import { Component, Show } from "solid-js";
import css from "./card.module.less";
import { CubeIcon } from "components/Icons/cube";
import Button from "@/uikit/components/Button";

type CardProps = {
    name?: string,
    description?: string,
    img?: string
}

const Card: Component<CardProps> = (props) => {
    return (
        <>
            <div class={css["card-component"]}>
                <div class={css["preview"]}>
                    <div class={css["action-container"]}>
                        <Button class={css["button"]} secondary>Play</Button>
                    </div>
                    <div class={css["shade"]}></div>
                    <Show
                        when={props.img}
                        fallback={
                            <CubeIcon />
                        }
                    >
                        <img src={props.img} alt="" />
                    </Show>
                </div>
                <div class={css.Details}>
                    <p>{props.name}</p>
                    <p>{props.description}</p>
                </div>
            </div>
        </>
    )
}

export default Card;
