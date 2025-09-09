import { createSignal, createEffect, Show, onMount, onCleanup } from 'solid-js';
import type { JSX } from 'solid-js';
import css from './spinner.module.less';
import { animate, spring } from 'motion';
import { animationValues as av } from '../definitions';
import { DoneIcon } from 'components/Icons/check-circle';
import { CheckIcon } from 'components/Icons/check';
import { XIcon } from 'components/Icons/x';

type SpinnerProps = {
    linear?: boolean; // Determines animation timing (linear vs ease) for indeterminate state
    forceIndeterminate?: boolean;
    style?: string | JSX.CSSProperties; // Custom styles for the root element
    spinnerColor?: string; // Color of the progress arc/rotating arc
    spinnerColorBG?: string; // Color of the background track circle
    size?: number | string; // Diameter of the spinner
    thickness?: number | string; // Stroke width of the circles
    value?: number; // Current progress value (0 to maxValue)
    maxValue?: number; // Maximum progress value
    reverseValue?: boolean,
    showValueText?: boolean; // Whether to display the percentage text
    class?: string; // Custom CSS class for the root element
    ref?: HTMLDivElement;
    completed?: boolean,
}

export const Spinner = (props: SpinnerProps) => {
    const DEFAULT_SIZE = 40; // Increased default size for better visibility
    const DEFAULT_THICKNESS = 4;
    const DEFAULT_MAX_VALUE = 100;
    const DEFAULT_COLOR = '#3498db'; // Default blue color
    const DEFAULT_BG_COLOR = '#e0e0e0'; // Default background color
    const DEFAULT_DONE_ANIM_DUR = 0.5;

    // --- Signals for reactive updates ---
    const [enableSpin, setEnableSpin] = createSignal<boolean>(props.forceIndeterminate || true);
    const [size, setSize] = createSignal<number>(DEFAULT_SIZE);
    const [thickness, setThickness] = createSignal<number>(DEFAULT_THICKNESS);
    const [value, setValue] = createSignal<number | undefined>(undefined);
    const [maxValue, setMaxValue] = createSignal<number>(DEFAULT_MAX_VALUE);
    const [isCompleting, setIsCompleting] = createSignal<boolean>(false);

    // --- References to DOM elements ---
    let progressCircle: SVGCircleElement | undefined;
    let checkmarkDoneContainer: HTMLDivElement | undefined;

    // --- Effects to update signals when props change ---
    createEffect(() => {
        const newSize = typeof props.size === 'number' ? props.size : DEFAULT_SIZE;
        setSize(newSize);
    });

    createEffect(() => {
        // Calculate thickness relative to size if not explicitly provided
        const newThickness = typeof props.thickness === 'number'
            ? props.thickness
            : (size() / DEFAULT_SIZE) * DEFAULT_THICKNESS;
        setThickness(Math.max(1, newThickness)); // Ensure thickness is at least 1
    });

    createEffect(() => {
        setValue(props.value); // Can be undefined
    });

    createEffect(() => {
        setMaxValue(props.maxValue !== undefined ? props.maxValue : DEFAULT_MAX_VALUE);
    });

    createEffect(() => {
        if (props.completed) {
            if (isIndeterminate() || value() !== maxValue()) {
                setIsCompleting(true);

                setTimeout(() => {
                    setEnableSpin(false);
                }, DEFAULT_DONE_ANIM_DUR * 1000);
            } else {
                setEnableSpin(false);
            }
        } else if (!props.completed) {
            if (isCompleting() === true && checkmarkDoneContainer) {
                animate(
                    checkmarkDoneContainer,
                    { opacity: [1, 0] },
                    av.defaultAnimationType
                ).then(() => {
                    setIsCompleting(false);
                    setValue(props.value);
                    setEnableSpin(true);
                })
            } else {
                setIsCompleting(false);
                setValue(props.value);
                setEnableSpin(true);
            }
        }
    })

    // --- Derived computations ---

    // Check if the spinner should be in indeterminate (loading) state
    const isIndeterminate = () => value() === undefined || props.forceIndeterminate;

    // SVG circle calculations
    const radius = () => size() / 2 - thickness() / 2; // Radius adjusted for stroke width
    const circumference = () => 2 * Math.PI * radius();

    // Calculate stroke-dashoffset for progress display
    const strokeDashoffset = () => {
        if (isIndeterminate()) return undefined;

        const progress = Math.min(1, Math.max(0, value()! / maxValue()));
        // вот здесь переключаем заполнение на “отполнение”
        const normalized = props.reverseValue ? progress : 1 - progress;
        return circumference() * normalized;
    };

    // Determine stroke-dasharray
    const strokeDasharray = () => {
        // For progress display, dasharray is just the circumference
        // For indeterminate, it's set in CSS to create the gap
        return isIndeterminate() ? undefined : circumference();
    };

    // Styles for the SVG element
    const svgStyle = () => {
        const baseStyle: JSX.CSSProperties = {
            width: `${size()}px`,
            height: `${size()}px`,
            // Pass circumference for CSS animations if needed
            '--spinner-circumference': `${circumference()}px`,
            '--spinner-thickness': `${thickness()}px`,
            '--spinner-done-anim-dur': `${DEFAULT_DONE_ANIM_DUR}s`
        };
        // Combine with user-provided style object or string
        if (typeof props.style === 'string') {
            // Cannot reliably merge string styles, prefer object style
            console.warn("Spinner: String style prop is less flexible. Consider using CSSProperties object.");
            return baseStyle; // Return base style, user string style applied to root div
        }
        return { ...baseStyle, ...props.style };
    };

    function calcCenterTransform(iconSize: number, containerSize: number) {
        const scale = containerSize / iconSize;
        // После масштабирования диагональ iconSize * scale == containerSize,
        // поэтому translate может быть нулевым. Но на всякий случай:
        const dx = (containerSize - iconSize * scale) / 2 / scale;
        const dy = dx;
        return `translate(${dx.toFixed(2)}, ${dy.toFixed(2)}) scale(${scale.toFixed(4)})`;
    }

    const checkmarkContainerStyle = () => {
        return {
            width: `${size()}px`,
            height: `${size()}px`,
            'position': 'absolute',
            'top': '50%',
            'left': '50%',
            'transform': 'translate(-50%, -50%)',
        }
    }

    // Styles for the checkmark
    const checkmarkStyle = () => {
        return {
            width: `${size()}px`,
            height: `${size()}px`,
        };
    };

    const iconButtonSize = size() - 10;
    const iconButtonContainerStyle = () => {
        return {
            width: `${iconButtonSize}px`,
            height: `${iconButtonSize}px`,
            'position': 'absolute',
            'top': '50%',
            'left': '50%',
            'transform': 'translate(-50%, -50%)',
        }
    }

    // Styles for the checkmark
    const iconButtonStyle = () => {
        return {
            width: `${iconButtonSize}px`,
            height: `${iconButtonSize}px`,
        };
    };

    // Styles for the text percentage display
    const textStyle = () => {
        const fontSize = Math.max(8, Math.min(size() / 3.5, 24)); // Adaptive font size
        return {
            'position': 'absolute',
            'top': '50%',
            'left': '50%',
            'transform': 'translate(-50%, -50%)',
            'font-size': `${fontSize}px`,
            'font-weight': 'bold',
            'color': props.spinnerColor || DEFAULT_COLOR,
            'line-height': '1', // Prevent potential line-height issues
        };
    };

    // --- Warning logic ---
    createEffect(() => {
        if (props.showValueText && isIndeterminate()) {
            console.warn("Spinner: 'showValueText' is true, but 'value' is not provided. Text will not be displayed.");
        }
    });

    // --- Render ---
    return (
        <div
            ref={props.ref}
            class={`${css.SpinnerContainer} ${props.class || ''}`}
            // Apply string style here if provided, otherwise handled by svgStyle
            style={typeof props.style === 'string' ? props.style : undefined}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={maxValue()}
            aria-valuenow={isIndeterminate() ? undefined : value()}
        >
            <svg
                class={css.SpinnerSvg}
                style={svgStyle()}
                viewBox={`0 0 ${size()} ${size()}`}
                // Conditionally apply animation classes
                classList={{
                    [css.indeterminateAnimation]: isIndeterminate() && enableSpin(),
                    [css.linearAnimation]: isIndeterminate() && props.linear && enableSpin(),
                    [css.easeAnimation]: isIndeterminate() && !props.linear && enableSpin(),
                    [css.done]: isCompleting() && enableSpin(),
                    [css.reverse]: !!props.reverseValue
                }}
            >
                {/* Background Track Circle */}
                <circle
                    class={css.backgroundCircle}
                    cx={size() / 2}
                    cy={size() / 2}
                    r={radius()}
                    stroke={props.spinnerColorBG || DEFAULT_BG_COLOR}
                    // stroke={props.reverseValue ? (props.spinnerColor || DEFAULT_COLOR) : (props.spinnerColorBG || DEFAULT_BG_COLOR)}
                    stroke-width={thickness()}
                    fill="none"
                />
                {/* Progress/Indicator Circle */}
                <circle
                    ref={progressCircle}
                    class={css.progressCircle}
                    cx={size() / 2}
                    cy={size() / 2}
                    r={radius()}
                    stroke={props.spinnerColor || DEFAULT_COLOR}
                    // stroke={props.reverseValue ? (props.spinnerColorBG || DEFAULT_BG_COLOR) : (props.spinnerColor || DEFAULT_COLOR)}
                    stroke-width={thickness()}
                    fill="none"
                    stroke-linecap="round" // Makes the ends of the arc rounded
                    // Dynamic styles for progress
                    stroke-dasharray={strokeDasharray()} // Circumference for progress, CSS var for indeterminate
                    stroke-dashoffset={strokeDashoffset()} // Calculated offset for progress
                />
            </svg>

            <Show
                when={isCompleting() && !props.showValueText}
            >
                <div
                    ref={checkmarkDoneContainer}
                    style={checkmarkContainerStyle()}
                    class={css["checkmark-container"]}
                >
                    <svg
                        class={css["checkmarkDone"]}
                        style={checkmarkStyle()}
                        viewBox={`0 0 ${size()} ${size()}`}
                        preserveAspectRatio="xMidYMid meet"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <g transform={calcCenterTransform(24, size())}>
                            <path
                                d="M7.5 12L10.5 15L16.5 9"
                                stroke={props.spinnerColor || DEFAULT_COLOR}
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </g>
                    </svg>
                </div>
            </Show>
            {/* Value Text */}
            <Show when={props.showValueText && !isIndeterminate()}>
                <div class={css.valueText} style={textStyle()}>
                    {`${Math.round((value()! / maxValue()) * 100)}%`}
                </div>
            </Show>
        </div>
    );
};
