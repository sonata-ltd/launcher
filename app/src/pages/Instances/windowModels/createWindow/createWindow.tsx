import { ManifestDBID } from "lib/dbInterface/manifests/handler";
import { VersionManifestSchema } from "lib/dbInterface/manifests/types";
import { useDBData } from "lib/dbInterface/provider";
import { httpCoreApi, validateMessageType } from "lib/httpCoreApi";
import { InstanceInfo, useInstancesState } from "lib/instancesManagment";
import { useWebSocket } from "lib/wsManagment/wsManager";
import { createEffect, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { GetButtonsConfig } from "./buttonConfig";


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

    const [{ getManifestVersionsMap, getVersionData }] = useInstancesState();

    const [selectedVersionStore, setSelectedVersionStore] = createStore<InstanceInfo>({
        name: undefined,
        version: undefined,
        loader: undefined
    });

    createEffect(() => {
        console.log(selectedVersionStore);
    })

    const [isWindowVisible, setWindowVisible] = createSignal(true);
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

        const version = getVersionData(selectedVersionValue.version);
        if (!version) return;

        const sendObject = JSON.stringify({
            name: selectedVersionValue.name || version.id,
            url: version.url,
            request_id: "asd"
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
