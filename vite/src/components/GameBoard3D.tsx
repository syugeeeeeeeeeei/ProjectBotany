import React from 'react';
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

// 個々のセル（マス）を表す3Dオブジェクト
const Cell: React.FC<{ cell: CellState }> = ({ cell }) => {
	const { selectedCardId, selectedAlienInstanceId, playCard, selectAlienInstance, moveAlien } = useGameStore();

	const handleCellClick = () => {
		if (selectedCardId) {
			playCard(cell);
		} else if (selectedAlienInstanceId) {
			moveAlien(cell);
		} else if (cell.alienInstanceId) {
			selectAlienInstance(cell.alienInstanceId);
		}
	};

	const isSelected = cell.alienInstanceId !== null && cell.alienInstanceId === selectedAlienInstanceId;
	const position: [number, number, number] = [cell.x - 3, 0, cell.y - 4.5];

	return (
		<mesh position={position} onClick={handleCellClick} rotation={[-Math.PI / 2, 0, 0]}>
			<planeGeometry args={[0.9, 0.9]} />
			<meshStandardMaterial color={getCellColor(cell.cellType)} emissive={isSelected ? 'yellow' : 'black'} emissiveIntensity={isSelected ? 1 : 0} />
		</mesh>
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