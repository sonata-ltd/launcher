import { Reactive } from 'hywer/jsx-runtime';
import css from './buttons.module.less';
import { gsap } from 'gsap/all';


interface IButtonProps {
    text: string,
    primary?: boolean,
    disabled?: boolean,
    onClick?: () => void,
}

export default function Button(props: IButtonProps) {
    return (
        <button
        className={
            `${css.button}
            Inter-Display-Regular
            ${props.primary === true ? css.primary : ''}
            ${props.disabled === true ? css.disabled : ''}`
        }
        onClick={props.onClick}
        >
            {props.text}
        </button>
    )
}


interface IInstanceCardButtonProps {
    text: string,
    isRunning?: Reactive<boolean>,
    onClick?: () => void,
    zIndex?: number,
    id?: string,
    onMouseDown?: () => void,
    onMouseUp?: () => void,
}

export function InstanceCardButton(props: IInstanceCardButtonProps) {
    return (
        <button
            className={
                `${css.InstanceCardButton}
                Inter-Display-Regular`
            }
            // style={`z-index: ${props.zIndex ? props.zIndex : 0}`}
            onClick={props.onClick}
            id={props.id}
            onMouseDown={props.onMouseDown}
            onMouseUp={props.onMouseUp}
        >
            {props.text}
        </button>
    )
}
