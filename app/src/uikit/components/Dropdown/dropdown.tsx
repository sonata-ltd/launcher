import { animate } from "motion";
import { createContext, createEffect, createMemo, createSignal, onCleanup, ParentComponent, children as resolveChildren, Setter, Show, useContext } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";

import { CheckIcon } from "uikit/icons/components/check";
import { ChevronIcon } from "uikit/icons/components/chevron";
import { animationValues as av } from "../definitions";
import cssInput from "../Input/input.module.less";
import css from "./dropdown.module.less";


type DropdownContextType<T> = {
    value: T,
    onChange: (value: T) => void,
    setSelectedTextValue: Setter<string>,
    setIsOpen: Setter<boolean>
}

type DropdownProps<T> = {
    width?: number,
    value: T,
    onChange: (value: T) => void,
    label?: string,
    children: JSX.Element | JSX.Element[],
    error?: boolean,
    hint?: string,
    placeholder?: string,
    actionChildren?: JSX.Element | JSX.Element[],
    expand?: boolean,
    typeable?: boolean,
}

const DropdownContext = createContext<DropdownContextType<any>>();

const Dropdown: ParentComponent<DropdownProps<any>> = (props) => {
    const [selected, setSelected] = createSignal(props.value);
    const [selectedTextValue, setSelectedTextValue] = createSignal("");
    const [search, setSearch] = createSignal("");
    const [isOpen, setIsOpen] = createSignal(false);

    let chevron: SVGSVGElement | undefined;
    let inputContainerRef: HTMLDivElement | undefined;
    let itemsWrapperRef: HTMLDivElement | undefined;


    // Handle already selected value
    createEffect(() => {
        if (props.value) {
            setSelected(props.value);
            setSelectedTextValue(props.value);
        }
    })

    // Close dropdown on outside click
    createEffect(() => {
        if (isOpen() && inputContainerRef && itemsWrapperRef) {
            const handleOutsideClick = (e: MouseEvent) => {
                const target = e.target as Node;
                if (
                    inputContainerRef &&
                    itemsWrapperRef &&
                    !inputContainerRef.contains(target) &&
                    !itemsWrapperRef.contains(target)
                ) {
                    setIsOpen(false);
                }
            };

            document.addEventListener("mousedown", handleOutsideClick);

            onCleanup(() => {
                document.removeEventListener("mousedown", handleOutsideClick);
            })
        }
    });

    // Assign class and animate position of the Portal's root element
    createEffect(() => {
        if (
            isOpen()
            && itemsWrapperRef
            && inputContainerRef
        ) {
            const rect = inputContainerRef.getBoundingClientRect();

            Object.assign(itemsWrapperRef.style, {
                width: `${rect.width}px`,
            });
        }
    });


    const contextValue: DropdownContextType<any> = {
        value: selected,
        onChange: (value: any) => {
            setSelected(value);
            props.onChange(value);
        },
        setSelectedTextValue: setSelectedTextValue,
        setIsOpen: setIsOpen
    };

    const DropdownItems: ParentComponent<{
        search: () => string,
        children: JSX.Element | JSX.Element[]
    }> = (p) => {
        const context = useContext(DropdownContext);
        if (!context) throw new Error("DropdownItems must be used inside Dropdown");

        const resolved = resolveChildren(() => p.children);
        const filtered = createMemo(() => {
            const query = p.search().toLowerCase();
            const resolvedValue = resolved();
            const items = Array.isArray(resolvedValue)
                ? resolvedValue.flat(Infinity)
                : resolvedValue
                    ? [resolvedValue]
                    : [];
            return items.filter((child) => child != null).filter((child) => {
                let searchStr = "";

                // If it's a DOM element, use its innerHTML.
                if (child instanceof Element) {
                    searchStr = child.innerHTML;
                }

                // If it's a virtual node (or an object with props), use its props.
                else if (child && typeof child === "object" && "props" in child) {
                    const childProps = (child as any).props;
                    searchStr =
                        childProps.searchValue ||
                        (typeof childProps.children === "string" ? childProps.children : "");
                }

                // Fallback if the child is a string.
                else if (typeof child === "string") {
                    searchStr = child;
                }

                return searchStr.toLowerCase().includes(query);
            });
        });

        return (
            <div class={css["items"]}>
                {filtered()}
            </div>
        );
    };

    // Chevron animation
    createEffect(() => {
        if (!chevron) return;

        const value = isOpen();

        if (value) {
            animate(chevron, av.elementsPoints.dropdownChevron.open, av.defaultAnimationType);
        } else {
            animate(chevron, av.elementsPoints.dropdownChevron.close, av.defaultAnimationType);
        }
    });

    return (
        <DropdownContext.Provider value={contextValue}>
            <div class={css["wrapper"]}>
                <div class={cssInput["wrapper"]}>
                    <div class={cssInput["container"]}>
                        {props.label && <p class={cssInput["label"]}>{props.label}</p>}
                        <div
                            class={css["input-container"]}
                            style={props.expand ? `width: 100%` : props.width ? `width: ${props.width}px` : ``}
                            ref={inputContainerRef}
                        >
                            <input
                                readOnly={props.typeable ? false : true}
                                type="text"
                                placeholder={selectedTextValue() || props.placeholder || ""}
                                class={cssInput["input"]}
                                value={selectedTextValue() || search()}
                                onInput={(e) => setSearch(e.currentTarget.value)}
                                onClick={() => setIsOpen(true)}
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") {
                                        setIsOpen(false);
                                        e.preventDefault();
                                    }
                                }}
                                classList={{ [cssInput["error"]]: props.error }}
                            />
                            <button
                                class={css["chevron"]}
                                onClick={() => setIsOpen(!isOpen())}
                            >
                                <ChevronIcon class={css["icon"]} ref={chevron} />
                            </button>
                        </div>
                        {props.hint && (
                            <p class={cssInput["hint"]} classList={{ [cssInput["error"]]: props.error }}>
                                {props.hint}
                            </p>
                        )}
                    </div>
                    <Show
                        when={props.actionChildren}
                    >
                        {props.actionChildren}
                    </Show>
                </div>
                <Show when={isOpen()}>
                    <div class={css["dropdown-area"]} ref={itemsWrapperRef}>
                        <DropdownItems search={search}>
                            {props.children}
                        </DropdownItems>
                    </div>
                </Show>
            </div>
        </DropdownContext.Provider>
    );
};

type DropdownItemProps<T> = {
    value: T,
    children: JSX.Element,
    searchValue?: string,
}

const DropdownItem = (props: DropdownItemProps<any>) => {
    const context = useContext(DropdownContext);
    if (!context) throw new Error("Dropdown.Item must be used inside Dropdown");

    const handleClick = () => {
        console.log(props.value);
        context.onChange(props.value);
        if (typeof props.children === "string") {
            context.setSelectedTextValue(props.children);
        }
    };

    console.log(context.value() + " == " + props.value);
    const isSelected = createMemo(() => context.value() === props.value);

    return (
        <div
            class={css.item}
            onClick={handleClick}
            classList={{ [css.selected]: isSelected() }}
            tabIndex={0} // Make element focusable
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    handleClick();
                    e.preventDefault();
                } else if (e.key === "Escape") {
                    context.setIsOpen(false);
                    e.preventDefault();
                }
            }}
        >
            {props.children}
            <CheckIcon />
        </div>
    );
};

type DropdownComponent = typeof Dropdown & { Item: typeof DropdownItem };
const DropdownWithItem = Dropdown as DropdownComponent;
DropdownWithItem.Item = DropdownItem;

export default DropdownWithItem;
