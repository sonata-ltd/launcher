import { spring } from "motion";

export const animationValues = {
    defaultAnimationType: { type: spring, bounce: 0, duration: 0.4 },

    elementsPoints: {
        button: {
            mouseDown: { transform: ["scale(1)", "scale(0.9)"] },
            mouseUp: { transform: "scale(1)" }
        }
    }
}
