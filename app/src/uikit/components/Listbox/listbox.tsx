import { createSignal, ParentProps, JSX, createContext, useContext, createEffect } from "solid-js";
import css from "./listbox.module.less";
import { debugComputation } from "@solid-devtools/logger";


type ListboxContextType<T> = {
    value: T;
    onChange: (value: T) => void;
    query: () => string;
    setQuery: (q: string) => void;
};

const ListboxContext = createContext<ListboxContextType<any>>();

export type ListboxProps<T> = {
    value: T;
    onChange: (value: T) => void;
    children?: JSX.Element | JSX.Element[];
};

export type ListboxItemProps = {
    value: string;
    children: JSX.Element | string;
};

type ListboxComponent = (<T>(props: ListboxProps<T>) => JSX.Element) & {
    Item: (props: ListboxItemProps) => JSX.Element | null;
};


const ListboxImpl = <T extends string&{},>(props: ListboxProps<T>) => {
    const [query, setQuery] = createSignal("");

    return (
        <ListboxContext.Provider value={{ value: props.value, onChange: props.onChange, query, setQuery }}>
            <div class={css.wrapper}>
                {/* Отображение выбранного значения */}
                <div class={css.header}>
                    <span>Selected: {props.value}</span>
                </div>
                {/* Поле поиска */}
                <div class={css.search}>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={query()}
                        onInput={(e) => setQuery(e.currentTarget.value)}
                    />
                </div>
                {/* Список элементов – Listbox.Item отфильтровывают себя самостоятельно */}
                <div class={css["selector-area"]}>
                    {() => {
                        query();
                        return props.children as Element;
                    }}
                </div>
            </div>
        </ListboxContext.Provider>
    );
};


const ListboxItem = (props: ListboxItemProps) => {
    const context = useContext(ListboxContext);

    if (!context) {
        throw new Error("Listbox.Item must be used within a Listbox");
    }

    if (!props.value.toLowerCase().includes(context.query().toLowerCase())) {
        console.log("no");
        return null;
    } else {
        console.log("yes");
    }

    const selected = () => context.value === props.value;

    return (
        <button
            onClick={() => context.onChange(props.value)}
            aria-selected={selected() ? "true" : "false"}
            class={css["item"]}
            classList={{
                [css.selected]: selected() === true
            }}
        >
            {props.children}
        </button>
    );
};


const Listbox = ListboxImpl as ListboxComponent;
Listbox.Item = ListboxItem;

export { Listbox };
