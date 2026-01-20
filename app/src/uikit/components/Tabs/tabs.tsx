import {
  children,
  Component,
  createEffect,
  createMemo,
  createSignal,
  For,
  JSX,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import css from "./tabs.module.less";
import { animate } from "motion";
import { animationValues as av } from "../definitions";

export interface TabsProps {
  tabs: TabItem[];
}

export interface TabItem {
  name: string;
  content: JSX.Element;
}

export const Tabs: Component<TabsProps> = (props: TabsProps) => {
  const [selectedTab, setSelectedTab] = createSignal(0);
  const [tabWidth, setTabWidth] = createSignal<number | undefined>(undefined);
  const [tabHeight, setTabHeight] = createSignal<number | undefined>(undefined);

  let tabsWrapper: HTMLDivElement | undefined;
  let tabsBacking: HTMLDivElement | undefined;
  const wrapperPadding = 4;

  const recalculateDimensions = () => {
    const buildedTab = tabsWrapper?.children[0];
    if (!buildedTab || !tabsBacking) {
      return;
    }

    const rect = buildedTab.getBoundingClientRect();
    setTabWidth(rect.width);
    setTabHeight(rect.height);

    tabsBacking.style.height = `${rect.height}px`;
    tabsBacking.style.width = `${rect.width}px`;
  };

  onMount(() => {
    recalculateDimensions();

    // Debounce for optimization
    let resizeTimeout: ReturnType<typeof setTimeout> | undefined;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        recalculateDimensions();
      }, 150); // 150ms debounce
    };

    window.addEventListener("resize", handleResize);

    onCleanup(() => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    });
  });

  // Animation on selectedTab change or tab sizes change
  createEffect(() => {
    const index = selectedTab();
    const width = tabWidth();

    if (!tabsBacking || width === undefined) {
      return;
    }

    const newLeft = () => {
      // Add or remove 1px padding to make backing pixel-perfect aligned
      if (index === 0) return wrapperPadding - 1 + width * index;
      else return wrapperPadding + 1 + width * index;
    };

    animate(tabsBacking, { left: `${newLeft()}px` }, av.defaultAnimationType);
  });

  return (
    <>
      <div ref={tabsWrapper} class={css.wrapper}>
        <For each={props.tabs}>
          {(tab, i) => {
            return (
              <SingleTab
                name={tab.name}
                separator={() =>
                  i() !== 0 &&
                  selectedTab() !== i() &&
                  selectedTab() + 1 !== i()
                }
                active={() => i() === selectedTab()}
                onClick={() => setSelectedTab(i())}
                index={i()}
              />
            );
          }}
        </For>
        <div
          ref={tabsBacking}
          class={css.active}
          style={"position: absolute"}
        ></div>
      </div>

      <div class={css.content}>
        <For each={props.tabs}>
          {(tab, i) => {
            return (
              <Show when={i() === selectedTab()}>
                <div class={css["tab-content"]}>{tab.content}</div>
              </Show>
            );
          }}
        </For>
      </div>
    </>
  );
};

const SingleTab: Component<{
  name: string;
  separator: () => boolean;
  active: () => boolean;
  onClick: () => void;
  index: number;
}> = (props) => {
  return (
    <button onClick={props.onClick} class={css.tab}>
      <div
        class={css.separator}
        classList={{ [css.active]: !props.separator?.() }}
      ></div>
      <p>{props.name}</p>
    </button>
  );
};
