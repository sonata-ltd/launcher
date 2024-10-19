import { Reactive } from 'hywer/jsx-runtime';
import css from './style.module.less';
import './style.css';

interface IIndeterminableProgress {
    style?: string,
    rounded?: boolean
}

export function IndeterminableProgress(props: IIndeterminableProgress) {
    return (
        <div
            class="progress-bar-container"
            style={`${props.rounded ? "border-radius: 3px" : "border-radius: 0px"}`}
        >
            <div class="progress-bar">
                <div class="progress-bar-indeterminate"></div>
                <div class="progress-bar-indeterminate"></div>
                <div class="progress-bar-indeterminate"></div>
            </div>
        </div>
    )
}
