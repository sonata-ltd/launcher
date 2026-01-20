import { Input } from "uikit/components/Input";
import { Tab, Tabs } from "uikit/components/Tabs/tabs";

const tabs: Tab[] = [
  {
    name: "Startup",
  },
  {
    name: "Workarounds",
  },
  {
    name: "Environment",
  },
  {
    name: "Paths",
  },
];

export const SettingsPage = () => {
  return (
    <>
      <Tabs tabs={tabs} />
      <Input label="Name" value="Snipperly SMP" width={265} />
      <Input label="Tags" placeholder="SMP, Fabric, Modded" width={265} />
    </>
  );
};
