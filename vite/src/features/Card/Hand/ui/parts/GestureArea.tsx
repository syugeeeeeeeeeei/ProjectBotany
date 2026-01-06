// vite/src/features/card-hand/ui/parts/GestureArea.tsx
import React from "react";
import { Plane } from "@react-three/drei";
import { useGesture } from "@use-gesture/react";
import { useGameQuery } from "@/core/api/queries";
import { HandLayout } from "../../domain/HandLayout";

interface GestureAreaProps {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onClick?: () => void;
  facingFactor: number;
  enabled: boolean;
}

const GestureArea: React.FC<GestureAreaProps> = ({
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  onClick,
  facingFactor,
  enabled,
}) => {
  const { showGestureArea } = useGameQuery.ui.useDebugSettings();

  const bind = useGesture(
    {
      onDrag: ({
        movement: [mx, my],
        velocity: [vx, vy],
        direction: [dx, dy],
        last,
        tap,
        event,
      }) => {
        if (tap || !last) return;
        event.stopPropagation();

        const FLICK_DIST = 45;
        const FLICK_VEL = 0.5;

        // 1. 垂直スワイプの判定 (Show/Hide)
        if (
          Math.abs(my) > Math.abs(mx) &&
          Math.abs(my) > FLICK_DIST &&
          Math.abs(vy) > FLICK_VEL * 0.5
        ) {
          const isUp = dy * facingFactor < 0;
          if (isUp) onSwipeUp?.();
          else onSwipeDown?.();
          return;
        }

        // 2. 水平スワイプの判定 (Paging)
        if (
          Math.abs(mx) > Math.abs(my) &&
          Math.abs(mx) > FLICK_DIST &&
          Math.abs(vx) > FLICK_VEL
        ) {
          const isRight = dx * facingFactor > 0;
          if (isRight) onSwipeRight?.();
          else onSwipeLeft?.();
        }
      },
      onClick: ({ event }) => {
        event.stopPropagation();
        onClick?.();
      },
    },
    {
      enabled,
      drag: { filterTaps: true, threshold: 10 },
    },
  );

  const gesturePlaneArgs = HandLayout.calcGesturePlaneArgs(
    HandLayout.PAGE_WIDTH,
  );

  return (
    <Plane
      args={gesturePlaneArgs}
      rotation={[
        HandLayout.GESTURE.ROTATION.X,
        HandLayout.GESTURE.ROTATION.Y,
        HandLayout.GESTURE.ROTATION.Z,
      ]}
      position={[
        HandLayout.GESTURE.POSITION.X,
        HandLayout.GESTURE.POSITION.Y,
        HandLayout.GESTURE.POSITION.Z,
      ]}
      {...bind()}
    >
      <meshStandardMaterial
        transparent
        opacity={showGestureArea ? 0.3 : HandLayout.GESTURE.MATERIAL.OPACITY}
        color={showGestureArea ? "#ff00ff" : "white"}
        depthWrite={HandLayout.GESTURE.MATERIAL.DEPTH_WRITE}
      />
    </Plane>
  );
};

export default GestureArea;
