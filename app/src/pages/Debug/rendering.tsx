import { Component, createEffect, createSignal } from "solid-js";
import Button from "uikit/components/Button";
import { Tab, Tabs } from "uikit/components/Tabs/tabs";
import { InstanceOptionsWindow } from "widgets/InstanceOptions/instanceOptionsWindow";

const Page: Component = () => {
  const tabs: Tab[] = [
    {
      name: "Tab Button",
    },
    {
      name: "Tab Button",
    },
    {
      name: "Tab Button",
    },
    {
      name: "Tab Button",
    },
    {
      name: "Tab Button",
    },
    {
      name: "Tab Button",
    },
    {
      name: "Tab Button",
    },
    {
      name: "Tab Button",
    },
    {
      name: "Tab Button",
    },
    {
      name: "Tab Button",
    },
  ];

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

      <div style={"max-width: 100%; padding: 10px"}>
        <Tabs tabs={tabs} />
      </div>
    </>
  );
};

export default Page;
