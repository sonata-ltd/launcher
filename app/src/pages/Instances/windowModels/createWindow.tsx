import { useWebSockets } from "lib/wsManagment";
import { useWebSocket } from "lib/wsManagment/wsManager";
import { createEffect, createSignal } from "solid-js";
import { ButtonTypes } from "uikit/components/Button/button";import { debugComputation } from '@solid-devtools/logger'


enum WindowPages {
    INSTANCE_DETAILS,
    DOWNLOAD
}

export const createWindowModel = () => {
    const ws = useWebSocket("runInstance");
    const { sendMessage, messages } = ws;

    const [isWindowVisible, setWindowVisible] = createSignal(true);
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

    const runInstanceInit = () => {
        sendMessage(JSON.stringify({ name: "asd", url: "asd" }));
        // console.log("create send request");
    }

    const getWSMessages = () => {
        return messages();
    }


    createEffect(() => {
        switch (windowIndex()) {
            case WindowPages.DOWNLOAD:
            // console.log("run instance init");
                runInstanceInit();
        }
    })


    return {
        isWindowVisible,
        setWindowVisible,
        currentButtons,
        windowIndex,
        prevWindowIndex,
        enableCreateWindow,
        getWSMessages
    }
}
