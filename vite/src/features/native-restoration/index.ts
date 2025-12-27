import { ActionRegistry } from "@/app/registry/ActionRegistry";
import { runNativeActivationPhase } from "./domain/nativeRestoration";

/**
 * 🌿 Native Restoration Feature Init
 */
export const initNativeRestoration = () => {
	ActionRegistry.register("NATIVE_RESTORATION", runNativeActivationPhase);
};

export * from "./domain/nativeRestoration";