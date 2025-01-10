export type wsName = Record<string, string>;

export const wsNames = {
    listInstances: "ws://127.0.0.1:8080/ws/instance/list",
    runInstance: "ws://127.0.0.1:8080/ws/instance/run",
}
