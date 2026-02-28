import { IconProps } from "../type";

export const PlusIcon = (props: IconProps) => {
	return (
		<svg
			class={props.class}
			ref={props.ref}
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M9.99984 4.16675V15.8334M4.1665 10.0001H15.8332"
				stroke="#191F26"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	);
};
