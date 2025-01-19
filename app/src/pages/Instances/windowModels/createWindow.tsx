import { createSignal } from "solid-js";
import { ButtonTypes } from "uikit/components/Button/button";

export const createWindowModel = () => {
    const [isWindowVisible, setWindowVisible] = createSignal(false);
    const [windowIndex, setWindowIndex] = createSignal(0);
    const [prevWindowIndex, setPrevWindowIndex] = createSignal<undefined | number>(undefined);


    const buttonConfig = [
        [
            {
                label: "Cancel",
                action: () => closeWindow(),
                type: ButtonTypes.secondary,
            },
            {
                label: "Install",
                action: () => changeWindowIndex(true),
                type: ButtonTypes.primary,
            }
        ],
        [
            {
                label: "Back",
                action: () => changeWindowIndex(false),
                type: ButtonTypes.secondary,
            },
            {
                label: "Next",
                action: () => changeWindowIndex(true),
                type: ButtonTypes.primary,
            }
        ],
        [
            {
                label: "Back",
                action: () => changeWindowIndex(false),
                type: ButtonTypes.secondary,
            },
            {
                label: "Next",
                action: () => closeWindow(),
                type: ButtonTypes.primary,
            }
        ]
    ]

    const currentButtons = () => buttonConfig[windowIndex()];


    const enableCreateWindow = () => {
        setWindowVisible(true);
    }

    const changeWindowIndex = (increment: boolean) => {
        setPrevWindowIndex(windowIndex());

        if (increment)
            setWindowIndex((prev) => prev + 1);
        else
            setWindowIndex((prev) => prev - 1);
    }

    const closeWindow = () => {
        setWindowVisible(false);
    }


    return {
        isWindowVisible,
        setWindowVisible,
        currentButtons,
        windowIndex,
        prevWindowIndex,
        enableCreateWindow
    }
}
