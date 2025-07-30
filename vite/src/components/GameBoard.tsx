import React from 'react';
import styled from 'styled-components';
import { useGameStore } from '../store/gameStore';
import type { CellState, FieldState } from '../types/data';

interface GameBoardProps {
	fieldState: FieldState;
}

const BoardContainer = styled.div<{ width: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.width}, 1fr);
  gap: 2px;
  border: 2px solid #666;
  background-color: #333;
  width: 70vw;
  max-width: 420px;
  margin: 20px auto;
`;

// ✨ 選択されているコマのスタイルを追加
const Cell = styled.div<{ $cellType: CellState['cellType']; $isSelected: boolean }>`
  aspect-ratio: 1 / 1;
  background-color: ${({ $cellType }) => {
		switch ($cellType) {
			case 'native_area': return '#2E7D32';
			case 'alien_core': return '#C62828';
			case 'alien_invasion_area': return '#E57373';
			case 'empty_area': return '#757575';
			case 'recovery_pending_area': return '#FDD835';
			default: return '#444';
		}
	}};
  border: 1px solid #555;
  cursor: pointer;
  box-shadow: ${({ $isSelected }) => ($isSelected ? '0 0 10px 3px yellow' : 'none')};
  transition: all 0.2s ease-in-out;

  &:hover {
    filter: brightness(1.2);
  }
`;

const GameBoard: React.FC<GameBoardProps> = ({ fieldState }) => {
	const { selectedCardId, selectedAlienInstanceId, playCard, selectAlienInstance, moveAlien } = useGameStore();

	const handleCellClick = (cell: CellState) => {
		if (selectedCardId) { // カードが選択されている場合
			playCard(cell);
		} else if (selectedAlienInstanceId) { // コマが選択されている場合
			moveAlien(cell);
		} else { // 何も選択されていない場合
			if (cell.alienInstanceId) {
				selectAlienInstance(cell.alienInstanceId);
			}
		}
	};

	return (
		<BoardContainer width={fieldState.width}>
			{fieldState.cells.flat().map((cell) => (
				<Cell
					key={`${cell.x}-${cell.y}`}
					$cellType={cell.cellType}
					$isSelected={cell.alienInstanceId !== null && cell.alienInstanceId === selectedAlienInstanceId}
					onClick={() => handleCellClick(cell)}
				/>
			))}
		</BoardContainer>
	);
};

export default GameBoard;