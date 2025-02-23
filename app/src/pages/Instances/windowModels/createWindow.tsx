import { useWebSockets } from "lib/wsManagment";
import { useWebSocket } from "lib/wsManagment/wsManager";
import { createEffect, createSignal } from "solid-js";
import { ButtonTypes } from "uikit/components/Button/button"; import { debugComputation } from '@solid-devtools/logger'


enum WindowPages {
    INSTANCE_DETAILS,
    DOWNLOAD
}

export const createWindowModel = () => {
    const ws = useWebSocket("initInstance");
    const { sendMessage, messages, getMessagesTracked, state } = ws;

    const [isWindowVisible, setWindowVisible] = createSignal(true);
    const [windowIndex, setWindowIndex] = createSignal(0);
    // const [prevWindowIndex, setPrevWindowIndex] = createSignal<undefined | number>(undefined);
    let prevWindowIndex: undefined | number = undefined;


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
        prevWindowIndex = windowIndex();

        if (increment)
            setWindowIndex((prev) => prev + 1);
        else
            setWindowIndex((prev) => prev - 1);
    }

    const closeWindow = () => {
        setWindowVisible(false);
    }

    const runInstanceInit = () => {

        const info = new Map<string, string>();
        info.set("${auth_player_name}", "Melicta");
        info.set("${version_name}", "1.21.4");
        info.set("${version_type}", "release");
        info.set("${user_type}", "legacy");
        info.set("${auth_uuid}", "99b3e9029022309dae725bb19e275ecb");
        info.set("${auth_access_token}", "[asdasd]");

        let infoObject: Record<string, string> = {};
        info.forEach((value, key) => {
            infoObject[key] = value;
        });

        sendMessage(JSON.stringify({
            name: "asd",
            url: "https://piston-meta.mojang.com/v1/packages/825af4c11bcd3a05a19eb3b79f5f1684d0556f61/1.21.4.json",
            request_id: "asd",
            info: infoObject
        }));
        console.log("create send request");
    }

    const getWSMessages = () => {
        return messages();
    }

    const getWSState = () => {
        return state();
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
        getWSMessages,
        getMessagesTracked,
        getWSState
    }
}
