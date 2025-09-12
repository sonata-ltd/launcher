import { useInstancesState } from "lib/instancesManagment";
import { createEffect, createSignal } from "solid-js";

export const instanceOptionsModel = () => {
    const [{ updateInstanceName }] = useInstancesState();

    const [id, setId] = createSignal<number | undefined>();
    const [name, setName] = createSignal<string | undefined>();
    const [windowVisible, setWindowVisible] = createSignal(false);

    const updateName = (name: string) => {
        const currentId = id();

        if (currentId)
            updateInstanceName(currentId, name);
    }

    return {
        id,
        setId,
        name,
        setName,
        windowVisible,
        setWindowVisible,
        updateName
    }
}
