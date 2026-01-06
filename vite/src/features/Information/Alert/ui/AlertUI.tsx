import React from "react";
import styled, { keyframes } from "styled-components";
import { useUIStore, NotificationItem } from "@/core/store/uiStore";
import { AlertSystem } from "@/core/systems/AlertSystem";

const slideIn = keyframes`
  from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
  to { transform: translateX(-50%) translateY(0); opacity: 1; }
`;

const AlertContainer = styled.div`
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000; /* 最前面 */
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
  width: 80%;
  max-width: 400px;
`;

const Toast = styled.div<{ $type: NotificationItem["type"] }>`
  pointer-events: auto;
  background: ${({ $type }) => {
    switch ($type) {
      case "error":
        return "rgba(211, 47, 47, 0.9)";
      case "success":
        return "rgba(56, 142, 60, 0.9)";
      case "info":
        return "rgba(33, 33, 33, 0.9)";
      case "system":
        return "rgba(2, 119, 189, 0.9)";
      default:
        return "rgba(0, 0, 0, 0.8)";
    }
  }};
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-family: sans-serif;
  font-weight: bold;
  font-size: 14px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  cursor: pointer;
  animation: ${slideIn} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    opacity: 0.8;
  }
`;

const AlertItem: React.FC<{ item: NotificationItem }> = ({ item }) => {
  return (
    <Toast $type={item.type} onClick={() => AlertSystem.remove(item.id)}>
      {item.player && (
        <span
          style={{
            opacity: 0.7,
            fontSize: "0.8em",
            marginRight: "8px",
            textTransform: "uppercase",
          }}
        >
          [{item.player}]
        </span>
      )}
      {item.message}
    </Toast>
  );
};

export const AlertUI: React.FC = () => {
  const notifications = useUIStore((s) => s.notifications);

  return (
    <AlertContainer>
      {notifications.map((item) => (
        <AlertItem key={item.id} item={item} />
      ))}
    </AlertContainer>
  );
};
