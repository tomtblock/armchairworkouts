"use client";

// Anime.js v4 utilities for React/Next.js
// Documentation: https://animejs.com/

import {
	animate,
	createTimeline,
	stagger,
	createSpring,
	createDraggable,
	utils,
} from "animejs";

// Re-export all anime.js functions for easy importing
export { animate, createTimeline, stagger, createSpring, createDraggable, utils };

// Type definitions for common animation options
export interface AnimeAnimationOptions {
	duration?: number;
	delay?: number | ((el: Element, index: number) => number);
	ease?: string;
	loop?: boolean | number;
	autoplay?: boolean;
	direction?: "normal" | "reverse" | "alternate";
}

// Common easing functions available in anime.js v4
export const easings = {
	// Basic
	linear: "linear",
	// Quad
	inQuad: "inQuad",
	outQuad: "outQuad",
	inOutQuad: "inOutQuad",
	// Cubic
	inCubic: "inCubic",
	outCubic: "outCubic",
	inOutCubic: "inOutCubic",
	// Quart
	inQuart: "inQuart",
	outQuart: "outQuart",
	inOutQuart: "inOutQuart",
	// Expo
	inExpo: "inExpo",
	outExpo: "outExpo",
	inOutExpo: "inOutExpo",
	// Back
	inBack: "inBack",
	outBack: "outBack",
	inOutBack: "inOutBack",
	// Elastic
	inElastic: "inElastic",
	outElastic: "outElastic",
	inOutElastic: "inOutElastic",
	// Bounce
	inBounce: "inBounce",
	outBounce: "outBounce",
	inOutBounce: "inOutBounce",
};

// ============================================
// ARMCHAIR WORKOUTS - SPECIFIC ANIMATIONS
// ============================================

// Cyberpunk neon colors
export const neonColors = {
	cyan: "#00FFFF",
	green: "#00FF00",
	magenta: "#FF00FF",
	yellow: "#FFFF00",
	orange: "#FF6600",
	red: "#FF0044",
};

// 1. SLOT MACHINE REEL SPIN - Main workout randomizer animation
export function animateSlotReelSpin(element: Element | string, duration = 800) {
	return animate(element, {
		rotateX: [0, 1080], // 3 full rotations
		scale: [1, 0.95, 1.02, 1],
		duration,
		ease: "outExpo",
	});
}

// 2. WORKOUT RESULT REVEAL - When a workout is generated
export function animateWorkoutReveal(element: Element | string) {
	return createTimeline()
		.add(element, {
			scale: [0, 1.1, 1],
			opacity: [0, 1],
			rotateY: [-90, 0],
			duration: 500,
			ease: "outBack",
		})
		.add(element, {
			filter: ["brightness(2)", "brightness(1)"],
			duration: 300,
		}, "-=200");
}

// 3. NEON GLOW PULSE - For buttons and interactive elements
export function animateNeonPulse(element: Element | string, color = neonColors.cyan) {
	return animate(element, {
		boxShadow: [
			`0 0 5px ${color}, 0 0 10px ${color}, 0 0 15px ${color}`,
			`0 0 10px ${color}, 0 0 25px ${color}, 0 0 40px ${color}`,
			`0 0 5px ${color}, 0 0 10px ${color}, 0 0 15px ${color}`,
		],
		duration: 1500,
		ease: "inOutSine",
		loop: true,
	});
}

// 4. ACTIVATE BUTTON PRESS - Satisfying button feedback
export function animateButtonPress(element: Element | string) {
	return createTimeline()
		.add(element, {
			scale: [1, 0.92],
			duration: 80,
			ease: "inQuad",
		})
		.add(element, {
			scale: [0.92, 1.05, 1],
			duration: 200,
			ease: "outBack",
		});
}

// 5. SUCCESS CELEBRATION - When workout is saved
export function animateSuccess(element: Element | string) {
	return createTimeline()
		.add(element, {
			scale: [1, 1.2, 1],
			rotate: [0, -5, 5, 0],
			duration: 400,
			ease: "outElastic",
		})
		.add(element, {
			filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"],
			duration: 300,
		}, "-=200");
}

// 6. ERROR SHAKE - For failed actions
export function animateError(element: Element | string) {
	return animate(element, {
		translateX: [0, -10, 10, -10, 10, -5, 5, 0],
		duration: 500,
		ease: "inOutQuad",
	});
}

// 7. COUNTER INCREMENT - For spin count, sets, etc.
export function animateCounterChange(element: Element | string, direction: "up" | "down" = "up") {
	const yOffset = direction === "up" ? -20 : 20;
	return animate(element, {
		translateY: [yOffset, 0],
		opacity: [0, 1],
		scale: [0.8, 1],
		duration: 200,
		ease: "outQuad",
	});
}

// 8. STAGGERED CARDS ENTRANCE - For workout history cards
export function animateCardsEntrance(selector: string) {
	return animate(selector, {
		opacity: [0, 1],
		translateY: [40, 0],
		scale: [0.9, 1],
		delay: stagger(80, { from: "first" }),
		duration: 500,
		ease: "outExpo",
	});
}

// 9. MODAL ENTRANCE - For upgrade modal and others
export function animateModalEntrance(backdrop: Element | string, modal: Element | string) {
	return createTimeline()
		.add(backdrop, {
			opacity: [0, 1],
			duration: 200,
		})
		.add(modal, {
			scale: [0.8, 1],
			opacity: [0, 1],
			translateY: [30, 0],
			duration: 400,
			ease: "outBack",
		}, "-=100");
}

// 10. MODAL EXIT - Smooth close
export function animateModalExit(backdrop: Element | string, modal: Element | string) {
	return createTimeline()
		.add(modal, {
			scale: [1, 0.9],
			opacity: [1, 0],
			translateY: [0, 20],
			duration: 200,
			ease: "inQuad",
		})
		.add(backdrop, {
			opacity: [1, 0],
			duration: 150,
		}, "-=100");
}

// 11. GLITCH TEXT EFFECT - For cyberpunk titles
export function animateGlitch(element: Element | string) {
	return createTimeline({ loop: true })
		.add(element, {
			translateX: [0, -3, 3, -2, 2, 0],
			duration: 150,
		})
		.add(element, {
			opacity: [1, 0.7, 1, 0.8, 1],
			duration: 100,
		}, "<")
		.add(element, {
			filter: ["hue-rotate(0deg)", "hue-rotate(20deg)", "hue-rotate(-20deg)", "hue-rotate(0deg)"],
			duration: 100,
		}, "<")
		.add(element, {
			duration: 2000, // Pause between glitches
		});
}

// 12. SCANNING LINE - Terminal/CRT effect
export function animateScanline(element: Element | string) {
	return animate(element, {
		translateY: ["-100%", "100%"],
		duration: 3000,
		ease: "linear",
		loop: true,
	});
}

// 13. TYPING EFFECT - For terminal-style text
export function animateTyping(element: HTMLElement, text: string, speed = 50) {
	element.textContent = "";
	let index = 0;
	
	const timeline = createTimeline();
	
	for (let i = 0; i < text.length; i++) {
		timeline.add({}, {
			duration: speed,
			onComplete: () => {
				element.textContent = text.substring(0, ++index);
			}
		});
	}
	
	return timeline;
}

// 14. SPIN LEVER PULL - For the activate lever
export function animateLeverPull(element: Element | string) {
	return createTimeline()
		.add(element, {
			rotate: [0, 45],
			duration: 150,
			ease: "inQuad",
		})
		.add(element, {
			rotate: [45, 0],
			duration: 400,
			ease: "outBounce",
		});
}

// 15. BREATHING GLOW - Subtle ambient animation
export function animateBreathingGlow(element: Element | string, color = neonColors.cyan) {
	return animate(element, {
		boxShadow: [
			`0 0 5px ${color}40, inset 0 0 10px ${color}20`,
			`0 0 15px ${color}60, inset 0 0 20px ${color}30`,
			`0 0 5px ${color}40, inset 0 0 10px ${color}20`,
		],
		duration: 2500,
		ease: "inOutSine",
		loop: true,
	});
}

// 16. UPGRADE BADGE PULSE - Draw attention to upgrade button
export function animateUpgradeBadge(element: Element | string) {
	return animate(element, {
		scale: [1, 1.08, 1],
		boxShadow: [
			"0 0 10px #00FFFF, 0 0 20px #00FFFF",
			"0 0 20px #00FFFF, 0 0 40px #00FFFF, 0 0 60px #00FFFF",
			"0 0 10px #00FFFF, 0 0 20px #00FFFF",
		],
		duration: 1200,
		ease: "inOutSine",
		loop: true,
	});
}

// 17. NUMBER SPINNER - For set/volume controls
export function animateNumberSpin(element: Element | string, direction: "up" | "down") {
	const y = direction === "up" ? -30 : 30;
	return animate(element, {
		translateY: [y, 0],
		opacity: [0, 1],
		duration: 150,
		ease: "outQuad",
	});
}

// 18. REEL STOP BOUNCE - When slot reel stops
export function animateReelStop(element: Element | string) {
	return animate(element, {
		translateY: [10, -5, 3, -2, 0],
		duration: 400,
		ease: "outQuad",
	});
}

// 19. CATEGORY CHIP SELECT - For workout category selection
export function animateCategorySelect(element: Element | string, selected: boolean) {
	if (selected) {
		return animate(element, {
			scale: [1, 1.1, 1],
			duration: 200,
			ease: "outBack",
		});
	}
	return animate(element, {
		scale: [1, 0.95, 1],
		duration: 150,
		ease: "outQuad",
	});
}

// 20. PAGE TRANSITION - For navigating between views
export function animatePageIn(element: Element | string) {
	return animate(element, {
		opacity: [0, 1],
		translateX: [50, 0],
		duration: 400,
		ease: "outExpo",
	});
}

export function animatePageOut(element: Element | string) {
	return animate(element, {
		opacity: [1, 0],
		translateX: [0, -50],
		duration: 300,
		ease: "inExpo",
	});
}

// ============================================
// LEGACY HELPERS (kept for compatibility)
// ============================================

export function createPulse(selector: string, options?: AnimeAnimationOptions) {
	return animate(selector, {
		scale: [1, 1.1, 1],
		duration: options?.duration || 600,
		ease: options?.ease || "inOutQuad",
		loop: options?.loop ?? true,
	});
}

export function createShake(selector: string, options?: AnimeAnimationOptions) {
	return animate(selector, {
		translateX: [0, -10, 10, -10, 10, 0],
		duration: options?.duration || 500,
		ease: options?.ease || "inOutQuad",
	});
}

export function createFadeIn(selector: string, options?: AnimeAnimationOptions) {
	return animate(selector, {
		opacity: [0, 1],
		translateY: [20, 0],
		duration: options?.duration || 500,
		delay: options?.delay || 0,
		ease: options?.ease || "outQuad",
	});
}

export function createFadeOut(selector: string, options?: AnimeAnimationOptions) {
	return animate(selector, {
		opacity: [1, 0],
		translateY: [0, -20],
		duration: options?.duration || 500,
		delay: options?.delay || 0,
		ease: options?.ease || "inQuad",
	});
}

export function createStaggeredEntrance(selector: string, options?: AnimeAnimationOptions & { from?: string | number }) {
	return animate(selector, {
		opacity: [0, 1],
		translateY: [30, 0],
		scale: [0.9, 1],
		delay: stagger(100, { from: options?.from || "first" }),
		duration: options?.duration || 600,
		ease: options?.ease || "outExpo",
	});
}

