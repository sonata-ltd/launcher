export const calcStringWidth = (
    text: string,
    font: string = "14px Inter"
): number => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return 0;

    context.font = font;
    return context.measureText(text).width;
}
