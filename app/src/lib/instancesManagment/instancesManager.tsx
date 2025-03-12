import { debugComputation } from "@solid-devtools/logger";
import { ManifestDBID } from "lib/dbInterface/manifests/handler";
import { VersionManifestSchema, VersionSchema } from "lib/dbInterface/manifests/types";
import { useDBData } from "lib/dbInterface/provider";
import { validateMessageType } from "lib/httpCoreApi";
import { operationEventSchema, operationUpdateSchema } from "lib/wsManagment/bindings";
import { wsMessageSchema } from "lib/wsManagment/bindings/WsMessage";
import { useWebSocket } from "lib/wsManagment/wsManager";
import { Accessor, createContext, createEffect, createSignal, useContext } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { z } from "zod";



export type InstanceInfo = {
    loader: string | undefined,
    name: string | undefined,
    version: string | undefined
}

type Store = [
    {
        instances: Accessor<InstanceInfo[]>,
        runInstance: (versionId: string, instanceName: string) => void,
        getVersionData: (versionId: string) => z.infer<typeof VersionSchema> | undefined,
        getManifestVersionsMap: () => Map<string, z.infer<typeof VersionSchema>>
    }
]

const InstancesStateContext = createContext<Store>();

export function InstancesStateProvider(props: { children: JSX.Element }) {
    // const sockets = useWebSockets();
    // const { state, messages, sendMessage } = sockets.listInstances;

    const [dbMethods] = useDBData();
    let manifestVersionsMap = new Map<string, z.infer<typeof VersionSchema>>();

    createEffect(async () => {
        dbMethods.getManifest(ManifestDBID.globalVersionManifest).then((data) => {
            const parseResult = validateMessageType(VersionManifestSchema, data);

            if (parseResult) {
                console.log("ok");
                console.log("asdsad");
                for (const version of parseResult.versions) {
                    manifestVersionsMap.set(version.id, version);
                }
            } else {
                console.warn(parseResult);
            }
        })
        // console.log(data());

    })

    const wsListInstances = useWebSocket("listInstances", true);
    const wsRunInstance = useWebSocket("runInstance");

    const [instances, setInstances] = createSignal<InstanceInfo[]>([]);

    const getManifestVersionsMap = () => {
        return manifestVersionsMap;
    }

    const getVersionData = (versionId: string): z.infer<typeof VersionSchema> | undefined => {
        return manifestVersionsMap.get(versionId);
    }

    const runInstance = (versionId: string, instanceName: string) => {
        const version = getVersionData(versionId);
        if (!version) {
            console.error(`Version with id ${versionId} not found`);
            return;
        }

        const info = new Map<string, string>();
        info.set("${auth_player_name}", "Melicta");
        info.set("${version_name}", version.id);
        info.set("${version_type}", version.type);
        info.set("${user_type}", "legacy");
        info.set("${auth_uuid}", "99b3e9029022309dae725bb19e275ecb");
        info.set("${auth_access_token}", "[asdasd]");

        let infoObject: Record<string, string> = {};
        info.forEach((value, key) => {
            infoObject[key] = value;
        });

        const sendObject = JSON.stringify({
            name: instanceName,
            url: version.url,
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

    createEffect(() => {
        wsListInstances.sendMessage("");
    }, []);

    createEffect(() => {
        const messages = wsListInstances.messages;

        if (messages().length > 0) {
            const rawMsg = messages()[messages().length - 1];

            const msg = validateMessageType(wsMessageSchema, rawMsg);
            if (!msg) return;

            switch (msg.type) {
                case "operation":
                    handleOperationMessage(msg.payload.data);
                    break;
                default:
                    console.log("unknown");
            }
        }
    })

    const handleOperationMessage = (data: z.infer<typeof operationEventSchema>) => {
        switch (true) {
            case "start" in data:
                break;
            case "update" in data:
                handleOperationUpdate(data.update);
                break;
            case "finish" in data:
                break;
        }
    }

    const handleOperationUpdate = (data: z.infer<typeof operationUpdateSchema>) => {
        if (
            data.type === "Determinable"
            && data.details.target.type === "Instance"
        ) {
            if (data.details.target.info !== null) {
                const infoSlice = data.details.target.info;

                if (
                    infoSlice?.loader !== undefined
                    && infoSlice.name !== undefined
                    && infoSlice.version !== undefined
                ) {
                    const foundInstance: InstanceInfo = {
                        loader: infoSlice?.loader,
                        name: infoSlice.name,
                        version: infoSlice.version
                    }

                    addInstance(foundInstance);
                }
            }
        } else {
            console.warn("Fields of valid WebSocket message is not found");
        }
    }

    const store: Store = [
        {
            instances,
            runInstance,
            getVersionData,
            getManifestVersionsMap
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
