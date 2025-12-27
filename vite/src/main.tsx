import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { initMoveAlien } from "./features/move-alien";
import { initPlayCard } from "./features/play-card";
import { initTurnSystem } from "./features/turn-system";

// --- 機能の初期化とレジストリ登録 ---
initMoveAlien();
initPlayCard();
initTurnSystem();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
