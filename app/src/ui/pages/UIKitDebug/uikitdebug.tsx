import ApiInstance from '@/data/api';
import Api from '@/data/api';
import WSStoreInstance from '@/data/stores/WebSocket/store';
import { wsNames } from '@/data/stores/WebSocket/types';

function page() {
    const getInstances = () => {
        const result = ApiInstance.getVersionManifest("1.21")
            .then(json => { console.log(json) })
            .catch(err => { console.log(err) });
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
