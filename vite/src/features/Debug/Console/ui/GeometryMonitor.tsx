import React, { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export const GeometryMonitor: React.FC = () => {
  const { scene, gl } = useThree();
  const intervalRef = useRef<number>(1000);
  const lastCounts = useRef<Record<string, number>>({});

  useEffect(() => {
    // 1秒ごとにチェック
    intervalRef.current = window.setInterval(() => {
      // 1. レンダラーが管理しているジオメトリの総数を表示
      const totalGeometries = gl.info.memory.geometries;

      // 2. シーンをトラバースして、現在使われているジオメトリの内訳を集計
      const currentCounts: Record<string, number> = {};
      const seenUUIDs = new Set<string>();

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.geometry) {
          // 同じジオメトリを共有しているMeshは重複カウントしない（UUIDで判定）
          if (!seenUUIDs.has(object.geometry.uuid)) {
            seenUUIDs.add(object.geometry.uuid);
            const type = object.geometry.type;
            currentCounts[type] = (currentCounts[type] || 0) + 1;
          }
        }
      });

      // 3. 差分検知
      let hasChange = false;
      const changes: string[] = [];
      const allTypes = new Set([
        ...Object.keys(currentCounts),
        ...Object.keys(lastCounts.current),
      ]);

      allTypes.forEach((type) => {
        const curr = currentCounts[type] || 0;
        const prev = lastCounts.current[type] || 0;
        const diff = curr - prev;

        if (diff !== 0) {
          hasChange = true;
          const sign = diff > 0 ? "+" : "";
          changes.push(`${type}: ${prev} -> ${curr} (${sign}${diff})`);
        }
      });

      if (hasChange) {
        console.groupCollapsed(`📊 Geometry Diff (Total: ${totalGeometries})`);
        changes.forEach((log) => {
          if (log.includes("+"))
            console.log(`%c${log}`, "color: red"); // 増加は赤
          else console.log(`%c${log}`, "color: green"); // 減少は緑
        });
        console.groupEnd();
      }

      lastCounts.current = currentCounts;
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [scene, gl]);

  return null;
};
