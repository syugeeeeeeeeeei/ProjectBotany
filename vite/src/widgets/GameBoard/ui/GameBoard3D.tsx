import React, { useMemo, useRef } from 'react';
import type { Group } from 'three';
import { useGameStore } from '../../../app/providers/StoreProvider';
import cardMasterData from '../../../entities/card/model/cardMasterData';
import { Cell } from '../../../entities/field/ui/Cell';
import { getEffectRange } from '../../../features/play-card/model/playCard';
import { PreviewPiece } from '../../../features/play-card/ui/PreviewPiece';
import type { FieldState } from '../../../shared/types/data';

export const GameBoard3D: React.FC<{ fieldState: FieldState }> = ({ fieldState }) => {
	const { selectedCardId, previewPlacement, playerStates, activePlayerId } = useGameStore();
	const boardRef = useRef<Group>(null);

	const selectedCardDef = useMemo(() => {
		if (!selectedCardId) return null;
		return cardMasterData.find(c => c.id === selectedCardId.split('-instance-')[0]) ?? null;
	}, [selectedCardId]);

	const effectPreviewCells = useMemo(() => {
		if (!selectedCardDef || !previewPlacement) return new Set<string>();
		const targetCell = fieldState.cells[previewPlacement.y][previewPlacement.x];
		const facingFactor = playerStates[activePlayerId].facingFactor;
		const range = getEffectRange(selectedCardDef, targetCell, fieldState, facingFactor);
		return new Set(range.map(c => `${c.x}-${c.y}`));
	}, [selectedCardDef, previewPlacement, fieldState, activePlayerId, playerStates]);

	return (
		<group ref={boardRef}>
			{fieldState.cells.flat().map((cell, index) => {
				const isEffectPreview = effectPreviewCells.has(`${cell.x}-${cell.y}`);
				const isSummonTarget = !!previewPlacement && cell.x === previewPlacement.x && cell.y === previewPlacement.y;
				return <Cell key={`${cell.x}-${cell.y}-${index}`} cell={cell} isEffectPreview={isEffectPreview} isSummonTarget={isSummonTarget} />;
			})}
			{selectedCardDef && previewPlacement && (
				<PreviewPiece card={selectedCardDef} position={previewPlacement} boardRef={boardRef} />
			)}
		</group>
	);
};