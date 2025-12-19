import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: #50342b;
    overscroll-behavior: none;
    font-family: 'MPLUS1p', sans-serif;
  }
  #root { width: 100%; height: 100%; }
  body { user-select: none; -webkit-user-select: none; }
`;