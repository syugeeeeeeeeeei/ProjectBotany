import React from 'react';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore'; // ★UIストアをインポート
import type { Cell, Piece } from '../types/data';

// ... (getCellColor, Piece3Dコンポーネントは変更なし)
const getCellColor = (dominant?: 'alien' | 'native') => {
	switch (dominant) {
		case 'alien': return '#E57373';
		case 'native': return '#2E7D32';
		default: return '#757575';
	}
};

const Piece3D: React.FC<{ piece: Piece }> = ({ piece }) => {
	const color = piece.type === 'alien' ? '#C62828' : '#1565C0';
	return (
		<mesh position-z={0.1}>
			<cylinderGeometry args={[0.3, 0.3, 0.2, 32]} />
			<meshStandardMaterial color={color} />
		</mesh>
	);
};

const Cell3D: React.FC<{ cell: Cell; piece?: Piece }> = ({ cell, piece }) => {
	const { currentPlayerId, gameStatus, placePiece, useCard } = useGameStore();
	// ★UIストアから状態とアクションを取得
	const { selectedCardId, selectCard } = useUIStore();

	const handleCellClick = () => {
		if (gameStatus !== 'player_turn' || !selectedCardId) return;

		if (currentPlayerId === 'alien') {
			placePiece(cell.id, selectedCardId);
		} else {
			useCard(cell.id, selectedCardId);
		}
		// ★カード使用後にUIの選択状態を解除
		selectCard(null);
	};

	const position: [number, number, number] = [
		(cell.id % 5) - 2,
		0,
		Math.floor(cell.id / 5) - 2,
	];

	return (
		<group
			position={position}
			onClick={handleCellClick}
			rotation={[-Math.PI / 2, 0, 0]}
		>
			<mesh>
				<planeGeometry args={[0.9, 0.9]} />
				<meshStandardMaterial color={getCellColor(cell.dominant)} />
			</mesh>
			{piece && <Piece3D piece={piece} />}
		</group>
	);
};

const GameBoard3D: React.FC = () => {
	const { cells, pieces } = useGameStore();
	return (
		<group>
			{cells.map((cell) => (
				<Cell3D
					key={cell.id}
					cell={cell}
					piece={pieces.find((p) => p.cellId === cell.id)}
				/>
			))}
		</group>
	);
};

export default GameBoard3D;