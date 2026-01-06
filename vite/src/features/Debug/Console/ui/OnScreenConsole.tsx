// vite/src/features/debug-console/ui/OnScreenConsole.tsx
import { generateId } from "@/shared/utils/id";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

// --- Types ---

/** 監視対象のログレベル */
type LogLevel = "log" | "error" | "warn" | "info" | "debug";

/** コンソールメソッドの関数シグネチャ */
type ConsoleMethod = (...args: unknown[]) => void;

/** ログデータの構造 */
interface LogData {
  id: string;
  type: LogLevel;
  message: string;
  time: string;
}

// --- Styles ---

const ConsoleContainer = styled.div`
  position: fixed;
  bottom: 10px;
  left: 10px;
  width: calc(100% - 20px);
  max-width: 600px;
  height: 300px;
  background-color: rgba(20, 20, 20, 0.92);
  backdrop-filter: blur(4px);
  color: #0f0;
  font-family: "Menlo", "Monaco", "Courier New", monospace;
  border: 1px solid #444;
  border-radius: 6px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
  pointer-events: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background-color: #333;
  border-bottom: 1px solid #555;
  font-size: 11px;
  font-weight: bold;
  color: #ddd;
`;

const LogArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column-reverse;
  gap: 4px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #555;
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

const ToggleButton = styled.button`
  position: fixed;
  bottom: 10px;
  left: 10px;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.6);
  color: #0f0;
  border: 1px solid #0f0;
  padding: 4px 10px;
  font-size: 10px;
  cursor: pointer;
  pointer-events: auto;
  font-family: monospace;

  &:hover {
    background: rgba(0, 50, 0, 0.8);
  }
`;

const ActionBtn = styled.button`
  background: #555;
  border: none;
  color: white;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 10px;
  cursor: pointer;
  margin-left: 5px;
  &:hover {
    background: #666;
  }
`;

// --- Logic Helpers ---

/**
 * 任意の引数リストを安全に文字列化する
 * unknown[] を受け取ることで no-explicit-any を回避
 */
const safeStringify = (args: unknown[]): string => {
  return args
    .map((arg) => {
      // オブジェクトかつnullでない場合のみJSON化を試みる
      if (typeof arg === "object" && arg !== null) {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return "[Circular/Obj]";
        }
      }
      // プリミティブ値などはString()で変換（unknown型も安全に文字列化可能）
      return String(arg);
    })
    .join(" ");
};

export const OnScreenConsole: React.FC = () => {
  const [logs, setLogs] = useState<LogData[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 1. オリジナルのメソッドを型安全に退避
    // consoleオブジェクトは環境によってメソッドの実装が異なるため、bindしてコピーを作成
    const originalMethods: Record<LogLevel, ConsoleMethod> = {
      log: console.log.bind(console),
      error: console.error.bind(console),
      warn: console.warn.bind(console),
      info: console.info.bind(console),
      debug: console.debug.bind(console),
    };

    /**
     * フック関数を作成するファクトリ
     * args: unknown[] にすることで any を排除
     */
    const createHook = (type: LogLevel) => {
      return (...args: unknown[]) => {
        // 元のコンソールメソッドを実行
        originalMethods[type](...args);

        // React Stateを更新
        setLogs((prev) => {
          const entry: LogData = {
            id: generateId("log"),
            type,
            message: safeStringify(args),
            time: new Date().toLocaleTimeString().split(" ")[0] ?? "",
          };
          // 最大100件保持
          return [entry, ...prev].slice(0, 100);
        });
      };
    };

    // 2. コンソールメソッドを上書き
    // 代入時に型の不一致が起きないよう、互換性のあるシグネチャで実装済み
    console.log = createHook("log");
    console.error = createHook("error");
    console.warn = createHook("warn");
    console.info = createHook("info");
    console.debug = createHook("debug");

    // 3. クリーンアップ
    return () => {
      console.log = originalMethods.log;
      console.error = originalMethods.error;
      console.warn = originalMethods.warn;
      console.info = originalMethods.info;
      console.debug = originalMethods.debug;
    };
  }, []);

  if (!isOpen) {
    return <ToggleButton onClick={() => setIsOpen(true)}>DEBUG</ToggleButton>;
  }

  return (
    <ConsoleContainer>
      <Header>
        <span>SYSTEM LOG</span>
        <div>
          <ActionBtn onClick={() => setLogs([])}>CLR</ActionBtn>
          <ActionBtn onClick={() => setIsOpen(false)}>HIDE</ActionBtn>
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
