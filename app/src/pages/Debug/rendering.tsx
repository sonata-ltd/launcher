import { Component, createEffect, createSignal } from "solid-js";
import Button from "uikit/components/Button";
import { Input } from "uikit/components/Input";
import { Tabs } from "uikit/components/Tabs/tabs";
import { ChevronIcon } from "uikit/icons/components/chevron";
import { InstanceOptionsWindow } from "widgets/InstanceOptions/instanceOptionsWindow";
import ddCss from "uikit/components/Dropdown/dropdown.module.less";
import { TextArea } from "uikit/components/TextArea/textarea";

const Page: Component = () => {
  return (
    <>
      {/*<p style={"text-align: center"}>Nothing to debug</p>*/}
      <Button primary />
      <Button secondary />
      <Button tertiary />
      <Button primary disabled />
      <Button secondary disabled />
      <Button tertiary disabled />
      <Button destructive primary />
      <Button destructive primary disabled />

      <TextArea placeholder="java arguments" expand height={500} />
    </>
  );
};

export default Page;
