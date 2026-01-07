// vite/src/features/debug-console/ui/OnScreenConsole.tsx
import { generateId } from "@/shared/utils/id";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

// --- Types ---

type LogLevel = "log" | "error" | "warn" | "info" | "debug";
type ConsoleMethod = (...args: unknown[]) => void;

interface LogData {
  id: string;
  type: LogLevel;
  message: string;
  time: string;
}

// --- Styles ---

const ConsoleContainer = styled.div<{ $isEmbedded?: boolean }>`
  position: ${(props) => (props.$isEmbedded ? "relative" : "fixed")};
  bottom: ${(props) => (props.$isEmbedded ? "0" : "10px")};
  left: ${(props) => (props.$isEmbedded ? "0" : "10px")};
  width: ${(props) => (props.$isEmbedded ? "100%" : "calc(100% - 20px)")};
  max-width: ${(props) => (props.$isEmbedded ? "none" : "600px")};
  height: ${(props) => (props.$isEmbedded ? "100%" : "300px")};
  background-color: ${(props) =>
    props.$isEmbedded ? "transparent" : "rgba(20, 20, 20, 0.92)"};
  color: #0f0;
  font-family: "Menlo", "Monaco", "Courier New", monospace;
  border: ${(props) => (props.$isEmbedded ? "none" : "1px solid #444")};
  border-radius: ${(props) => (props.$isEmbedded ? "0" : "6px")};
  z-index: ${(props) => (props.$isEmbedded ? "auto" : "99999")};
  display: flex;
  flex-direction: column;
  pointer-events: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background-color: #222;
  border-bottom: 1px solid #333;
  font-size: 11px;
  font-weight: bold;
  color: #888;
`;

const LogArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-left: 8px;
  padding-right: 8px;
  margin-bottom: 50px;
  margin-top: 10px;
  display: flex;
  flex-direction: column-reverse;
  gap: 4px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 3px;
  }
`;

const LogEntry = styled.div<{ $type: LogLevel }>`
  font-size: 11px;
  line-height: 1.4;
  word-break: break-all;
  white-space: pre-wrap;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 2px;

  color: ${({ $type }) => {
    switch ($type) {
      case "error":
        return "#ff6b6b";
      case "warn":
        return "#fcc419";
      case "info":
        return "#74c0fc";
      case "debug":
        return "#cc5de8";
      default:
        return "#51cf66";
    }
  }};

  &::before {
    content: "> ";
    opacity: 0.3;
  }
`;

const ActionBtn = styled.button`
  background: #333;
  border: none;
  color: #aaa;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 10px;
  cursor: pointer;
  margin-left: 5px;
  &:hover {
    background: #444;
    color: #fff;
  }
`;

// --- Helpers ---

const safeStringify = (args: unknown[]): string => {
  return args
    .map((arg) => {
      if (arg instanceof Error)
        return `${arg.name}: ${arg.message}\n${arg.stack}`;
      if (typeof arg === "object" && arg !== null) {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return "[Circular]";
        }
      }
      return String(arg);
    })
    .join(" ");
};

// --- Component ---

export const OnScreenConsole: React.FC<{ isEmbedded?: boolean }> = ({
  isEmbedded,
}) => {
  const [logs, setLogs] = useState<LogData[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const originalMethods: Record<LogLevel, ConsoleMethod> = {
      log: console.log.bind(console),
      error: console.error.bind(console),
      warn: console.warn.bind(console),
      info: console.info.bind(console),
      debug: console.debug.bind(console),
    };

    const addLog = (type: LogLevel, ...args: unknown[]) => {
      setLogs((prev) => {
        const entry: LogData = {
          id: generateId("log"),
          type,
          message: safeStringify(args),
          time: new Date().toLocaleTimeString().split(" ")[0] ?? "",
        };
        return [entry, ...prev].slice(0, 100);
      });
    };

    console.log = (...args) => {
      originalMethods.log(...args);
      addLog("log", ...args);
    };
    console.error = (...args) => {
      originalMethods.error(...args);
      addLog("error", ...args);
    };
    console.warn = (...args) => {
      originalMethods.warn(...args);
      addLog("warn", ...args);
    };
    console.info = (...args) => {
      originalMethods.info(...args);
      addLog("info", ...args);
    };
    console.debug = (...args) => {
      originalMethods.debug(...args);
      addLog("debug", ...args);
    };

    return () => {
      console.log = originalMethods.log;
      console.error = originalMethods.error;
      console.warn = originalMethods.warn;
      console.info = originalMethods.info;
      console.debug = originalMethods.debug;
    };
  }, []);

  if (!isEmbedded && !isOpen) {
    return (
      <ActionBtn
        style={{ position: "fixed", bottom: 10, left: 10, zIndex: 99999 }}
        onClick={() => setIsOpen(true)}
      >
        CONSOLE
      </ActionBtn>
    );
  }

  return (
    <ConsoleContainer $isEmbedded={isEmbedded}>
      <Header>
        <span>OUTPUT LOG</span>
        <div>
          <ActionBtn onClick={() => setLogs([])}>CLEAR</ActionBtn>
          {!isEmbedded && (
            <ActionBtn onClick={() => setIsOpen(false)}>HIDE</ActionBtn>
          )}
        </div>
      </Header>
      <LogArea>
        {logs.map((log) => (
          <LogEntry key={log.id} $type={log.type}>
            <span style={{ opacity: 0.5, fontSize: "0.9em", marginRight: 4 }}>
              [{log.time}]
            </span>
            {log.message}
          </LogEntry>
        ))}
      </LogArea>
    </ConsoleContainer>
  );
};
