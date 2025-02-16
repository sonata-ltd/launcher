import { Component, createEffect } from "solid-js"
import styles from './rendering.module.less';
import { useNavigate } from "@solidjs/router";
import { routeNames } from "routes";
import { useWebSocket } from "lib/wsManagment/wsManager";
import { debugComputation } from "@solid-devtools/logger";

const Page: Component = () => {
    const ws = useWebSocket("debugWS");

    const { sendMessage, getMessagesTracked, getMessagesOptioned, messages } = ws;

    // const navigate = useNavigate();

    // const redirect = (name: string) => {
    //     navigate(name);
    // }

    createEffect(() => {
        // console.log(getMessagesOptioned({ all: true }));

        // console.log(messages());
        // console.log(getMessagesTracked());
    })

    return (
        <>
            {/* <button onClick={() => redirect(routeNames.DEBUG_TYPO)}>Typography</button>
            <button onClick={() => redirect(routeNames.DEBUG_COLORS)}>Colors</button> */}
            <button onClick={() => sendMessage("asd")}>Test new ws</button>
        </>
    )
}

export default Page;
