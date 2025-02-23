import { spring } from "motion";

export const animationValues = {
    defaultAnimationType: { type: spring, bounce: 0, duration: 0.4 },

    elementsPoints: {
        button: {
            mouseDown: { transform: ["scale(1)", "scale(0.9)"] },
            mouseUp: { transform: "scale(1)" }
        },
        window: {
            open: {
                top: ["-50px", "0px"],
                opacity: [0, 1]
            },
            close: {
                top: ["0px", "-50px"],
                opacity: [1, 0]
            }
        },
        contentLoadingIndicator: {
            animationType: { type: spring, bounce: 0.3, duration: 0.7 },
        },
        progressDisplayDoneIcon: {
            animationType: { type: spring, bounce: 0.3, duration: 0.7 },
        },
        progressStages: {
            animationType: { type: spring, bounce: 0, duration: 0.7 },
        }
    }
}
