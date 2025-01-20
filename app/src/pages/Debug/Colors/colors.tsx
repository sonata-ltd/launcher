import { Component } from "solid-js"
import styles from '../rendering.module.less';
import { routeNames } from "routes";
import { useNavigate } from "@solidjs/router";

const Page: Component = () => {
    // const navigate = useNavigate();

    // const redirect = (name: string) => {
    //     navigate(name);
    // }

    return (
        <>
            <button onClick={() => redirect(routeNames.DEBUG)}>Back</button>
            <div class={`${styles.colors} ${styles.section}`}>
                <div class={styles["descr-container"]}>
                    <h5 class={`${styles["av-h5"]}`}>Gray Color Palette</h5>
                </div>
                <div class={styles["colors-container"]}>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <div class={styles["descr-container"]}>
                    <h5 class={`${styles["av-h5"]}`}>Gray Text Palette</h5>
                </div>
                <div class={styles["text-container"]}>
                    <p></p>
                    <p></p>
                    <p></p>
                    <p></p>
                    <p></p>
                    <p></p>
                    <p></p>
                    <p></p>
                    <p></p>
                    <p></p>
                    <p></p>
                </div>
            </div>
        </>
    )
}

export default Page;
