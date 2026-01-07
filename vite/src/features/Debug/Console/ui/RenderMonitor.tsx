import React, { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";

/**
 * Three.jsのレンダリング情報を画面に表示するコンポーネント
 * ※ <Canvas> の内部に配置する必要があります
 */
export const RenderMonitor: React.FC = () => {
  const gl = useThree((state) => state.gl);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // DOM要素を作成して body に直接追加する
    // (HtmlコンポーネントのContext依存問題を回避するため)
    const div = document.createElement("div");
    div.style.cssText = `
      position: absolute;
      top: 60px; /* Statsの下あたり */
      left: 0px;
      background: rgba(0, 0, 0, 0.7);
      color: #00ff00;
      padding: 8px;
      font-family: monospace;
      font-size: 12px;
      pointer-events: none;
      z-index: 9999;
      min-width: 120px;
    `;
    document.body.appendChild(div);
    containerRef.current = div;

    // 正確な計測のために autoReset をオフにする
    const originalAutoReset = gl.info.autoReset;
    gl.info.autoReset = false;

    return () => {
      // クリーンアップ
      if (div.parentNode) {
        div.parentNode.removeChild(div);
      }
      gl.info.autoReset = originalAutoReset;
    };
  }, [gl]);

  useFrame(() => {
    if (!containerRef.current) return;

    const { render, memory } = gl.info;

    // 前フレームの統計を表示
    containerRef.current.innerHTML = `
      <div style="font-weight:bold; margin-bottom:4px">Render Stats</div>
      <div>Calls: ${render.calls}</div>
      <div>Triangles: ${render.triangles}</div>
      <div>Points: ${render.points}</div>
      <div>Lines: ${render.lines}</div>
      <div style="margin-top:4px; border-top:1px solid #555; paddingTop:2px">
        Geometries: ${memory.geometries}
      </div>
      <div>Textures: ${memory.textures}</div>
    `;

    // 計測リセット
    gl.info.reset();
  });

  return null; // R3Fツリーには何も描画しない
};
