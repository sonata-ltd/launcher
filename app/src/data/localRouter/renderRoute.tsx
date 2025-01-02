import { createEffect, For, ParentProps, Show } from "solid-js";
import { useLocalRouter } from "./localRouter";
import { routes } from "routes";

import css from "./renderRoute.module.less";
import { useLogger } from "data/logger";
import { KeepAliveProvider, KeepAliveWrapper } from "data/keepAlive";


interface RenderRouteProps {
    keepAlive?: boolean | "cacheAll",
}

export const RenderRoute = (props: ParentProps<RenderRouteProps>) => {
    const [loggerSettings, setLoggerSettings, { log }] = useLogger();
    const [currentRoute, { getScrollValues }] = useLocalRouter();


    createEffect(() => {
        const [y, x] = getScrollValues(currentRoute());
        window.scrollTo(x, y);

        log("localRouter.scroll", `Scrolled to x: ${x}, y: ${y}`);
    })


    return (
        <KeepAliveProvider>
            <div class="content-view">

                {/*
                    Do not create outer div for each route component if
                    we are using default routing or we are using keepAlive
                    without cacheAll enabled
                */}
                {props.keepAlive !== "cacheAll" ?
                    <For each={routes}>
                        {(route, i) => (
                            <Show
                                when={currentRoute() === route.path}
                            >
                                {props.keepAlive ? (
                                    <KeepAliveWrapper id={route.path}>
                                            <route.component />
                                    </KeepAliveWrapper>
                                    ) : (
                                        <route.component />
                                    )
                                }
                            </Show>
                        )}
                    </For>
                    :
                    <For each={routes}>
                        {(route, i) => (
                            <div
                                class={`${css["router-component"]}`}
                                classList={{
                                    [css.enabled]: currentRoute() === route.path
                                }}
                            >
                                <route.component />
                            </div>
                        )}
                    </For>
                }
            </div>
        </KeepAliveProvider>
    )
}
