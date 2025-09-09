import { Component, createEffect, createSignal } from "solid-js";
import { InstanceOptionsWindow } from "widgets/InstanceOptions/instanceOptionsWindow";

const Page: Component = () => {
    return (
        <>
            <InstanceOptionsWindow
                name="Snipperly SMP"
            />
        </>
    )
}

export default Page;
