/* eslint-disable react-refresh/only-export-components */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";

// グローバルスタイルの適用 (簡易リセット)
const GlobalStyle = () => (
  <style>{`
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #000;
      font-family: 'MPLUS1p-Regular', sans-serif;
      user-select: none;
    }
    * {
      box-sizing: border-box;
    }
  `}</style>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GlobalStyle />
    <App />
  </React.StrictMode>,
);
