import Api from '@/data/api';
import WSStoreInstance from '@/data/stores/WebSocket/store';
import { wsNames } from '@/data/stores/WebSocket/types';

function page() {
    const getInstances = () => {
        const ws = WSStoreInstance.getSocket(wsNames.listInstance);
        if (ws) {
            ws.send("asd");
        }
    }

    setTimeout(() => {
        // WSStoreInstance.subscribe(wsNames.listInstance, (data) => {
        //     console.log(JSON.parse(data));
        // }, "123")
    })

    return (
        <>
            <button onClick={getInstances}>Get Instances</button>
        </>
    )
}

export default page;
