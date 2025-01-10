import { createMemo, createRoot, getOwner, onCleanup, ParentProps, runWithOwner } from "solid-js";
import { useKeepAlive } from "./provider";

interface KeepAliveProps {
    id: string,
    onDispose?: () => void,
}

const KeepAliveWrapper = (props: ParentProps<KeepAliveProps>) => {
    const [keepAliveElements, { insert }] = useKeepAlive();

    const currentElement = createMemo(() => {
        return keepAliveElements().find((el) => el.id === props.id);
    });

    if (!currentElement()) {
        createRoot((dispose) => {
            insert({
                id: props.id,
                owner: getOwner(),
                children: props.children,
                dispose,
            });

            onCleanup(() => props.onDispose?.());
        });
    }

    return (
        <>
            {() => {
                const e = currentElement();
                return e?.owner
                    ? runWithOwner(e.owner, () => e?.children)
                    : null;
            }}
        </>
    )
}

export default KeepAliveWrapper;
