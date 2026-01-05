import { GameFeature, defineFeatureComponent } from "@/core/types/architecture";
import { UIOverlay } from "./ui/UIOverlay";

export const hudFeature: GameFeature = {
	key: "hud",
	components: [
		defineFeatureComponent({
			id: "hud-overlay",
			slot: "ui-overlay",
			Component: UIOverlay,
		}),
	],
};