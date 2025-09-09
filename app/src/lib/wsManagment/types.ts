export type wsEndpoint = Record<string, { url: string; required: boolean }>;


export const wsEndpoints = {
    listInstances: {
        url: "ws://127.0.0.1:8080/ws/instance/list",
        required: true
    },
    initInstance: {
        url: "ws://127.0.0.1:8080/ws/instance/init",
        required: true
    },
    runInstance: {
        url: "ws://127.0.0.1:8080/ws/instance/run",
        required: false
    },
    debugTasks: {
        url: "ws://127.0.0.1:8080/debug/tasks/notif",
        required: false
    }
}
