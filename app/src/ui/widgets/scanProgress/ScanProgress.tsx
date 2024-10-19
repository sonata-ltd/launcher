import { ref } from 'hywer/jsx-runtime';
import css from './style.module.less';
import { IndeterminableProgress } from '@/ui/components/indeterminableProgress/IndeterminableProgress';
import { LoadingSpinner } from '@/ui/components/loadingSpinner/LoadingSpinner';
import Store from "@/data/store";
import { gsap } from 'gsap/all';
import WSStoreInstance from '@/data/stores/WebSocket/store';
import { wsNames } from '@/data/stores/WebSocket/types';
import ScanStoreInstance from '@/data/stores/Instance/store';
import { ScanData, CheckedScanData } from '@/data/stores/Instance/types';


enum ScanStatuses {
    Disabled,
    Awaiting,
    Running,
    Finished
}

export function ScanProgress() {
    const componentId = Store.makeId(6);
    const indicatorId = `Indicator-${componentId}`;

    const scanStatus = ref(ScanStatuses.Awaiting);
    const activeInstanceDir = ref<string>("...");
    const errorCount = ref(0);
    const spinLinear = ref(false);

    const progressValue = ref(0);
    let isScanned = false;
    let isSubscribed = false;

    // scanStatus.derive(val => {
        // setTimeout(() => {
        //     changeIndication(indicatorId, val);
        // });
    // })

    // const changeIndication = (id: string, status: ScanStatuses) => {
    //     const e = document.getElementById(id);

    //     if (e) {
    //         let bgColor = "";

    //         if (status === ScanStatuses.Disabled) {
    //             bgColor = "#949494";
    //             spinLinear.val = true;
    //         } else {
    //             bgColor = "#1D8AFF";
    //         }

    //         gsap.to(e, {
    //             backgroundColor: bgColor,
    //             ease: 'power1.Out',
    //             duration: 0.5,
    //         })
    //     } else {
    //         console.warn(`Cannot find element by ID: ${id}`);
    //     }
    // }

    const initialStatus = ScanStoreInstance.getScanStatus();
    if (initialStatus !== null && initialStatus) {
        scanStatus.val = ScanStatuses.Finished;
    }

    setTimeout(() => {
        WSStoreInstance.sendMessage(wsNames.listInstance, "asd");

        WSStoreInstance.subscribe(wsNames.listInstance, (data) => {
            const msg = JSON.parse(data);
            console.log(msg);

            if (msg.message_id === "scan_instance_complete") {
                scanStatus.val = ScanStatuses.Running;

                if (msg.target.instance_path) {
                    activeInstanceDir.val = msg.target.instance_path;
                }

                if (msg.target.instance_exist === false || msg.target.manifest_exist === false) {
                    errorCount.val += 1;
                }
            } else if (msg.message_id === "scan_complete" || msg.message === "Scan Completed") {
                scanStatus.val = ScanStatuses.Finished;
            }

            if (msg.target && msg.target.integrity && msg.target.info) {
                let scanDataObject = msg.target as CheckedScanData;
                ScanStoreInstance.pushScanData(scanDataObject);
            } else {
                console.warn(`Corrupted instance found: \n${JSON.stringify(msg.target, null, 2)}`);
            }
        })
    }, 0);


    return (
        <div class={css.Container}>
        {
            scanStatus.derive(val => {
                if (val === ScanStatuses.Awaiting) {
                    return <>
                        <IndeterminableProgress rounded={false} />
                        <div class={css.IndicatorWrapper}>
                            <div class={css.Indicator} id={indicatorId}>
                                <div>
                                    <LoadingSpinner linear={false} spinnerColor='rgba(0, 0, 0, 0.5)' />
                                    {/* <p>Awaiting File System Scan Launch</p> */}
                                </div>
                            </div>
                        </div>
                    </>
                } else if (val === ScanStatuses.Running) {
                    return <>
                        <IndeterminableProgress rounded={false} />
                        <div class={css.IndicatorWrapper}>
                            <div class={css.Indicator}>
                                <div>
                                    <LoadingSpinner linear={true} spinnerColor='rgba(0, 0, 0, 0.5)' />
                                    <p>Comparing {
                                        activeInstanceDir.derive(val => {
                                            return val;
                                        })
                                    }</p>
                                </div>
                            </div>
                        </div>
                    </>
                } else if (val === ScanStatuses.Disabled) {
                    return <>
                        <div class={css.Warning}>
                            <p>Unable to Start File System Scan &mdash; Some instances may not be available</p>
                        </div>
                    </>
                } else {
                    return <>
                    </>
                }
            })
        }
        </div>
    )
}


// {
//     scanStatus.derive(val => {
//         if (val === ScanStatuses.Awaiting) {
//             return <>
//                 <IndeterminableProgress rounded={false} />
//             </>
//         } else if (val === ScanStatuses.Running) {
//             return <>
//                 <IndeterminableProgress rounded={false} />
//             </>
//         } else if (val === ScanStatuses.Finished) {
//             return <>

//             </>
//         }
//     })
// }
// {
//     scanStatus.derive(val => {
//         if (val === ScanStatuses.Awaiting) {
//             return <>
//                 <div class={css.IndicatorWrapper}>
//                     <div class={css.Indicator} id={indicatorId}>
//                         <div>
//                             <LoadingSpinner linear={false} spinnerColor='rgba(0, 0, 0, 0.5)' />
//                             {/* <p>Awaiting File System Scan Launch</p> */}
//                         </div>
//                     </div>
//                 </div>
//             </>
//         } else if (val === ScanStatuses.Running) {
//             return <>
//                 <div>
//                     <LoadingSpinner linear={false} spinnerColor='rgba(0, 0, 0, 0.5)' />
//                     {/* <p>File System Scan is Running</p> */}
//                 </div>
//             </>
//         } else if (val === ScanStatuses.Disabled) {
//             return <><div>
//                 <p class={css.Warning}>Unable to Start File System Scan</p>
//             </div></>
//         } else {
//             return <>
//                 <p>Scan Completed</p>
//             </>
//         }
//     })
// }
// {
//     scanStatus.derive(val => {
//         if (val === ScanStatuses.Running) {
//             return <><p>Comparing /Users/quartix/.sonata/instances/asd</p></>
//         } else {
//             return <><p></p></>
//         }
//     })
// }
