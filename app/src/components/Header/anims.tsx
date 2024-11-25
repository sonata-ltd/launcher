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
    private headerContainer: HTMLElement;
    private animationQueue: AnimationQueue;

    constructor(headerMenu: HTMLElement, headerContainer: HTMLElement) {
        this.headerMenu = headerMenu;
        this.headerContainer = headerContainer;
        this.animationQueue = new AnimationQueue();
    }

    private runAnimation = (el: HTMLElement, keyframes: any): Promise<void> => {
        return new Promise((resolve) => {
            animate(el, keyframes, {
                type: spring,
                bounce: 0.3,
                duration: 0.8,
            }).then(() => resolve());
        });
    };

    public animateOnFirstMount = (el: HTMLElement) => {
        // animate(
        //     el,
        //     {
        //         transform: ["translateX(15px)", "translateX(0px)"],
        //         opacity: [0, 1],
        //     },
        //     { type: spring, bounce: 0.3, duration: 0.8 },
        // );
    };

    public animateItemRemoval = (removalPath: string, fn: any) => {
        this.animationQueue.add(async () => {
            return new Promise((res) => {
                const el = document.querySelector(
                    `button[data-headertab-path="header-tab:${removalPath}"]`,
                );

                if (el) {
                    const headerMenuChildrens = this.headerMenu.childNodes;
                    const headerMenuOffset = this.headerMenu.offsetLeft;
                    const tabsGap = 10;

                    // Get removal element index in header menu
                    const elIndex = Array.from(headerMenuChildrens).indexOf(el);

                    // Get removal element offset
                    const elWidth = el.offsetWidth;
                    const totalOffset = elWidth + tabsGap * 2 + tabsGap;
                    const elOuterWidth =
                        elWidth * elIndex + tabsGap * 2 * elIndex + tabsGap;

                    // Change removal element parent to header menu container
                    //
                    // This is to ensure that the animation of the next element
                    // and the animation of the header menu itself does
                    // not shift the deleted element
                    el.style.position = "absolute";
                    el.style.marginLeft = `${elOuterWidth}px`;

                    // If the next element is found, an indentation will be applied
                    // to compensate for the deleted element since it is no longer
                    // in this container. We don't want to have any sudden
                    // interface jumps
                    const nextEl = headerMenuChildrens[elIndex + 1];
                    if (nextEl) {
                        const tempMargin = totalOffset;
                        nextEl.style.marginLeft = `${tempMargin}px`;

                        animate(
                            nextEl,
                            {
                                marginLeft: [`${tempMargin}px`, `${tabsGap}px`],
                            },
                            { type: spring, bounce: 0.3, duration: 0.8 },
                        );

                        animate(
                            el,
                            {
                                marginLeft: [
                                    `${elOuterWidth}px`,
                                    `${elOuterWidth - elWidth / 2 - tabsGap}px`,
                                ],
                            },
                            { type: spring, bounce: 0.3, duration: 0.8 },
                        );
                    } else {
                        console.log("Not found");
                    }

                    animate(el, tabStyles.exit, {
                        type: spring,
                        bounce: 0.3,
                        duration: 0.8,
                    }).then(() => {
                        fn();
                        res();
                    });
                } else {
                    console.warn("Element not found");
                }
            })
        })
    };

    public animateItemAddition = (path: string, fn: any) => {
        this.animationQueue.add(async () => {
            return new Promise((res) => {
                fn();

                const el: HTMLElement | null = document.querySelector(
                    `button[data-headertab-path="header-tab:${path}"]`,
                );

                if (el) {
                    const headerMenuChildrens = this.headerMenu.childNodes;
                    const tabsGap = 10;

                    const elIndex = Array.from(headerMenuChildrens).indexOf(el);
                    const elWidth = el.offsetWidth;
                    const elOuterWidth =
                        elWidth * elIndex + tabsGap * 2 * elIndex + tabsGap;
                    const totalOffset = elWidth + tabsGap * 2 + tabsGap;

                    el.style.position = "absolute";
                    el.style.marginLeft = `${elOuterWidth}px`;

                    const nextEl = headerMenuChildrens[elIndex + 1];

                    console.log("Animation started");
                    if (nextEl) {
                        const tempMargin = totalOffset;

                        animate(
                            nextEl,
                            {
                                marginLeft: [`${tabsGap}px`, `${tempMargin}px`],
                            },
                            { type: spring, bounce: 0.3, duration: 0.8 },
                        );

                        animate(
                            el,
                            {
                                marginLeft: [
                                    `${elOuterWidth - elWidth / 2 - tabsGap}px`,
                                    `${elOuterWidth}px`,
                                ],
                            },
                            { type: spring, bounce: 0.3, duration: 0.8 },
                        );
                    } else {
                        console.log("Not found");
                    }

                    animate(el, tabStyles.enter, {
                        type: spring,
                        bounce: 0.3,
                        duration: 0.8,
                    }).then(() => {
                        setTimeout(() => {
                            nextEl.style.marginLeft = `${tabsGap}px`;
                            el.style.position = "inherit";
                            el.style.marginLeft = `${tabsGap}px`;
                            res();
                        });
                    });
                } else {
                    console.warn("not found");
                }
            });
        });
    };

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
