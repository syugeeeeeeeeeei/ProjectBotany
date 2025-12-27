import { ENABLED_FEATURES, FeatureKey } from "./config";
import { FEATURE_MANIFEST } from "./manifest";

/**
 * 🌿 プラグインローダー
 * * ENABLED_FEATURES に基づき、必要な機能のみをロード・初期化します。
 */
export const loadPlugins = async () => {
	console.group("🌿 Project Botany Plugin Loader");

	const tasks = Object.entries(ENABLED_FEATURES).map(async ([key, isEnabled]) => {
		const featureKey = key as FeatureKey;

		if (isEnabled) {
			const loadFunc = FEATURE_MANIFEST[featureKey];
			if (loadFunc) {
				await loadFunc();
				console.info(`✅ Logic-Merge: ${featureKey}`);
			}
		} else {
			console.warn(`🚫 Logic-Purge: ${featureKey}`);
		}
	});

	await Promise.all(tasks);
	console.groupEnd();
};