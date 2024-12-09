import { Component, createEffect, createSignal, For, Show } from "solid-js";

import CodeComment from "@/uikit/components/CodeComment";

import styles from './news.module.less';
import PreviewImage from './assets/post1.png';
import Button from "uikit/components/Button";


const News: Component = () => {
    const [data, setData] = createSignal([
        {
            "tag": "sonata news",
            "name": "example news",
            "imglink": PreviewImage,
            "descr": "if there is one thing i wish i could give to the next generation that’s coming up in this increasingly expensive world, it would be better housing opportunities. barring that, maybe some new minecraft maps from our community would suffice? for those of us that are not castle - accommodated (if you are, hook me up with your supplier), it’s rare that you have an optimal living situation – these maps understand you!",
            "date": "april 29, 2022",
            "contentlink": "asd",
            "id": "0",
        },
        {
            "tag": "minecraft news",
            "name": "new on realms: affordable housing",
            "imglink": PreviewImage,
            "descr": "if there is one thing i wish i could give to the next generation that’s coming up in this increasingly expensive world, it would be better housing opportunities. barring that, maybe some new minecraft maps from our community would suffice? for those of us that are not castle - accommodated (if you are, hook me up with your supplier), it’s rare that you have an optimal living situation – these maps understand you!",
            "date": "april 29, 2022",
            "contentlink": null,
            "id": "1",
        }
    ]);

    return (
        <>
            <div class={styles.feed}>
                <For each={data()}>
                    {(post, postId) =>
                        <div class={styles.post}>
                            <div class={styles.header}>
                                {/* <div class={styles.tag}>{post.tag}</div> */}
                                <div>{post.name}</div>
                            </div>
                            <Show
                                when={post.imglink}
                                fallback={
                                    <div class="">img is null</div>
                                }
                            >
                                <img src={post.imglink} alt="" />
                            </Show>
                            <div class={`${styles["descr"]}`}>{post.descr}</div>
                            <Show
                                when={post.contentlink}
                            >
                                <CodeComment>Implement fucking UIKit button here</CodeComment>
                                <Button primary>Read More</Button>
                            </Show>
                        </div>
                    }
                </For>
            </div>
        </>
    )
}

export default News;
