export {
	WindowFrame,
	type WindowControlsProps,
	WindowControls,
	ContentWrapper,
} from "./window";
export { ContentStack } from "./contentStack";
export { FlexBox } from "./flexBox";
export { VerticalStack } from "./verticalStack";
export { type ButtonConfig, type WindowFrameProps } from "./types";

import { animationValues } from "../definitions";
export const WINDOW_ANIMATIONS = animationValues.elementsPoints.window;
export const WINDOW_ANIMATIONS_TYPE = animationValues.defaultAnimationType;
