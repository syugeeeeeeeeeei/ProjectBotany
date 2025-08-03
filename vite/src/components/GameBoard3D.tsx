import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import type { CellState, FieldState } from '../types/data';

// --- 定数定義 ---

/** マスの種類ごとの色定義 */
const CELL_COLORS = {
	native_area: '#2E7D32',           // 在来種マス (緑)
	alien_core: '#C62828',            // 外来種コアマス (赤)
	alien_invasion_area: '#E57373',   // 侵略マス (薄い赤)
	empty_area: '#757575',            // 空マス (灰色)
	recovery_pending_area: '#FDD835', // 再生待機マス (黄色)
	default: '#444444',               // デフォルト
};

/** ゲームボードのレイアウト設定 */
const BOARD_LAYOUT = {
	CELL_GAP: 1.0,                    // セル間の距離（中心から中心まで）
	CELL_SIZE: 0.9,                   // セルの表示サイズ
	BOARD_WIDTH: 7,                   // ボードの幅（セル数）
	BOARD_HEIGHT: 10,                 // ボードの高さ（セル数）
	ROTATION_X: -Math.PI / 2,         // ボード全体のX軸回転
};

/** 選択されたエイリアン・マスのハイライト設定 */
const HIGHLIGHT_SETTINGS = {
	SELECTED_COLOR: '#4488FF',        // 選択時の発光色
	SELECTED_INTENSITY: 1.5,          // 選択時の発光強度
	DEFAULT_COLOR: 'black',           // 非選択時の発光色
	DEFAULT_INTENSITY: 0,             // 非選択時の発光強度
};

/** 移動可能マスを示す縁取りのレイアウト設定 */
const OUTLINE_LAYOUT = {
	OUTER_SIZE: 0.45,                 // 縁取りの外側のサイズ
	THICKNESS: 0.05,                  // 縁取りの太さ
	COLOR: '#87CEEB',                 // 縁取りの色 (水色)
	Z_OFFSET: 0.01,                   // マスからのZ軸オフセット（手前に表示するため）
};

// --- ヘルパー関数 ---

/**
 * マスの種類（cellType）に応じた色を返す。
 * @param cellType マスの種類
 * @returns 色の文字列
 */
const getCellColor = (cellType: CellState['cellType']): string => {
	return CELL_COLORS[cellType] || CELL_COLORS.default;
};


// --- コンポーネント定義 ---

/**
 * 移動可能なマスを示す縁取りの3Dオブジェクト。
 */
const MoveTargetOutline: React.FC = () => {
	// 縁取りの形状を一度だけ計算
	const shape = useMemo(() => {
		const s = OUTLINE_LAYOUT.OUTER_SIZE;
		const innerS = s - OUTLINE_LAYOUT.THICKNESS;

		const newShape = new THREE.Shape();
		// 外側の四角形
		newShape.moveTo(-s, s);
		newShape.lineTo(s, s);
		newShape.lineTo(s, -s);
		newShape.lineTo(-s, -s);
		newShape.closePath();

		// くり抜く内側の四角形（穴）
		const hole = new THREE.Path();
		hole.moveTo(-innerS, innerS);
		hole.lineTo(innerS, innerS);
		hole.lineTo(innerS, -innerS);
		hole.lineTo(-innerS, -innerS);
		hole.closePath();

		newShape.holes.push(hole);
		return newShape;
	}, []);

	return (
		<mesh position-z={OUTLINE_LAYOUT.Z_OFFSET}>
			<shapeGeometry args={[shape]} />
			<meshBasicMaterial color={OUTLINE_LAYOUT.COLOR} side={THREE.DoubleSide} />
		</mesh>
	);
};

/**
 * 個々のマス（セル）を表す3Dオブジェクト。
 * クリック時のアクションや、状態に応じた見た目の変化を担う。
 */
const Cell: React.FC<{ cell: CellState }> = ({ cell }) => {
	// --- StateとStore ---
	const { selectedAlienInstanceId, playCard, selectAlienInstance, moveAlien, selectedCardId } = useGameStore();

	// --- 変数とロジック ---

	// このセルが現在選択中のエイリアンの移動先かどうかを判定
	const isMoveTarget = useMemo(() => {
		if (!selectedAlienInstanceId) return false;
		return cell.cellType === 'alien_invasion_area' && cell.dominantAlienInstanceId === selectedAlienInstanceId;
	}, [selectedAlienInstanceId, cell]);

	// このセルにいるエイリアンが選択されているかどうか
	const isSelected = cell.alienInstanceId !== null && cell.alienInstanceId === selectedAlienInstanceId;

	// セルの3D空間上の位置を計算
	const position: [number, number, number] = [
		(cell.x - (BOARD_LAYOUT.BOARD_WIDTH - 1) / 2) * BOARD_LAYOUT.CELL_GAP,
		0,
		(cell.y - (BOARD_LAYOUT.BOARD_HEIGHT - 1) / 2) * BOARD_LAYOUT.CELL_GAP,
	];

	// --- イベントハンドラ ---

	/**
	 * セルがクリックされたときの処理。
	 * ゲームの状況に応じて、カードの使用、エイリアンの選択・移動などを実行する。
	 */
	const handleCellClick = () => {
		// カード選択中の場合: カードプレイを試みる
		if (selectedCardId) {
			playCard(cell);
			return;
		}
		// エイリアン選択中の場合
		if (selectedAlienInstanceId) {
			if (isMoveTarget) moveAlien(cell); // 移動対象マスなら移動
			else if (cell.alienInstanceId) selectAlienInstance(cell.alienInstanceId); // 別のエイリアンがいれば選択切り替え
			else selectAlienInstance(null); // 何もなければ選択解除
			return;
		}
		// 何も選択されていない場合: セルにエイリアンがいれば選択
		if (cell.alienInstanceId) {
			selectAlienInstance(cell.alienInstanceId);
		}
	};

	// --- レンダリング ---
	return (
		<group position={position} onClick={handleCellClick} rotation={[BOARD_LAYOUT.ROTATION_X, 0, 0]}>
			<mesh>
				<planeGeometry args={[BOARD_LAYOUT.CELL_SIZE, BOARD_LAYOUT.CELL_SIZE]} />
				<meshStandardMaterial
					color={getCellColor(cell.cellType)}
					emissive={isSelected ? HIGHLIGHT_SETTINGS.SELECTED_COLOR : HIGHLIGHT_SETTINGS.DEFAULT_COLOR}
					emissiveIntensity={isSelected ? HIGHLIGHT_SETTINGS.SELECTED_INTENSITY : HIGHLIGHT_SETTINGS.DEFAULT_INTENSITY}
				/>
			</mesh>
			{isMoveTarget && <MoveTargetOutline />}
		</group>
	);
};

/**
 * ゲームボード全体を表すコンポーネント。
 * 全てのセルを並べて表示する。
 */
const GameBoard3D: React.FC<{ fieldState: FieldState }> = ({ fieldState }) => {
	return (
		<group>
			{fieldState.cells.flat().map((cell) => (
				<Cell key={`${cell.x}-${cell.y}`} cell={cell} />
			))}
		</group>
	);
};

export default GameBoard3D;