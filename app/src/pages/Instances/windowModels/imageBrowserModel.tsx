import { createSignal } from "solid-js";

export const imageBrowserModel = () => {
    const [imageBrowserVisible, setImageBrowserVisible] = createSignal(false);
    const [imageSrc, setImageSrc] = createSignal<null | string>(null);


    return {
        imageBrowserVisible,
        setImageBrowserVisible,
        imageSrc,
        setImageSrc
    }
}
