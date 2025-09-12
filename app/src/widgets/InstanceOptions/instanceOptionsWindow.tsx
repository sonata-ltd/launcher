import Button from "uikit/components/Button"
import { ButtonSizes, ButtonTypes } from "uikit/components/Button/button"
import { Sidebar } from "uikit/components/Sidebar/sidebar"
import { VerticalStack } from "uikit/components/Window"
import { ContentWrapper } from "uikit/components/Window/window"
import { GetButtonsConfig } from "./buttonConfig"
import { Accessor, createComputed, createEffect, createMemo, createSignal, For, JSX, onCleanup, Setter, Show } from "solid-js"
import { Window } from "uikit/components/Window"
import { OverviewPage } from "./pages/overview"
import { LogsPage } from "./pages/logs"
import { ModsPage } from "./pages/mods"
import { RPPage } from "./pages/rp"
import { SettingsPage } from "./pages/settings"
import { SPPage } from "./pages/sp"
import { WorldsPage } from "./pages/worlds"
import { Dynamic } from "solid-js/web"

import css from "./InstanceOptions.module.less"
import { StarsIcon } from "components/Icons/stars"
import { PackageIcon } from "components/Icons/package"
import { DatabaseIcon } from "components/Icons/database"
import { ImageIcon } from "components/Icons/image"
import { CameraLensIcon } from "components/Icons/camera-lens"
import { FileIcon } from "components/Icons/file"
import { CodeSquareIcon } from "components/Icons/code-square"
import { debugComputation } from "@solid-devtools/logger"


interface InstanceOptionsProps {
    id: number | undefined,
    name: string | undefined,
    windowVisible: Accessor<boolean>,
    setWindowVisible: Setter<boolean>,
    updateName: (name: string) => void
}

export interface InstancePageProps {
    id: number,
    updateName: (name: string) => void
}

export enum InstanceOptionPage {
    Overview = "Overview",
    Mods = "Mods",
    Worlds = "Worlds",
    RP = "Resourcepacks",
    SP = "Shaderpacks",
    Logs = "Logs",
    Settings = "Settings"
}

export const pageComponents: Record<InstanceOptionPage, (props: InstancePageProps) => JSX.Element> = {
    [InstanceOptionPage.Overview]: OverviewPage,
    [InstanceOptionPage.Mods]: ModsPage,
    [InstanceOptionPage.Worlds]: WorldsPage,
    [InstanceOptionPage.RP]: RPPage,
    [InstanceOptionPage.SP]: SPPage,
    [InstanceOptionPage.Logs]: LogsPage,
    [InstanceOptionPage.Settings]: SettingsPage
};

interface PageConfig {
    id: string
    label: string
    component: (props: InstancePageProps) => JSX.Element
    icon: () => JSX.Element
}

const pages: PageConfig[] = [
    {
        id: "Overview",
        label: "Overview",
        component: OverviewPage,
        icon: () => <StarsIcon />
    },
    {
        id: "Mods",
        label: "Mods",
        component: ModsPage,
        icon: () => <PackageIcon />
    },
    {
        id: "Worlds",
        label: "Worlds",
        component: WorldsPage,
        icon: () => <DatabaseIcon />
    },
    {
        id: "Resourcepacks",
        label: "Resourcepacks",
        component: RPPage,
        icon: () => <ImageIcon />
    },
    {
        id: "Shaderpacks",
        label: "Shaderpacks",
        component: SPPage,
        icon: () => <CameraLensIcon />
    },
    {
        id: "Logs",
        label: "Logs",
        component: LogsPage,
        icon: () => <FileIcon />
    },
    {
        id: "Settings",
        label: "Settings",
        component: SettingsPage,
        icon: () => <CodeSquareIcon />
    }
]

const pagesMap = pages.reduce<Record<string, PageConfig>>((acc, page) => {
    acc[page.id] = page
    return acc
}, {})

export interface PageProps {
    id: number
}

export const InstanceOptionsWindow = (props: InstanceOptionsProps) => {
    const [currentPageId, setCurrentPageId] = createSignal(pages[0].id)
    const [buildedPagesProps, setBuildedPagesProps] = createSignal<InstancePageProps | undefined>();
    const [instanceName, setInstanceName] = createSignal<string>();

    const updateName = (name: string) => {
        props.updateName(name);
        setInstanceName(name);
    }

    const closeWindow = () => {
        props.setWindowVisible(false);
    }

    const buttonConfig = GetButtonsConfig({ closeWindow });
    const currentButtons = () => buttonConfig[0];

    const constructedWindowName = createMemo(
        () => `${instanceName()} > ${pagesMap[currentPageId()].label}`
    );

    const currentConfig = createMemo(() => pagesMap[currentPageId()])

    createEffect(() => {
        if (props.windowVisible()) {

            // For explicit remount
            setBuildedPagesProps(undefined);

            Promise.resolve().then(() => {
                if (props.name) {
                    setInstanceName(props.name);
                }

                if (props.id) {
                    setBuildedPagesProps({ id: props.id, updateName });
                }
            });
        } else {
            // Clean on close
            setBuildedPagesProps(undefined);
        }
    });

    return (
        <Window
            visible={props.windowVisible}
            setVisible={props.setWindowVisible}
            name={constructedWindowName()}
            sidebarChildren={
                <Sidebar>
                    <For each={pages}>
                        {(page) => {
                            const isActive = () => page.id === currentPageId()
                            return (
                                <Button
                                    onClick={() => setCurrentPageId(page.id)}
                                    expand
                                    type={isActive() ? ButtonTypes.secondary : ButtonTypes.tertiary}
                                    size={ButtonSizes.md}
                                    startAlign
                                    icon={true}
                                >
                                    {page.icon()}
                                    {page.label}
                                </Button>
                            )
                        }}
                    </For>
                </Sidebar>
            }
            controlsConfig={currentButtons}
            width={800}
            class={css.window}
        >
            <Show
                when={buildedPagesProps()}
            >
                {(p) => (
                    <ContentWrapper alignTop>
                        <VerticalStack>
                            <Dynamic component={currentConfig().component} id={p().id} updateName={p().updateName} />
                        </VerticalStack>
                    </ContentWrapper>
                )}
            </Show>
        </Window>
    )
}
