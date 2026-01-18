import { Component, createEffect, createSignal } from "solid-js";
import Button from "uikit/components/Button";
import { InstanceOptionsWindow } from "widgets/InstanceOptions/instanceOptionsWindow";

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
    </>
  );
};

export default Page;
