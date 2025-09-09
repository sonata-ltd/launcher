import { InstanceInfo, useInstancesState } from "lib/instancesManagment";
import { useWebSocket } from "lib/wsManagment/manager";
import { createEffect, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { GetButtonsConfig } from "./buttonConfig";
import { v4 as uuidv4 } from "uuid";


enum WindowPages {
    INSTANCE_DETAILS,
    DOWNLOAD
}

export enum SelectedVersionProperty {
    instanceName = "instanceName",
    versionId = "versionId",
}

export const createWindowModel = () => {
    const ws = useWebSocket("initInstance");
    const { sendMessage, messages, getMessagesTracked, state } = ws;

    const [{ getVersionUrl }] = useInstancesState();

    const [selectedVersionStore, setSelectedVersionStore] = createStore<InstanceInfo>({
        loader: undefined,
        name: undefined,
        version: undefined
    });

    const [isWindowVisible, setWindowVisible] = createSignal(false);
    const [windowIndex, setWindowIndex] = createSignal(0);
    let prevWindowIndex: undefined | number = undefined;


    // Define essential functions
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

    // Define buttons
    const buttonConfig = GetButtonsConfig({ closeWindow, changeWindowIndex });
    const currentButtons = () => buttonConfig[windowIndex()];

    const startInstanceInit = () => {
        const selectedVersionValue = selectedVersionStore;
        if (!selectedVersionValue || !selectedVersionValue.version) return;

        const versionUrl = getVersionUrl(selectedVersionValue.version);
        if (!versionUrl) return;

        console.log(selectedVersionValue.name);
        const sendObject = JSON.stringify({
            name: selectedVersionValue.name || selectedVersionValue.version,
            url: versionUrl,
            request_id: uuidv4()
        });

        sendMessage(sendObject);
    }

    const setStoreValueFromInput = (e: InputEvent, type: keyof InstanceInfo) => {
        if (e.target instanceof HTMLInputElement) {
            setSelectedVersionStore(type, e.target.value)
        }
    }

    const getNamePlaceholder = (fallback: string) => {
        if (
            !selectedVersionStore.name
            && selectedVersionStore.version
        ) {
            return selectedVersionStore.version;
        } else {
            return fallback;
        }
    }

    const selectVersionId = (versionId: string) => {
        setSelectedVersionStore("version", versionId);
    }

    createEffect(() => {
        switch (windowIndex()) {
            case WindowPages.DOWNLOAD:
                startInstanceInit();
                break;
        }
    })


    const getWSMessages = () => {
        return messages();
    }

    const getWSState = () => {
        return state();
    }


    return {
        isWindowVisible,
        setWindowVisible,
        currentButtons,
        windowIndex,
        prevWindowIndex,
        enableCreateWindow,
        getWSMessages,
        getMessagesTracked,
        getWSState,
        selectedVersionStore,
        setSelectedVersionStore,
        setStoreValueFromInput,
        selectVersionId,
        getNamePlaceholder
    }
}
