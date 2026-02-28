import { JSX } from "solid-js/jsx-runtime";

import css from "./window.module.less";
import { DEFAULT_GAP } from "../definitions";

export interface IFlexBox {
	expand?: boolean;
	fill?: boolean;
	center?: boolean;
	children: JSX.Element | JSX.Element[];
	gap?: number | boolean;
	class?: string;
}

export const FlexBox = (props: IFlexBox) => {
	const gapValue = () => {
		if (props.gap === true) return `${DEFAULT_GAP}px`;
		if (typeof props.gap === "number") return `${props.gap}px`;
		return undefined;
	};

	return (
		<>
			<div
				class={css.flexbox}
				classList={{
					[css.expand]: props.expand,
					[css.center]: props.center,
					[css.fill]: props.fill,
					[props.class]: props.class,
				}}
				style={{
					gap: gapValue(),
				}}
			>
				{props.children}
			</div>
		</>
	);
};
