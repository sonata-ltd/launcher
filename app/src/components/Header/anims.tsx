import { animate, spring } from "motion";
import { tabStyles } from "./header";

class AnimationQueue {
    private queue: (() => Promise<void>)[] = [];
    private isRunning: boolean = false;

    public add(animation: () => Promise<void>) {
        this.queue.push(animation);
        this.runNext();
    }

    private async runNext() {
        if (this.isRunning || this.queue.length === 0) return;

        this.isRunning = true;

        const animation = this.queue.shift();
        if (animation) {
            try {
                await animation();
            } catch (error) {
                console.error("Animation failed:", error);
            }
        }

        this.isRunning = false;

        if (this.queue.length > 0) {
            this.runNext();
        }
    }
}

class HeaderAnimation {
    private headerMenu: HTMLElement;
    private animationQueue: AnimationQueue;

    // Tab Default Properties
    private marginLeft = 10;
    private marginRight = 10;
    private tabWidth = 100;
    private tabHeight = 70;
    private padding = "2px 6px 3px 6px";

    // Animation Properties
    private animationType = { type: spring, bounce: 0, duration: 0.4 };

    private tabfirstMountTransitionKeys: Record<
        string,
        [string | number, string | number]
    > = {
        transform: ["translateX(15px)", "translateX(0px)"],
        opacity: [0, 1]
    };

    private tabTransitionKeys: Record<
        string,
        [string | number, string | number]
    > = {
        width: ["0px", `${this.tabWidth}px`],
        marginLeft: ["0px", `${this.marginLeft}px`],
        marginRight: ["0px", `${this.marginRight}px`],
        padding: ["0px 0px 0px 0px", this.padding],
        transform: ["translateY(-71px)", "translateY(0px)"],
        opacity: [0, 1],
        overflow: ["visible", "hidden"],
    };


    constructor(headerMenu: HTMLElement) {
        this.headerMenu = headerMenu;
        this.animationQueue = new AnimationQueue();
    }


    private reverseTransitions(
        transitions: Record<string, [string | number, string | number]>,
    ): Record<string, [string | number, string | number]> {
        return Object.fromEntries(
            Object.entries(transitions).map(([key, value]) => [
                key,
                [value[1], value[0]],
            ]),
        );
    }


    public animateOnFirstMount = (el: HTMLElement) => {
        animate(
            el,
            this.tabfirstMountTransitionKeys,
            this.animationType
        );
    };

    public animateItemRemoval = (removalPath: string, fn: any) => {

        // Adding this animation to the queue
        // with a new Promise in case you want to
        // make a delay between animation starts
        this.animationQueue.add(async () => {
            return new Promise((res) => {
                const el = document.querySelector(
                    `button[data-headertab-path="header-tab:${removalPath}"]`,
                );

                if (el) {
                    // Get the reversed values of original animation
                    const transitionsKeys = this.reverseTransitions(
                        this.tabTransitionKeys,
                    );

                    animate(el, transitionsKeys, this.animationType).then(
                        () => {

                            // Execute passed function
                            // removeTab() in this case or any other
                            fn();
                        },
                    );

                    // Execute resolve() before the animation completes.
                    // This implementation should not break at a
                    // running the animation very often
                    //
                    // But you can put resolve() in the
                    // then() function to add a delay
                    res();
                } else {
                    console.warn("not found");
                }
            });
        });
    };

    public animateItemAddition = (path: string, fn: any) => {

        // Adding this animation to the queue
        // with a new Promise in case you want to
        // make a delay between animation starts
        this.animationQueue.add(async () => {
            return new Promise((res) => {

                // Execute passed function
                // addTab() in this case or any other
                fn();

                const el: HTMLElement | null = document.querySelector(
                    `button[data-headertab-path="header-tab:${path}"]`,
                );

                if (el) {
                    // Get the defined animation values
                    const transitionsKeys = this.tabTransitionKeys;

                    animate(el, transitionsKeys, this.animationType);

                    // Execute resolve() before the animation completes.
                    // This implementation should not break at a
                    // running the animation very often
                    //
                    // But you can put resolve() in the
                    // then() function to add a delay
                    res();
                } else {
                    console.warn("not found");
                }
            });
        });
    };

    // Header menu animation to compensate
    // interface jumping at element creation
    //
    // No more needed
    private compensateHeaderOffset = (from: number, to: number) => {
        animate(
            this.headerMenu,
            {
                transform: [`translateX(${from}px)`, `translateX(${to}px)`],
            },
            { type: spring, bounce: 0.3, duration: 0.8 },
        );
    };
}

export default HeaderAnimation;
