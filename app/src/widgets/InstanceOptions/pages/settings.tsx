import { createSign } from "node:crypto";
import { createSignal, For, Setter } from "solid-js";
import Button from "uikit/components/Button";
import CodeComment from "uikit/components/CodeComment";
import Dropdown from "uikit/components/Dropdown/dropdown";
import { Input } from "uikit/components/Input";
import { OptionsSection } from "uikit/components/Section/section";
import { Tabs } from "uikit/components/Tabs/tabs";
import { TextArea } from "uikit/components/TextArea/textarea";
import { ContentStack, FlexBox, VerticalStack } from "uikit/components/Window";

export const SettingsPage = () => {
  return (
    <>
      <Tabs
        tabs={[
          {
            name: "Startup",
            content: <StartupTab />,
          },
          {
            name: "Workarounds",
            content: (
              <>
                <CodeComment>Not implemented yet.</CodeComment>
              </>
            ),
          },
          {
            name: "Environment",
            content: (
              <>
                <CodeComment>Not implemented yet.</CodeComment>
              </>
            ),
          },
          {
            name: "Paths",
            content: (
              <>
                <CodeComment>Not implemented yet.</CodeComment>
              </>
            ),
          },
        ]}
      />
    </>
  );
};

const StartupTab = () => {
  const [minUnit, setMinUnit] = createSignal<"MB" | "GB">("MB");
  const [minMem, setMinMem] = createSignal(1024);
  const [minMemError, setMinMemError] = createSignal<string | undefined>();

  const [maxUnit, setMaxUnit] = createSignal<"MB" | "GB">("MB");
  const [maxMem, setMaxMem] = createSignal(4096);
  const [maxMemError, setmaxMemError] = createSignal<string | undefined>();

  const changeReactiveValue = <T,>(
    e: InputEvent,
    setVal: Setter<number>,
    setError: Setter<string | any>,
  ) => {
    const inputValue = (e.target as HTMLInputElement).value;
    const parsed = inputValue.trim() === "" ? NaN : Number(inputValue);

    if (!Number.isNaN(parsed) && Number.isInteger(parsed)) {
      setVal(parsed);
      setError(undefined);
    } else {
      setError("Invalid input. Expected number");
    }
  };

  return (
    <VerticalStack>
      <OptionsSection label="Path to Binary" gapContent>
        <Input
          placeholder="/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home/bin/java"
          expand
        >
          <Button secondary>Apply</Button>
        </Input>
        <FlexBox>
          <Button secondary expand>
            Auto-Detect
          </Button>
          <Button secondary expand>
            Test
          </Button>
          <Button secondary expand>
            Browse
          </Button>
        </FlexBox>
      </OptionsSection>
      <OptionsSection label="Memory" gapContent>
        <FlexBox center gap>
          <p style={"width: 100%; margin: 0;"}>Minimum allocation</p>
          <Input
            width={80}
            value={minMem().toString()}
            onInput={(e) => changeReactiveValue(e, setMinMem, setMinMemError)}
            type="number"
            error={minMemError()}
          ></Input>
          <Dropdown
            typeable={false}
            width={75}
            value={minUnit()}
            onChange={setMinUnit}
          >
            <Dropdown.Item value={"MB"}>MB</Dropdown.Item>
            <Dropdown.Item value={"GB"}>GB</Dropdown.Item>
          </Dropdown>
        </FlexBox>
        <FlexBox center gap>
          <p style={"width: 100%; margin: 0;"}>Maximum allocation</p>
          <Input
            width={80}
            value={maxMem().toString()}
            onInput={(e) => changeReactiveValue(e, setMaxMem, setmaxMemError)}
            type="number"
            error={maxMemError()}
          ></Input>
          <Dropdown
            typeable={false}
            width={75}
            value={maxUnit()}
            onChange={setMaxUnit}
          >
            <Dropdown.Item value={"MB"}>MB</Dropdown.Item>
            <Dropdown.Item value={"GB"}>GB</Dropdown.Item>
          </Dropdown>
        </FlexBox>
      </OptionsSection>
      <OptionsSection label="Arguments">
        <TextArea placeholder="java arguments" expand height={150} />
      </OptionsSection>
    </VerticalStack>
  );
};
