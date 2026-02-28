// utils/window-spring-pinch.ts
import { animate, spring } from "motion";

const SPRING_FAST = {
	type: spring,
	stiffness: 900,
	damping: 60,
	duration: 0.14,
};
const SPRING_MED = {
	type: spring,
	stiffness: 420,
	damping: 28,
	duration: 0.36,
};
const SPRING_SLOW = {
	type: spring,
	stiffness: 260,
	damping: 22,
	duration: 0.42,
};

/** Вспомогалка: проценты transform-origin для target (viewport coords) */
function computeTransformOriginPercent(
	el: HTMLElement,
	targetX: number,
	targetY: number,
) {
	const r = el.getBoundingClientRect();
	const px = Math.max(0, Math.min(r.width, targetX - r.left));
	const py = Math.max(0, Math.min(r.height, targetY - r.top));
	const ox = (px / r.width) * 100;
	const oy = (py / r.height) * 100;
	return `${ox}% ${oy}%`;
}

/** dx,dy от центра элемента до target (viewport coords) */
function computeDeltaToTarget(
	el: HTMLElement,
	targetX: number,
	targetY: number,
) {
	const r = el.getBoundingClientRect();
	const centerX = r.left + r.width / 2;
	const centerY = r.top + r.height / 2;
	return { dx: targetX - centerX, dy: targetY - centerY };
}

/**
 * Полностью на spring: втягивание (hardcoded target)
 * - el: контейнер окна
 * - target: вьюпортные координаты цели (куда втягиваем)
 */
export async function runSpringHardcodedMinimize(
	el: HTMLElement,
	targetX = 220,
	targetY = (window.innerHeight ?? 900) - 48,
) {
	if (!el) return;
	const prevOrigin = el.style.transformOrigin;
	const origin = computeTransformOriginPercent(el, targetX, targetY);
	el.style.transformOrigin = origin;

	const { dx, dy } = computeDeltaToTarget(el, targetX, targetY);

	// Фаза 1 — быстрый пред-растяг (даёт ощущение натяжения ткани)
	const phase1 = animate(
		el,
		{
			scaleX: [1, 1.08],
			scaleY: [1, 0.92],
			skewX: ["0deg", "-6deg"],
			skewY: ["0deg", "3deg"],
		},
		SPRING_FAST,
	);

	await phase1; // делаем последовательно для читаемого эффекта

	// Фаза 2 — основное сжатие + смещение в точку + исчезновение
	// Используем более мягкий spring — он создаст естественный «всасывающий» эффект
	const phase2 = animate(
		el,
		{
			x: [0, dx],
			y: [0, dy],
			// сначала часть оставшегося stretch, затем резко сжимаем
			scaleX: [1.08, 0.04],
			scaleY: [0.92, 0.04],
			skewX: ["-6deg", "-16deg"],
			skewY: ["3deg", "10deg"],
			opacity: [1, 0],
		},
		SPRING_MED,
	);

	await phase2;

	// восстановим origin (опционально)
	el.style.transformOrigin = prevOrigin ?? "";
}

/**
 * Полностью на spring: восстановление (появление с пульсом)
 * - el: контейнер окна
 * - sourceX/Y: точка, откуда выходит окно (viewport coords)
 */
export async function runSpringHardcodedRestore(
	el: HTMLElement,
	sourceX = 220,
	sourceY = (window.innerHeight ?? 900) - 48,
) {
	if (!el) return;
	const prevOrigin = el.style.transformOrigin;
	const origin = computeTransformOriginPercent(el, sourceX, sourceY);
	el.style.transformOrigin = origin;

	const { dx, dy } = computeDeltaToTarget(el, sourceX, sourceY);

	// Фаза A — основной spring: из скрученного маленького состояния → 1
	// spring здесь настроен так, чтобы дать естественный overshoot (меньший damping)
	const phaseA = animate(
		el,
		{
			// двигаем от точки в место (dx->0)
			x: [dx, 0],
			y: [dy, 0],
			scaleX: [0.04, 1.12], // overshoot
			scaleY: [0.04, 0.92],
			opacity: [0, 1],
			skewX: ["-18deg", "-6deg"],
			skewY: ["10deg", "3deg"],
		},
		{ type: spring, stiffness: 420, damping: 20, duration: 0.44 }, // чуть меньше damping -> заметный overshoot
	);

	await phaseA;

	// Фаза B — мягкая посадка (успокоение): докинем короткий быстрый spring к точному 1.0
	const phaseB = animate(
		el,
		{
			scaleX: [1.12, 0.98, 1], // ОБРАТИТЕ ВНИМАНИЕ: spring поддерживает только 2 кадра,
			// поэтому мы делаем ПОСЛЕДОВАТЕЛЬНЫЕ анимации:
			// но здесь мы делаем две последовательных spring-операции ниже
		},
		SPRING_FAST,
	);

	// Для точной посадки: сначала уменьшить с overshoot до чуть меньше 1, затем в финал 1
	// (делаем две отдельные анимации, потому что spring принимает 2 keyframes)
	await animate(el, { scaleX: [1.12, 0.96] }, SPRING_FAST);
	await animate(
		el,
		{ scaleX: [0.96, 1] },
		{ type: spring, stiffness: 220, damping: 36, duration: 0.12 },
	);

	// то же для scaleY (мягкая стабилизация)
	await animate(el, { scaleY: [0.92, 0.99] }, SPRING_FAST);
	await animate(
		el,
		{ scaleY: [0.99, 1] },
		{ type: spring, stiffness: 220, damping: 36, duration: 0.12 },
	);

	// finish skew -> 0
	await animate(
		el,
		{ skewX: ["-6deg", "0deg"], skewY: ["3deg", "0deg"] },
		SPRING_FAST,
	);

	el.style.transformOrigin = prevOrigin ?? "";
}
