import { JSX } from "hywer/jsx-runtime";
import css from './displayIcon.module.less';

interface IDisplayIcon {
    children: JSX.Element,
    style: string,
    onClick?: () => void,
}

export function DisplayIcon(props: IDisplayIcon) {
    return (
        <>
            <div class={css.Wrapper} style={props.style}>
                <div class={css.ButtonWrapper}>
                    <button onClick={props.onClick}>
                        <p>Change Icon</p>
                    </button>
                </div>
                {props.children}
            </div>
        </>
    )
}
