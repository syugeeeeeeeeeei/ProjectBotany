/* eslint-disable react-refresh/only-export-components */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";

const GlobalStyle = () => (
  <style>{`
    body, html {
      margin: 0;
      padding: 0;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background-color: #000;
      font-family: 'MPLUS1p-Regular', sans-serif;
      -webkit-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;

      /* ✨ 追加: ブラウザによる自動のズームやスクロールなどのジェスチャーを無効化 */
      touch-action: none;
    }
    * {
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }
  `}</style>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GlobalStyle />
    <App />
  </React.StrictMode>,
);
