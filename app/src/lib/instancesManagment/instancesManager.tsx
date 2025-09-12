import { ManifestDBID } from "lib/dbInterface/handler";
import { VersionSchema } from "lib/dbInterface/manifests/types/prism";
import { PrismVersionManifestSchema } from "lib/dbInterface/manifests/types/prism";
import { useDBData } from "lib/dbInterface/provider";
import { validateMessageType } from "lib/httpCoreApi";
import { operationEventSchema, operationUpdateSchema, scanDataSchema } from "lib/msgBindings";
import { indexMessageSchema } from "lib/msgBindings";
import { tryValidateMessageAs } from "lib/msgBindings/parse";
import { useWebSocket } from "lib/wsManagment/manager";
import { Accessor, createContext, createEffect, createSignal, useContext } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { z } from "zod";


type UnifiedVersionInfo = {
    id: string,
    url: string,
}

export type InstanceInfo = {
    id: number,
    loader: string,
    name: string,
    version: string
}

type Store = [
    {
        instances: Accessor<InstanceInfo[]>,
        runInstance: (instance: InstanceInfo) => void,
        getVersionUrl: (versionId: string) => UnifiedVersionInfo["url"] | undefined,
        getManifestVersionsMap: () => Map<string, string>,
        updateInstancesList: () => void,
        updateInstanceName: (id: number, name: string) => void,
    }
]

const InstancesStateContext = createContext<Store>();
const currentManifestProvider = ManifestDBID.unifiedVersionManifest;

export function InstancesStateProvider(props: { children: JSX.Element }) {
    // const sockets = useWebSockets();
    // const { state, messages, sendMessage } = sockets.listInstances;

    const [dbMethods] = useDBData();
    let manifestVersionsMap = new Map<UnifiedVersionInfo["id"], UnifiedVersionInfo["url"]>();

    createEffect(async () => {
        dbMethods.getManifest(currentManifestProvider).then((data) => {
            if (data) {
                for (const version of data) {
                    manifestVersionsMap.set(version.id, version.url);
                }
            } else {
                console.error("data from DB is null");
            }
        })
    })

    const wsListInstances = useWebSocket("listInstances", true);
    const wsRunInstance = useWebSocket("runInstance");

    const [instances, setInstances] = createSignal<InstanceInfo[]>([]);

    const getManifestVersionsMap = () => {
        return manifestVersionsMap;
    }

    const getVersionUrl = (id: string): UnifiedVersionInfo["url"] | undefined => {
        return manifestVersionsMap.get(id);
    }

    const runInstance = (instance: InstanceInfo) => {
        const versionUrl = getVersionUrl(instance.version);
        if (!versionUrl) {
            console.error(`Version url with id ${instance.version} not found`);
            return;
        }

        const info = new Map<string, string>();
        info.set("${auth_player_name}", "Melicta");
        info.set("${user_type}", "legacy");
        info.set("${auth_uuid}", "99b3e9029022309dae725bb19e275ecb");
        info.set("${auth_access_token}", "[asdasd]");

        let infoObject: Record<string, string> = {};
        info.forEach((value, key) => {
            infoObject[key] = value;
        });

        const sendObject = JSON.stringify({
            name: instance.name,
            url: versionUrl,
            request_id: "asd",
            info: infoObject
        });

        wsRunInstance.sendMessage(sendObject);
    }

    const addInstance = (info: InstanceInfo) => {
        setInstances((prev) => [...prev, info]);
    }

    const removeInstance = (info: InstanceInfo) => {
        setInstances((prev) => prev.filter((t) => t !== info));
    }

    const updateInstanceName = (id: number, name: string) => {
        setInstances((prev) => prev.map((inst) => inst.id === id ? { ...inst, name } : inst))
    }

    const updateInstancesList = () => {
        setInstances([]);
        wsListInstances.sendMessage("");
    }

    createEffect(() => {
        updateInstancesList();
    }, []);

    createEffect(() => {
        const messages = wsListInstances.messages;

        if (messages().length > 0) {
            const rawMsg = messages()[messages().length - 1];

            const res = tryValidateMessageAs("scan", rawMsg);
            if (!res.success) {
                console.warn("bad message:", res.error);
            } else {
                handleScanData(res.payload.data);
            }
        }
    })

    const handleScanData = (data: z.infer<typeof scanDataSchema>): boolean => {
        if (!data.info) return false;
        const info = data.info;

        addInstance({
            id: info.id,
            name: info.name,
            loader: info.loader,
            version: info.version
        } as InstanceInfo)

        return true;
    }

    const store: Store = [
        {
            instances,
            runInstance,
            getVersionUrl,
            getManifestVersionsMap,
            updateInstancesList,
            updateInstanceName
        }
    ]

    return (
        <InstancesStateContext.Provider value={store}>
            {props.children}
        </InstancesStateContext.Provider>
    )
}

export function useInstancesState() {
    const context = useContext(InstancesStateContext);

    if (!context) {
        throw new Error("useInstancesState must be used inside InstancesStateProvider");
    }

    return context;
}
