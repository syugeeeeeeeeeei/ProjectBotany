import { type ThreeEvent, useThree } from '@react-three/fiber';
import { useGesture } from '@use-gesture/react';
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Group } from 'three';
import cardMasterData from '../data/cardMasterData';
import * as logic from '../logic/gameLogic';
import { useUIStore } from '../store/UIStore';
import type { CardDefinition, CellState, FieldState } from '../types/data';

// --- 定数定義 ---

const CELL_COLORS = {
	native_area: '#2E7D32',
	alien_core: '#C62828',
	alien_invasion_area: '#E57373',
	empty_area: '#757575',
	recovery_pending_area: '#FDD835',
	default: '#444444',
};
const BOARD_LAYOUT = {
	CELL_GAP: 1.0,
	CELL_SIZE: 0.9,
	BOARD_WIDTH: 7,
	BOARD_HEIGHT: 10,
	ROTATION_X: -Math.PI / 2,
};
const HIGHLIGHT_SETTINGS = {
	SELECTED_COLOR: '#4488FF',
	SELECTED_INTENSITY: 1.5,
	DEFAULT_COLOR: 'black',
	DEFAULT_INTENSITY: 0,
};
const OUTLINE_LAYOUT = {
	OUTER_SIZE: 0.45,
	THICKNESS: 0.05,
	MOVE_TARGET_COLOR: '#87CEEB',
	EFFECT_RANGE_COLOR: '#32CD32',
	Y_OFFSET: 0.1
};
const PREVIEW_PIECE_LAYOUT = {
	COLOR: '#FFD700', // 金色
	OPACITY: 0.7,
	Z_OFFSET: 0,
};

// --- ヘルパー関数 ---

const getCellColor = (cellType: CellState['cellType']): string => CELL_COLORS[cellType] || CELL_COLORS.default;
const getPositionFromCoords = (x: number, y: number): [number, number, number] => [
	(x - (BOARD_LAYOUT.BOARD_WIDTH - 1) / 2) * BOARD_LAYOUT.CELL_GAP,
	0,
	(y - (BOARD_LAYOUT.BOARD_HEIGHT - 1) / 2) * BOARD_LAYOUT.CELL_GAP,
];

// --- コンポーネント定義 ---

/** 範囲を示す縁取りの3Dオブジェクト */
const Outline: React.FC<{ color: string }> = ({ color }) => {
	const shape = useMemo(() => {
		const s = OUTLINE_LAYOUT.OUTER_SIZE;
		const innerS = s - OUTLINE_LAYOUT.THICKNESS;
		const newShape = new THREE.Shape();
		newShape.moveTo(-s, s); newShape.lineTo(s, s); newShape.lineTo(s, -s); newShape.lineTo(-s, -s); newShape.closePath();
		const hole = new THREE.Path();
		hole.moveTo(-innerS, innerS); hole.lineTo(innerS, innerS); hole.lineTo(innerS, -innerS); hole.lineTo(-innerS, -innerS); hole.closePath();
		newShape.holes.push(hole);
		return newShape;
	}, []);

	return (
		// メッシュを回転させ、Y軸に少しオフセットを持たせることで、マスの上に正しく表示させる
		<mesh
			position={[0, OUTLINE_LAYOUT.Y_OFFSET, 0]}
			rotation={[BOARD_LAYOUT.ROTATION_X, 0, 0]}
		>
			<shapeGeometry args={[shape]} />
			<meshBasicMaterial color={color} side={THREE.DoubleSide} />
		</mesh>
	);
};

/**
 * 「召喚準備状態」で表示される、ドラッグ可能なプレビュー用のコマ（召喚準備マス）
 */
const PreviewPiece: React.FC<{ card: CardDefinition, position: { x: number, y: number }, boardRef: React.RefObject<Group | null> }> = ({ card, position, boardRef }) => {
	const { setPreviewPlacement, playSelectedCard } = useUIStore();
	const { size, camera, raycaster } = useThree();

	const bind = useGesture({
		onDrag: ({ xy: [px, py], event }) => {
			event.stopPropagation();
			if (!boardRef.current) return;

			// スクリーン座標をワールド座標に変換して、どのマス上にあるかを判定
			const pointer = new THREE.Vector2((px / size.width) * 2 - 1, -(py / size.height) * 2 + 1);
			raycaster.setFromCamera(pointer, camera);
			// boardRefを使って、盤面全体のセルとの交差判定を行う
			const intersects = raycaster.intersectObjects(boardRef.current.children, true);
			const intersectedCell = intersects.find(i => i.object.name.startsWith('cell-plane'))?.object.parent?.userData?.cell;
			if (intersectedCell) {
				setPreviewPlacement({ x: intersectedCell.x, y: intersectedCell.y });
			}
		},
		onClick: ({ event }) => {
			event.stopPropagation(); // DOMイベントの伝播を止める
			playSelectedCard(); // タップで配置を確定
		},
	}, { drag: { filterTaps: true } });

	const pieceColor = card.cardType === 'alien' ? CELL_COLORS.alien_core : card.cardType === 'eradication' ? '#4a82a2' : '#579d5b';

	return (
		<group position={getPositionFromCoords(position.x, position.y)} {...bind()}>
			<mesh rotation={[BOARD_LAYOUT.ROTATION_X, 0, 0]} position={[0, OUTLINE_LAYOUT.Y_OFFSET, 0]}>
				<boxGeometry args={[BOARD_LAYOUT.CELL_SIZE, BOARD_LAYOUT.CELL_SIZE, 0.2]} />
				<meshStandardMaterial color={pieceColor} transparent opacity={PREVIEW_PIECE_LAYOUT.OPACITY} emissive={PREVIEW_PIECE_LAYOUT.COLOR} emissiveIntensity={0.5} />
			</mesh>
		</group>
	);
};

/**
 * 個々のマス（セル）を表す3Dオブジェクト。
 * 効果予定マス（isEffectPreview）の表示を担当する。
 */
const Cell: React.FC<{ cell: CellState, isEffectPreview: boolean, isSummonTarget: boolean }> = ({ cell, isEffectPreview, isSummonTarget }) => {
	const { selectedAlienInstanceId, selectAlienInstance, moveAlien } = useUIStore();

	const isMoveTarget = useMemo(() => {
		if (!selectedAlienInstanceId) return false;
		return cell.cellType === 'alien_invasion_area' && cell.dominantAlienInstanceId === selectedAlienInstanceId;
	}, [selectedAlienInstanceId, cell]);

	const isSelected = cell.alienInstanceId !== null && cell.alienInstanceId === selectedAlienInstanceId;

	const handleCellClick = (event: ThreeEvent<MouseEvent>) => {
		event.stopPropagation(); // R3Fのイベント伝播を止める
		// 「召喚準備状態」のクリックはPreviewPieceが担当するため、ここでは何もしない
		if (selectedAlienInstanceId) {
			if (isMoveTarget) moveAlien(cell);
			else if (cell.alienInstanceId) selectAlienInstance(cell.alienInstanceId);
			else selectAlienInstance(null);
			return;
		}
		if (cell.alienInstanceId) {
			selectAlienInstance(cell.alienInstanceId);
		}
	};

	return (
		<group position={getPositionFromCoords(cell.x, cell.y)} userData={{ cell }}>
			<mesh
				name="cell-plane"
				rotation={[BOARD_LAYOUT.ROTATION_X, 0, 0]}
				onClick={handleCellClick}
			>
				<planeGeometry args={[BOARD_LAYOUT.CELL_SIZE, BOARD_LAYOUT.CELL_SIZE]} />
				<meshStandardMaterial
					color={getCellColor(cell.cellType)}
					emissive={isSelected ? HIGHLIGHT_SETTINGS.SELECTED_COLOR : HIGHLIGHT_SETTINGS.DEFAULT_COLOR}
					emissiveIntensity={isSelected ? HIGHLIGHT_SETTINGS.SELECTED_INTENSITY : HIGHLIGHT_SETTINGS.DEFAULT_INTENSITY}
				/>
			</mesh>
			{isMoveTarget && <Outline color={OUTLINE_LAYOUT.MOVE_TARGET_COLOR} />}
			{/* 召喚準備マス自体には枠線を表示せず、効果予定マスにのみ表示する */}
			{isEffectPreview && !isSummonTarget && <Outline color={OUTLINE_LAYOUT.EFFECT_RANGE_COLOR} />}
		</group>
	);
};

/**
 * ゲームボード全体を表すコンポーネント。
 */
const GameBoard3D: React.FC<{ fieldState: FieldState }> = ({ fieldState }) => {
	const { selectedCardId, previewPlacement } = useUIStore();
	const boardRef = useRef<Group>(null); // ボード全体への参照

	const selectedCardDef = useMemo(() => {
		if (!selectedCardId) return null;
		return cardMasterData.find(c => c.id === selectedCardId.split('-instance-')[0]) ?? null;
	}, [selectedCardId]);

	// 効果予定マスの座標セットを計算
	const effectPreviewCells = useMemo(() => {
		if (!selectedCardDef || !previewPlacement) return new Set();
		const targetCell = fieldState.cells[previewPlacement.y][previewPlacement.x];
		// 修正された`getEffectRange`を呼び出す
		const range = logic.getEffectRange(selectedCardDef, targetCell, fieldState);
		return new Set(range.map(c => `${c.x}-${c.y}`));
	}, [selectedCardDef, previewPlacement, fieldState]);

	return (
		<group ref={boardRef}>
			{fieldState.cells.flat().map((cell) => {
				const cellCoord = `${cell.x}-${cell.y}`;
				const isEffectPreview = effectPreviewCells.has(cellCoord);
				const isSummonTarget = !!previewPlacement && cell.x === previewPlacement.x && cell.y === previewPlacement.y;
				return <Cell key={cellCoord} cell={cell} isEffectPreview={isEffectPreview} isSummonTarget={isSummonTarget} />;
			})}
			{/* 召喚準備状態の時のみ、ドラッグ可能なプレビュー用のコマを表示 */}
			{selectedCardDef && previewPlacement && (
				<PreviewPiece card={selectedCardDef} position={previewPlacement} boardRef={boardRef} />
			)}
		</group>
	);
};

export default GameBoard3D;