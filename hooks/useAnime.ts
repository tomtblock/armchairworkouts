"use client";

import { useRef, useEffect, useCallback } from "react";
import {
	animate,
	animateButtonPress,
	animateSuccess,
	animateError,
	animateNeonPulse,
	animateWorkoutReveal,
	animateCardsEntrance,
	animateUpgradeBadge,
	animateGlitch,
	animateBreathingGlow,
	animateCounterChange,
	animateSlotReelSpin,
	animateReelStop,
	neonColors,
} from "@/lib/anime";

// Hook for animating on mount
export function useAnimateOnMount(
	animationFn: (el: Element) => any,
	deps: any[] = []
) {
	const ref = useRef<HTMLElement>(null);

	useEffect(() => {
		if (ref.current) {
			animationFn(ref.current);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);

	return ref;
}

// Hook for button press animation
export function useButtonAnimation() {
	const ref = useRef<HTMLButtonElement>(null);

	const triggerPress = useCallback(() => {
		if (ref.current) {
			animateButtonPress(ref.current);
		}
	}, []);

	return { ref, triggerPress };
}

// Hook for success animation
export function useSuccessAnimation() {
	const ref = useRef<HTMLElement>(null);

	const triggerSuccess = useCallback(() => {
		if (ref.current) {
			animateSuccess(ref.current);
		}
	}, []);

	return { ref, triggerSuccess };
}

// Hook for error/shake animation
export function useErrorAnimation() {
	const ref = useRef<HTMLElement>(null);

	const triggerError = useCallback(() => {
		if (ref.current) {
			animateError(ref.current);
		}
	}, []);

	return { ref, triggerError };
}

// Hook for neon glow effect
export function useNeonGlow(color = neonColors.cyan, autoStart = true) {
	const ref = useRef<HTMLElement>(null);
	const animationRef = useRef<any>(null);

	useEffect(() => {
		if (ref.current && autoStart) {
			animationRef.current = animateNeonPulse(ref.current, color);
		}
		return () => {
			if (animationRef.current?.pause) {
				animationRef.current.pause();
			}
		};
	}, [color, autoStart]);

	const start = useCallback(() => {
		if (ref.current) {
			animationRef.current = animateNeonPulse(ref.current, color);
		}
	}, [color]);

	const stop = useCallback(() => {
		if (animationRef.current?.pause) {
			animationRef.current.pause();
		}
	}, []);

	return { ref, start, stop };
}

// Hook for breathing glow ambient effect
export function useBreathingGlow(color = neonColors.cyan) {
	const ref = useRef<HTMLElement>(null);

	useEffect(() => {
		if (ref.current) {
			const animation = animateBreathingGlow(ref.current, color);
			return () => {
				if (animation?.pause) animation.pause();
			};
		}
	}, [color]);

	return ref;
}

// Hook for workout reveal animation
export function useWorkoutReveal() {
	const ref = useRef<HTMLElement>(null);

	const triggerReveal = useCallback(() => {
		if (ref.current) {
			animateWorkoutReveal(ref.current);
		}
	}, []);

	return { ref, triggerReveal };
}

// Hook for staggered cards animation
export function useCardsEntrance(selector: string, trigger: boolean) {
	useEffect(() => {
		if (trigger) {
			animateCardsEntrance(selector);
		}
	}, [trigger, selector]);
}

// Hook for upgrade badge attention animation
export function useUpgradeBadge() {
	const ref = useRef<HTMLElement>(null);

	useEffect(() => {
		if (ref.current) {
			const animation = animateUpgradeBadge(ref.current);
			return () => {
				if (animation?.pause) animation.pause();
			};
		}
	}, []);

	return ref;
}

// Hook for glitch text effect
export function useGlitchText() {
	const ref = useRef<HTMLElement>(null);

	useEffect(() => {
		if (ref.current) {
			const animation = animateGlitch(ref.current);
			return () => {
				if (animation?.pause) animation.pause();
			};
		}
	}, []);

	return ref;
}

// Hook for counter/number changes
export function useCounterAnimation() {
	const ref = useRef<HTMLElement>(null);

	const animateUp = useCallback(() => {
		if (ref.current) {
			animateCounterChange(ref.current, "up");
		}
	}, []);

	const animateDown = useCallback(() => {
		if (ref.current) {
			animateCounterChange(ref.current, "down");
		}
	}, []);

	return { ref, animateUp, animateDown };
}

// Hook for slot reel spinning
export function useSlotReel() {
	const ref = useRef<HTMLElement>(null);

	const spin = useCallback((duration = 800) => {
		if (ref.current) {
			return animateSlotReelSpin(ref.current, duration);
		}
	}, []);

	const stop = useCallback(() => {
		if (ref.current) {
			return animateReelStop(ref.current);
		}
	}, []);

	return { ref, spin, stop };
}

// Hook for custom animation
export function useCustomAnimation<T extends HTMLElement = HTMLElement>() {
	const ref = useRef<T>(null);

	const runAnimation = useCallback((options: Parameters<typeof animate>[1]) => {
		if (ref.current) {
			return animate(ref.current, options);
		}
	}, []);

	return { ref, runAnimation };
}

// Export all color constants
export { neonColors };

