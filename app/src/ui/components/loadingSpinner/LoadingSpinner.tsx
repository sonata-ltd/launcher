import { ref } from 'hywer/jsx-runtime';
import css from './style.module.less';

interface Reactive<T> {
    val: T;
    derive: (callback: (value: T) => void) => void;
}

interface ILoadingSpinner {
    linear?: boolean,
    style?: string,
    spinnerColor?: string,
}

export function LoadingSpinner(props: ILoadingSpinner) {
    return (
        <div class={css.Spinner} style={props.style} id="lsr">
            <div class={css.SpinnerAnim}>
                <div
                    class={`${props.linear ? css.spinnerLoadingPreset : css.spinnerAwaitingPreset}`}
                    style={`${props.spinnerColor ? "border: 2.5px solid " + props.spinnerColor + "; border-top-color: transparent;" : ""}`}
                ></div>
            </div>
        </div>
    );
}
