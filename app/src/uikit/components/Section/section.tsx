import { JSXElement } from "solid-js";
import css from "./section.module.less";
import { DEFAULT_GAP } from "../definitions";

interface SectionProps {
  label: string;
  children: JSXElement | JSXElement[];
  gapContent?: boolean;
}

export const OptionsSection = (props: SectionProps) => {
  return (
    <>
      <div class={css["section"]}>
        <p>{props.label}</p>
        <div
          style={
            props.gapContent
              ? `display: flex; flex-direction: column; gap: ${DEFAULT_GAP}px`
              : ``
          }
        >
          {props.children}
        </div>
      </div>
    </>
  );
};

interface TextProps {
  children: JSXElement;
}

export const DescriptionText = (props: TextProps) => {
  return (
    <>
      <p class={css["description"]}>{props.children}</p>
    </>
  );
};
