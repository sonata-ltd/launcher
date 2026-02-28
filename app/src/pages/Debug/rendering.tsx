import {
	Component,
	createEffect,
	createMemo,
	createSignal,
	lazy,
} from "solid-js";
import Button from "uikit/components/Button";
import { Input } from "uikit/components/Input";
import { Tabs } from "uikit/components/Tabs/tabs";
import { ChevronIcon } from "uikit/icons/components/chevron";
import { InstanceOptionsWindow } from "widgets/InstanceOptions/instanceOptionsWindow";
import ddCss from "uikit/components/Dropdown/dropdown.module.less";
import { TextArea } from "uikit/components/TextArea/textarea";
import { MapDemo } from "./tmp/reactMap";
import { ProgressBar } from "uikit/components/Progress";
import {
	createSelectableTable,
	Row,
} from "uikit/components/SelectableTable/selectableTable";
import { openWindow } from "lib/windowManager/store";
import { RuntimeSelectionWindow } from "windows/RuntimeSelection/runtimeSelectionWindow";
import { SelectableTableDebug } from "./SelectableTable/selectableTable";
import { useLocalRouter } from "lib/localRouter";
import { routeNames } from "routes";
import { ContentLoadingIndicator } from "uikit/components/Indication/loading";
import { Spinner } from "uikit/components/Spinner/spinner";
import { FlexBox } from "uikit/components/Window";
import { ButtonSizes, ButtonTypes } from "uikit/components/Button/button";
import Typo from "./uikit/Typography/typography";
import styles from "./uikit/Typography/typography.module.less";

// const debugRoutes = [
// 	{ path: "/uikit", component: lazy(() => import("./uikit/uikit")) },
// 	{
// 		path: "/uikit/typography",
// 		component: lazy(() => import("./uikit/Typography/typography")),
// 	},
// 	{
// 		path: "/uikit/colors",
// 		component: lazy(() => import("./uikit/Colors/colors")),
// 	},
// ];

// const stripBase = (base: string, full: string) =>
// 	full === base
// 		? "/"
// 		: full.startsWith(base + "/")
// 		? full.slice(base.length)
// 		: null;

const Page: Component = () => {
	// const [currentRoute, { setRoute }] = useLocalRouter();

	// const rel = createMemo(
	// 	() => stripBase(routeNames.DEBUG, currentRoute()) ?? "/uikit",
	// );
	// const active = createMemo(
	// 	() => debugRoutes.find((r) => r.path === rel()) ?? debugRoutes[0],
	// );

	// const go = (sub: string) =>
	// 	setRoute(`${routeNames.DEBUG}/${sub}`.replace(/\/+/g, "/"));

	// createEffect(() => {
	// 	useRuntimeSelectionWindow();
	// });

	// const useRuntimeSelectionWindow = async () => {
	// 	const result = await openWindow<null, null>(
	// 		RuntimeSelectionWindow,
	// 		null,
	// 	);

	// 	if (result) {
	// 		console.log(result);
	// 	}
	// };

	return (
		<>
			<div
				class={`${styles.test} ${styles.section} ${styles["headers-test"]}`}
			>
				<h1 class={styles["av-h1"]}>Header 1</h1>
				<h2 class={styles["av-h2"]}>Header 1</h2>
				<h3 class={styles["av-h3"]}>Header 3</h3>
				<h4 class={styles["av-h4"]}>Header 4</h4>
				<h5 class={styles["av-h5"]}>Header 5</h5>
				<h6 class={styles["av-h6"]}>Header 6</h6>
			</div>

			<div class={`${styles.test} ${styles.section}`}>
				<h5 class={styles["av-h5"]}>Good typography</h5>
				<p class={styles["av-text-lg-r"]}>
					The typography system is one of the most foundational parts
					of any interface design. If your users are unable to read
					your content, you can say goodbye to them immediately.
					That’s why even a rudimentary understanding of typography
					means you can determine for yourself the best fonts for
					modern UI design.
				</p>
				<p class={styles["av-text-lg-r"]}>
					I've always felt that good typography is the most
					undervalued and underappreciated elements in modern product
					design. Text is never just text. It often goes unnoticed in
					good design, but good type design can elicit emotion, guide
					attention and even create a typographical identity.
				</p>
				<h6 class={styles["av-h6"]}>
					Optimizing letter spacing for display text
				</h6>
				<p class={styles["av-text-lg-r"]}>
					Often, typefaces are designed with an intended usage in mind
					— they're optimized for display usage (larger headings), or
					text (smaller body copy etc.) In general, text type is
					designed to be legible and readable at small sizes.
				</p>
				<p class={styles["av-text-lg-r"]}>
					Don't worry, you don't necessarily need to choose a separate
					typeface for display and text. Many typefaces can be used
					for both. Inter is a great example — it's clean, consistent,
					and uncomplicated design features make it suitable for use
					at all sizes.
				</p>
				<p class={styles["av-text-lg-r"]}>
					However, if you're using the same typeface for both body
					text and display test, it is often a good idea to tweak
					letter spacing to the display text style to make it more
					legible in larger sizing. Don't go overboard though, a
					little goes a long way and helps display text look and feel
					tighter.
				</p>
				<p class={styles["av-text-lg-r"]}>
					Unfortunately, Figma only allows you to define a % or px
					value for letter spacing in text styles, which doesn't
					mirror CSS exactly. If you're handing designs to a developer
					or building a design yourself, you'll need to define either
					a hard-pixel value or, ideally, a rem/em value (e.g.
					-0.2em). Figmas Dev Mode feature actually converts these
					values to rem/em automatically!
				</p>
			</div>
			{/*<div style={{ display: "flex", gap: "10px" }}>
				<Button secondary>Loading...</Button>
				<Button secondary icon size={ButtonSizes.sm}>
					<Spinner size={17} linear spinnerColor="#191F26" />
					Loading...
				</Button>
				<Button secondary icon size={ButtonSizes.md}>
					<Spinner size={17} linear spinnerColor="#191F26" />
					Loading...
				</Button>
				<Button secondary icon size={ButtonSizes.lg}>
					<Spinner size={17} linear spinnerColor="#191F26" />
					Loading...
				</Button>
			</div>
			<div style={{ display: "flex", gap: "10px" }}>
				<Button secondary>Loading...</Button>
				<Button secondary size={ButtonSizes.sm}>
					Loading...
				</Button>
				<Button secondary size={ButtonSizes.md}>
					Loading...
				</Button>
				<Button secondary size={ButtonSizes.lg}>
					Loading...
				</Button>
			</div>
			<p style={"text-align: center"}>Nothing to debug</p>*/}
		</>
	);
};

export default Page;
