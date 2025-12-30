import { initPlayCardLogic } from "./logic";
export const playCardFeature = {
	key: "play-card",
	init: initPlayCardLogic // App.tsxなどで呼ぶ用
};
export { initPlayCardLogic };