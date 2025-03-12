import { ButtonTypes } from "uikit/components/Button/button";


type GetButtonsConfigProps = {
    closeWindow: () => void,
    changeWindowIndex: (increment: boolean) => void
}

export const GetButtonsConfig = (props: GetButtonsConfigProps) => {
    const {
        closeWindow,
        changeWindowIndex
    } = props;

    return [
        [
            {
                label: "Cancel",
                action: () => closeWindow(),
                type: ButtonTypes.secondary,
            },
            {
                label: "Install",
                action: () => changeWindowIndex(true),
                type: ButtonTypes.primary,
            }
        ],
        [
            {
                label: "Back",
                action: () => changeWindowIndex(false),
                type: ButtonTypes.secondary,
            },
            {
                label: "Next",
                action: () => changeWindowIndex(true),
                type: ButtonTypes.primary,
            }
        ],
        [
            {
                label: "Back",
                action: () => changeWindowIndex(false),
                type: ButtonTypes.secondary,
            },
            {
                label: "Next",
                action: () => closeWindow(),
                type: ButtonTypes.primary,
            }
        ]
    ]
}
