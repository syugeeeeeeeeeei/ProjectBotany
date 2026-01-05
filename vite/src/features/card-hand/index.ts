import { GameFeature, defineFeatureComponent } from "@/core/types/architecture";
import Hand3D from "./ui/Hand3D";

export const cardHandFeature: GameFeature = {
	key: "card-hand",
	components: [
		defineFeatureComponent({
			id: "alien-hand",
			slot: "main-3d",
			Component: Hand3D,
			props: { player: "alien" }, // ここで型チェックが効きます
		}),
		defineFeatureComponent({
			id: "native-hand",
			slot: "main-3d",
			Component: Hand3D,
			props: { player: "native" },
		}),
	],
};