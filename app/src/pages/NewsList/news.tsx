import { Component, createEffect, createSignal, For, Show } from "solid-js";
import styles from './news.module.less';
import PreviewImage from './assets/preview.png';

const News: Component = () => {
    const [data, setData] = createSignal([
        {
            "tag": "sonata news",
            "name": "ребята пиздец лаунчер закрывается",
            "imglink": PreviewImage,
            "descr": "if there is one thing i wish i could give to the next generation that’s coming up in this increasingly expensive world, it would be better housing opportunities. barring that, maybe some new minecraft maps from our community would suffice? for those of us that are not castle - accommodated (if you are, hook me up with your supplier), it’s rare that you have an optimal living situation – these maps understand you!",
            "date": "april 29, 2022",
            "id": "0",
        },
        {
            "tag": "minecraft news",
            "name": "new on realms: affordable housing",
            "imglink": PreviewImage,
            "descr": "if there is one thing i wish i could give to the next generation that’s coming up in this increasingly expensive world, it would be better housing opportunities. barring that, maybe some new minecraft maps from our community would suffice? for those of us that are not castle - accommodated (if you are, hook me up with your supplier), it’s rare that you have an optimal living situation – these maps understand you!",
            "date": "april 29, 2022",
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
                                <div class={styles.tag}>{post.tag}</div>
                                <div class={styles.name}>{post.name}</div>
                            </div>
                            <Show
                                when={post.imglink}
                                fallback={
                                    <div class="">img is null</div>
                                }
                            >
                                <img src={post.imglink} alt="" />
                            </Show>
                            <div class={styles.descr}>{post.descr}</div>
                            <div class="new-footer">
                                <a href="https://mojang.com" target="_blank" class="new-open">Read More</a>
                                <p class="new-date">{post.date}</p>
                            </div>
                        </div>
                    }
                </For>
            </div>
        </>
    )
}

export default News;
