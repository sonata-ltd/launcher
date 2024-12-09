import { Show } from 'solid-js';
import styles from './codeComment.module.less';

const CodeComment = (props: any) => {
    return (
        <>
            <Show
                when={import.meta.env.MODE === "development"}
            >
                <div class={styles["comment-note"]}>// {props.children || "// You have not passed any value"}</div>
            </Show>
        </>
    )
}

export default CodeComment;
