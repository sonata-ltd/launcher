import { Component } from "solid-js"
import styles from './typography.module.less';
import { routeNames } from "routes";
// import { useNavigate } from "@solidjs/router";

const Page: Component = () => {
    // const navigate = useNavigate();

    // const redirect = (name: string) => {
    //     navigate(name);
    // }

    return (
        <>
            <button onClick={() => redirect(routeNames.DEBUG)}>Back</button>
            <div class={`${styles.test} ${styles.section} ${styles["headers-test"]}`}>
                <h1 class={styles["av-h1"]}>Header 1</h1>
                <h2 class={styles["av-h2"]}>Header 1</h2>
                <h3 class={styles["av-h3"]}>Header 3</h3>
                <h4 class={styles["av-h4"]}>Header 4</h4>
                <h5 class={styles["av-h5"]}>Header 5</h5>
                <h6 class={styles["av-h6"]}>Header 6</h6>
            </div>

            <div class={`${styles.test} ${styles.section}`}>
                <h5 class={styles["av-h5"]}>Good typography</h5>
                <p class={styles["av-text-lg-r"]}>
                    The typography system is one of the most foundational parts of any interface design. If your users are unable to read your content, you can say goodbye to them immediately. That’s why even a rudimentary understanding of typography means you can determine for yourself the best fonts for modern UI design.
                </p>
                <p class={styles["av-text-lg-r"]}>
                    I've always felt that good typography is the most undervalued and underappreciated elements in modern product design. Text is never just text. It often goes unnoticed in good design, but good type design can elicit emotion, guide attention and even create a typographical identity.
                </p>
                <h6 class={styles["av-h6"]}>Optimizing letter spacing for display text</h6>
                <p class={styles["av-text-lg-r"]}>
                    Often, typefaces are designed with an intended usage in mind — they're optimized for display usage (larger headings), or text (smaller body copy etc.) In general, text type is designed to be legible and readable at small sizes.
                </p>
                <p class={styles["av-text-lg-r"]}>
                    Don't worry, you don't necessarily need to choose a separate typeface for display and text. Many typefaces can be used for both. Inter is a great example — it's clean, consistent, and uncomplicated design features make it suitable for use at all sizes.
                </p>
                <p class={styles["av-text-lg-r"]}>
                    However, if you're using the same typeface for both body text and display test, it is often a good idea to tweak letter spacing to the display text style to make it more legible in larger sizing. Don't go overboard though, a little goes a long way and helps display text look and feel tighter.
                </p>
                <p class={styles["av-text-lg-r"]}>
                    Unfortunately, Figma only allows you to define a % or px value for letter spacing in text styles, which doesn't mirror CSS exactly. If you're handing designs to a developer or building a design yourself, you'll need to define either a hard-pixel value or, ideally, a rem/em value (e.g. -0.2em). Figmas Dev Mode feature actually converts these values to rem/em automatically!
                </p>
            </div>
        </>
    )
}

export default Page;
