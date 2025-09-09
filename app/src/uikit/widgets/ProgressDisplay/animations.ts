import { animate } from "motion";
import { animationValues as av } from "uikit/components/definitions";


/**
 * Animation for newly added stages
 */
export function animateNewStages(wrapperRef: HTMLDivElement | undefined): void {
    if (!wrapperRef) return;

    setTimeout(() => {
        const childs = wrapperRef.childNodes;

        for (const child of childs) {
            if (child instanceof HTMLElement) {
                animate(
                    child,
                    { marginTop: ["100px", 0], opacity: [0, 1] },
                    av.elementsPoints.progressStages.animationType
                );
            }
        }
    });
}

/**
 * Shows progress bar with animations
 */
export function showProgress(
    stageNameRef: HTMLParagraphElement | undefined,
    itemRef: HTMLDivElement | undefined,
    progressContainerRef: HTMLDivElement | undefined,
    progressBarRef: HTMLProgressElement | undefined
): boolean {
    if (!progressContainerRef || !progressBarRef || !itemRef || !stageNameRef) return false;

    animate(
        stageNameRef,
        {
            fontSize: ["16px", "18px"],
            lineHeight: ["24px", "28px"]
        },
        av.defaultAnimationType
    );

    animate(
        [itemRef],
        { margin: [0, "10px 0"] },
        av.defaultAnimationType
    );

    animate(
        [progressContainerRef],
        { height: [0, "12px"] },
        av.defaultAnimationType
    );

    animate(
        [progressBarRef],
        { opacity: [0, 1] },
        av.defaultAnimationType
    );

    return true;
}

/**
 * Hides progress bar with animations
 */
export function hideProgress(
    stageNameRef: HTMLParagraphElement | undefined,
    itemRef: HTMLDivElement | undefined,
    progressContainerRef: HTMLDivElement | undefined,
    progressBarRef: HTMLProgressElement | undefined
): boolean {
    if (!progressContainerRef || !progressBarRef || !itemRef || !stageNameRef) return false;

    animate(
        stageNameRef,
        {
            fontSize: ["18px", "16px"],
            lineHeight: ["28px", "24px"]
        },
        av.defaultAnimationType
    );

    animate(
        [itemRef],
        { margin: ["10px 0", 0] },
        av.defaultAnimationType
    );

    animate(
        [progressContainerRef],
        { height: ["12px", 0] },
        av.defaultAnimationType
    );

    animate(
        [progressBarRef],
        { opacity: [1, 0] },
        av.defaultAnimationType
    );

    return true;
}

/**
 * Animation for completed stage with done icon
 */
export function animateCompletedStage(
    doneIconRef: SVGSVGElement | undefined,
    stageNameRef: HTMLParagraphElement | undefined
): void {
    if (!doneIconRef) return;

    animate(
        doneIconRef,
        { width: [0, "20px"] },
        av.elementsPoints.progressDisplayDoneIcon.animationType
    );

    setTimeout(() => {
        animate(
            doneIconRef,
            { opacity: [0, 1], scale: [2, 1], marginInlineEnd: [0, "7px"] },
            av.elementsPoints.progressDisplayDoneIcon.animationType
        );
    }, av.elementsPoints.progressDisplayDoneIcon.animationType.duration / 3.5 * 1000);

    if (!stageNameRef) return;

    animate(
        stageNameRef,
        {
            fontVariationSettings: [`"opsz" 14, "wght" 400"`, `"opsz" 14, "wght" 500`]
        },
        av.defaultAnimationType
    );
}

export enum Names {
    First,
    Second,
    Third
}
/**
 * Animation for switching between primary and secondary names
 */
export function switchNames(
    showName: Names,
    stageNameRef: HTMLParagraphElement | undefined,
    stageSecondNameRef: HTMLParagraphElement | undefined,
    stageThirdNameRef: HTMLParagraphElement | undefined
): Names {
    if (!stageNameRef || !stageSecondNameRef || !stageThirdNameRef) return showName;

    const stageFirstStyle = stageNameRef.style;
    const stageSecondStyle = stageSecondNameRef.style;
    const stageThirdStyle = stageThirdNameRef.style;

    if (showName === Names.First) {
        animate(
            stageNameRef,
            { opacity: [stageFirstStyle.opacity, 1] },
            av.elementsPoints.progressNames.animationType
        );

        animate(
            stageSecondNameRef,
            { opacity: [stageSecondStyle.opacity, 0] },
            av.elementsPoints.progressNames.animationType
        );

        animate(
            stageThirdNameRef,
            { opacity: [stageThirdStyle.opacity, 0] },
            av.elementsPoints.progressNames.animationType
        );

        return Names.First;
    } else if (showName === Names.Second) {
        animate(
            stageNameRef,
            { opacity: [stageFirstStyle.opacity, 0] },
            av.elementsPoints.progressNames.animationType
        );

        animate(
            stageSecondNameRef,
            { opacity: [stageSecondStyle.opacity, 1] },
            av.elementsPoints.progressNames.animationType
        );

        animate(
            stageThirdNameRef,
            { opacity: [stageThirdStyle.opacity, 0] },
            av.elementsPoints.progressNames.animationType
        );

        return Names.Second;
    } else {
        animate(
            stageNameRef,
            { opacity: [stageFirstStyle.opacity, 0] },
            av.elementsPoints.progressNames.animationType
        );

        animate(
            stageSecondNameRef,
            { opacity: [stageSecondStyle.opacity, 0] },
            av.elementsPoints.progressNames.animationType
        );

        animate(
            stageThirdNameRef,
            { opacity: [stageThirdStyle.opacity, 1] },
            av.elementsPoints.progressNames.animationType
        );

        return Names.Third;
    }
}
