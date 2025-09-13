import { useTranslatedMessages } from "lib/localization/useMessages";
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

    const { get } = useTranslatedMessages();

    return [
        [
            {
                label: get("cancel"),
                action: () => closeWindow(),
                type: ButtonTypes.secondary,
            },
            {
                label: get("install"),
                action: () => changeWindowIndex(true),
                type: ButtonTypes.primary,
            }
        ],
        [
            {
                label: get("back"),
                action: () => changeWindowIndex(false),
                type: ButtonTypes.secondary,
            },
            {
                label: get("next"),
                action: () => changeWindowIndex(true),
                type: ButtonTypes.primary,
            }
        ],
        [
            {
                label: get("back"),
                action: () => changeWindowIndex(false),
                type: ButtonTypes.secondary,
            },
            {
                label: get("next"),
                action: () => closeWindow(),
                type: ButtonTypes.primary,
            }
        ]
    ]
}
