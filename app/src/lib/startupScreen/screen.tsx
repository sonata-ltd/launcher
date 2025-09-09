import { Spinner } from "uikit/components/Spinner/spinner";
import css from "./screen.module.less";
import { Accessor, children, Component, createEffect, createSignal, For, JSX } from "solid-js";
import { animate, spring } from "motion";


export const StartupScreen = () => {
    let spinner: HTMLDivElement | undefined;
    let text: HTMLParagraphElement | undefined;

    const [activeCard, setActiveCard] = createSignal<HTMLDivElement | null>(null);

    const firstDetails = [
      "Creating dir /home/quartix/.sonata",
      "Creating dir /home/quartix/.sonata/instances",
      "Creating dir /home/quartix/.sonata/config",
      "Creating dir /home/quartix/.sonata/config/user",
      "Creating dir /home/quartix/.sonata/config/system",
      "Creating dir /home/quartix/.sonata/cache",
      "Creating dir /home/quartix/.sonata/cache/temp",
      "Creating dir /home/quartix/.sonata/logs",
      "Creating dir /home/quartix/.sonata/logs/2025-05-20",
      "Creating dir /home/quartix/.sonata/assets",
      "Creating dir /home/quartix/.sonata/assets/textures",
      "Creating dir /home/quartix/.sonata/assets/shaders",
      "Creating dir /home/quartix/.sonata/assets/sounds",
      "Creating dir /home/quartix/.sonata/lib",
      "Creating dir /home/quartix/.sonata/lib/1.8",
      "Creating dir /home/quartix/.sonata/lib/1.8/jars",
      "Creating dir /home/quartix/.sonata/lib/1.8/natives",
      "Creating dir /home/quartix/.sonata/settings",
      "Creating dir /home/quartix/.sonata/settings/user",
      "Creating dir /home/quartix/.sonata/settings/system",
      "Creating dir /home/quartix/.sonata/temp",
      "Creating dir /home/quartix/.sonata/temp/downloads",
      "Creating dir /home/quartix/.sonata/temp/extracted"
    ];
    const [getFirstDetails, setFirstDetails] = createSignal(firstDetails);

    createEffect(() => {
        if (!text || !spinner) return;
        console.trace(spinner);
        console.trace(text);

        animate(
            spinner,
            { transform: ["translateY(-50px)", "translateY(0px)"] },
            { type: spring, bounce: 0, duration: 1.4 }
        ).then(() => {
            console.trace("done");
        })
    })

    return (
        <div class={css.wrapper}>
            <div class={css.gridLayer}>
                <div class={css.grid} />
            </div>

            <div class={css.container}>
                <div class={css.info}>
                    <div class={css["code-info"]}>
                        <p class={css["code-style"]}>Sonata Launcher UI</p>
                        {/* <p class={css["code-style"]}> &mdash; Startup Phase</p> */}
                    </div>
                    <InfoCard childDelay={1}>
                        <Spinner
                            ref={spinner}
                            spinnerColor="#006CFF"
                            spinnerColorBG="#CBD5E1"
                        />
                        <p ref={text}>Initializing Connection</p>
                    </InfoCard>
                    {Array(20).fill(0).map((_, i) => (
                        <>
                            <InfoCard incoming incomingDelay={i * 0.1}>
                            </InfoCard>
                        </>
                    ))}
                </div>
            </div>
        </div>
    )
}


type InfoCardProps = {
    isDone?: boolean,
    incoming?: boolean;
    incomingDelay?: number;       // задержка перед анимацией контейнера в секундах
    childDelay?: number;          // задержка между анимациями детей в секундах (по умолчанию 0.1s)
    children?: any;
    processDetails?: Accessor<string[]>
};

export const InfoCard: Component<InfoCardProps> = (props) => {
    const resolved = children(() => props.children);
    let card: HTMLDivElement | undefined;
    const childEls: HTMLElement[] = [];

    createEffect(() => {
        if (!card) return;
        const baseDelayMs = props.incomingDelay ? props.incomingDelay * 1000 : 0;
        const perChildMs = (props.childDelay ?? 0.1) * 150;

        // Анимация контейнера
        setTimeout(() => {
            animate(card,
                { transform: ["translateY(50px)", "translateY(0px)"], opacity: [0, 1] },
                { type: spring, bounce: 0, duration: 0.75 }
            );
        }, baseDelayMs);

        // Анимация потомков с задержкой
        childEls.forEach((el, index) => {
            const delayMs = baseDelayMs + perChildMs * index;
            console.log(el);
            setTimeout(() => {
                el.classList.add(css["child-incoming"]);

                animate(el,
                    { transform: ["translateY(-40px) translateX(40px)", "translateY(0px) translateX(0px)"], opacity: [0, 1] },
                    { type: spring, bounce: 0, duration: 1 }
                ).then(() => {
                    el.classList.remove(css["child-incoming"]);
                });
            }, delayMs);
        });
    });

    return (
        <>
        <div
            ref={card}
            class={css['card-wrapper']}
            classList={{ [css['card-outline']]: !props.incoming }}
        >
            <div
                style={props.incomingDelay ? `animation-delay: ${props.incomingDelay}s;` : undefined}
                classList={{
                    [css.card]: props.children && !props.incoming,
                    [css.incoming]: props.incoming === true
                }}
            >
                {props.children && !props.incoming && (
                    <For each={resolved()}>
                    {(child, idx) => (
                        <div
                            class={`child-item`}
                            style={`opacity: 0`}
                            data-index={idx()}
                            ref={(el) => (childEls[idx()] = el)}
                        >
                            {child}
                        </div>
                    )}
                    </For>
                )}
            </div>
        </div>
        {props.processDetails && (
            <div class={css["additional"]}>
                <For each={props.processDetails()}>
                {(details) => (
                    <p>{details}</p>
                )}
                </For>
            </div>
        )}
        </>
    );
};
