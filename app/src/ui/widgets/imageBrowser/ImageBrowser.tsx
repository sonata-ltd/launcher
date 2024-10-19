import Button from '@/ui/components/buttons/Buttons';
import { Window, WindowControls } from '@/ui/components/window/Window';
import { Reactive, ref } from 'hywer/jsx-runtime';
import css from './imageBrowser.module.less';
import ie from './instanceObject.module.less';
import ImageStoreInstance from '@/data/stores/imageStore';
import { For } from 'hywer/x/html';
import { open } from '@tauri-apps/api/dialog';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { Grid } from '@/ui/components/grid/Grid';
import exampleImage from './s_marks-09_4x.png';
import { appDataDir, join } from '@tauri-apps/api/path';
import StoreInstance from '@/data/store';
import { gsap } from 'gsap/all';

interface IImageBrowser {
    zIndex?: number,
    applyVal: Reactive<string>,
    shown: Reactive<boolean>,
}

export function ImageBrowser(props: IImageBrowser) {
    const applyId = ref(-1);
    const tmpApplyVal = ref("");

    const AddImageFn = async () => {
        const selected = await open({
          multiple: true,
          filters: [{
            name: 'Image',
            extensions: ['png', 'jpeg', 'jpg']
          }]
        });
        if (selected !== null) {
            for (let i = 0; i < selected.length; i++) {
                const assetUrl = convertFileSrc(selected[i]);

                const imagePos = ImageStoreInstance.addImage(assetUrl);
            }
        }
    }

    const ApplyFn = () => {
        props.applyVal.val = tmpApplyVal.val;
        props.shown.val = false;
    }

    const CancelFn = () => {
        props.shown.val = false;
    }

    return (
        <>
            <Window name="Image Browser" style={props.zIndex ? `z-index: ${props.zIndex}; max-width: 620px` : `max-width: 620px`} shown={props.shown}>
                <div>
                    <Browser applyId={applyId} applyVal={tmpApplyVal} shown={props.shown} />
                </div>
                <WindowControls>
                    <Button text="Cancel" onClick={() => props.shown.val = false} />
                    <Button text="Add Image" onClick={AddImageFn} />
                    <Button text="Apply" primary={true} onClick={ApplyFn} />
                </WindowControls>
            </Window>
        </>
    )
}


interface IBrowser {
    applyId: Reactive<number>,
    applyVal: Reactive<string>,
    shown: Reactive<boolean>,
}

function Browser(props: IBrowser) {
    const componentId = StoreInstance.makeId(6);

    ImageStoreInstance.savedAlertHighlight.sub = (val) => {
        console.log("Play anim");
        if (val.length !== 0) {
            const element = document.getElementById(`BrowserImage-${componentId}-${val[val.length - 1]}`);
            if (element) {
                const tl = gsap.timeline({ paused: true });
                element.focus();

                // Add your animation to the timeline
                tl.to(element, {
                    scale: 1.1,
                    ease: 'power1.In',
                    duration: 0.15,
                })
                .to(element, {
                    scale: 1.0,
                    ease: 'power1.Out',
                    duration: 0.45,
                    onComplete: () => {
                        props.applyId.val = val[val.length - 1];
                    }
                });

                tl.play();
            }
        }
    };

    const applyId = (i: number, uri: string) => {
        if (props.shown.val === true) {
            props.applyId.val = i;
            props.applyVal.val = uri;
        }
    }

    return (
        <>
            <Grid>
            {
                ImageStoreInstance.loadedImages.derive(val => {
                    if (val.length <= 0) {
                        return <>
                            <p>Nothing to show</p>
                        </>
                    } else {
                        return <For in={val}>
                            {(item, i) => {
                                const decodedURI = decodeURI(item);
                                return <>
                                    <button
                                        class={props.applyId.derive(val => val === i ? `${css.ImageWrapper} ${css.selected}` : `${css.ImageWrapper}`)}
                                        style={props.shown.derive(val => val === true ? `cursor: pointer` : `cursor: default`)}
                                        id={`BrowserImage-${componentId}-${i}`}
                                        onClick={() => applyId(i, decodedURI)}
                                    >
                                        <img src={decodedURI} alt=""/>
                                    </button>
                                </>
                            }}
                        </For>
                    }
                })
            }
            </Grid>
        </>
    )
}


function InstanceElement() {
    return (
        <>
            <div class={ie.Wrapper}>
                <img src={exampleImage} alt="" />
                <div class={ie.InnerWrapper}>
                    <p>Shipperly's SMP</p>
                    <p>Fabric 1.20.1</p>
                </div>
            </div>
        </>
    )
}
