import Button from "uikit/components/Button"
import { ButtonSizes, ButtonTypes } from "uikit/components/Button/button"
import { Sidebar } from "uikit/components/Sidebar/sidebar"
import { VerticalStack } from "uikit/components/Window"
import { ContentWrapper } from "uikit/components/Window/window"
import { GetButtonsConfig } from "./buttonConfig"
import { createMemo, createSignal, For, JSX } from "solid-js"
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


interface InstanceOptionsProps {
    name: string,
    id: number
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

export const pageComponents: Record<InstanceOptionPage, () => JSX.Element> = {
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
    component: () => JSX.Element
    icon: () => JSX.Element
}

const pages: PageConfig[] = [
    {
        id: "Overview",
        label: "Overview",
        component: () => OverviewPage,
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
    const [windowVisible, setWindowVisible] = createSignal(true);
    const [currentPageId, setCurrentPageId] = createSignal(pages[0].id)

    const closeWindow = () => {
        setWindowVisible(false);
    }

    const buttonConfig = GetButtonsConfig({ closeWindow });
    const currentButtons = () => buttonConfig[0];

    const constructedWindowName = createMemo(
        () => `${props.name} > ${pagesMap[currentPageId()].label}`
    );

    const currentConfig = createMemo(() => pagesMap[currentPageId()])

    return (
        <Window
            visible={windowVisible}
            setVisible={setWindowVisible}
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
            <ContentWrapper alignTop>
                <VerticalStack>
                    <Dynamic component={currentConfig().component} />
                </VerticalStack>
            </ContentWrapper>
        </Window>
    )
}
