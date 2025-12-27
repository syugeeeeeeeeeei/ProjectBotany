import { nanoid } from "nanoid";

/**
 * ユニークなID（nanoid）を生成する。
 * @param prefix IDの接頭辞（オプション）
 */
export const generateId = (prefix?: string): string => {
  return prefix ? `${prefix}-${nanoid()}` : nanoid();
};
