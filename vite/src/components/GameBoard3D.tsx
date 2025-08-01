import React, { useMemo } from 'react';
import * as THREE from 'three'; // ★追加
import { useGameStore } from '../store/gameStore';
import type { CellState, FieldState } from '../types/data';

// 各セルの状態に応じた色を返すヘルパー関数
const getCellColor = (cellType: CellState['cellType']) => {
	switch (cellType) {
		case 'native_area': return '#2E7D32'; // 緑
		case 'alien_core': return '#C62828'; // 赤
		case 'alien_invasion_area': return '#E57373'; // 薄い赤
		case 'empty_area': return '#757575'; // 灰色
		case 'recovery_pending_area': return '#FDD835'; // 黄色
		default: return '#444';
	}
};

// ★追加: 支配マスを縁取りで表示するコンポーネント
const MoveTargetOutline: React.FC = () => {
	const shape = useMemo(() => {
		const s = 0.45; // 外側の四角形の半分のサイズ
		const w = 0.05; // 縁の太さ
		const innerS = s - w; // 内側の四角形の半分のサイズ

		const newShape = new THREE.Shape();
		// 外側の四角形
		newShape.moveTo(-s, s);
		newShape.lineTo(s, s);
		newShape.lineTo(s, -s);
		newShape.lineTo(-s, -s);
		newShape.closePath();

		// くり抜く穴
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
		<mesh position-z={0.01}> {/* マスより少しだけ手前に表示 */}
			<shapeGeometry args={[shape]} />
			<meshBasicMaterial color="#87CEEB" side={THREE.DoubleSide} />
		</mesh>
	);
};


// 個々のセル（マス）を表す3Dオブジェクト
const Cell: React.FC<{ cell: CellState }> = ({ cell }) => {
	const { selectedAlienInstanceId, playCard, selectAlienInstance, moveAlien, selectedCardId } = useGameStore();

	const isMoveTarget = useMemo(() => {
		if (!selectedAlienInstanceId) return false;
		return cell.cellType === 'alien_invasion_area' && cell.dominantAlienInstanceId === selectedAlienInstanceId;
	}, [selectedAlienInstanceId, cell]);


	const handleCellClick = () => {
		if (selectedCardId) {
			playCard(cell);
			return;
		}
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

	const isSelected = cell.alienInstanceId !== null && cell.alienInstanceId === selectedAlienInstanceId;
	const position: [number, number, number] = [cell.x - 3, 0, cell.y - 4.5];

	// ★修正: 支配マスのハイライト（emissive）を削除
	const emissiveColor = isSelected ? '#4488FF' : 'black';
	const emissiveIntensity = isSelected ? 1.5 : 0;


	return (
		<group position={position} onClick={handleCellClick} rotation={[-Math.PI / 2, 0, 0]}>
			<mesh>
				<planeGeometry args={[0.9, 0.9]} />
				<meshStandardMaterial color={getCellColor(cell.cellType)} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
			</mesh>
			{/* ★修正: isMoveTargetがtrueの時に縁取りコンポーネントを表示 */}
			{isMoveTarget && <MoveTargetOutline />}
		</group>
	);
};

// ゲームボード全体
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