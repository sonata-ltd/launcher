import { ButtonTypes } from "uikit/components/Button/button";


type GetButtonsConfigProps = {
    closeWindow: () => void,
}

export const GetButtonsConfig = (props: GetButtonsConfigProps) => {
    const {
        closeWindow,
    } = props;

    return [
        [
            {
                label: "Cancel",
                action: () => closeWindow(),
                type: ButtonTypes.secondary,
            },
            {
                label: "Apply",
                action: () => console.log("Applied"),
                type: ButtonTypes.primary,
            }
        ]
    ]
}
