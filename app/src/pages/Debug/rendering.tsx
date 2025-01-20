import { Component } from "solid-js"
import styles from './rendering.module.less';
import { useNavigate } from "@solidjs/router";
import { routeNames } from "routes";

const Page: Component = () => {
    // const navigate = useNavigate();

    // const redirect = (name: string) => {
    //     navigate(name);
    // }

    return (
        <>
            <button onClick={() => redirect(routeNames.DEBUG_TYPO)}>Typography</button>
            <button onClick={() => redirect(routeNames.DEBUG_COLORS)}>Colors</button>
        </>
    )
}

export default Page;
