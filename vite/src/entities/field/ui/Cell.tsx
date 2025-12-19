import type { ThreeEvent } from '@react-three/fiber';
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../../app/providers/StoreProvider';
import { getPositionFromCoords } from '../../../shared/lib/coords';
import type { CellState } from '../../../shared/types/data';

const CELL_COLORS = {
	native_area: '#2E7D32',
	alien_core: '#C62828',
	alien_invasion_area: '#E57373',
	empty_area: '#757575',
	recovery_pending_area: '#FDD835',
	default: '#444444',
};

/** 範囲を示す縁取りの3Dオブジェクト */
const Outline: React.FC<{ color: string }> = ({ color }) => {
	const shape = useMemo(() => {
		const s = 0.45;
		const innerS = s - 0.05;
		const newShape = new THREE.Shape();
		newShape.moveTo(-s, s); newShape.lineTo(s, s); newShape.lineTo(s, -s); newShape.lineTo(-s, -s); newShape.closePath();
		const hole = new THREE.Path();
		hole.moveTo(-innerS, innerS); hole.lineTo(innerS, innerS); hole.lineTo(innerS, -innerS); hole.lineTo(-innerS, -innerS); hole.closePath();
		newShape.holes.push(hole);
		return newShape;
	}, []);

	return (
		<mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
			<shapeGeometry args={[shape]} />
			<meshBasicMaterial color={color} side={THREE.DoubleSide} />
		</mesh>
	);
};

interface CellProps {
	cell: CellState;
	isEffectPreview: boolean;
	isSummonTarget: boolean;
}

export const Cell: React.FC<CellProps> = ({ cell, isEffectPreview, isSummonTarget }) => {
	const { selectedAlienInstanceId, selectAlienInstance, moveAlien } = useGameStore();

	const isMoveTarget = useMemo(() => {
		if (!selectedAlienInstanceId) return false;
		return cell.cellType === 'alien_invasion_area' && cell.dominantAlienInstanceId === selectedAlienInstanceId;
	}, [selectedAlienInstanceId, cell]);

	const isSelected = cell.cellType === 'alien_core' && cell.alienInstanceId === selectedAlienInstanceId;

	const handleCellClick = (event: ThreeEvent<MouseEvent>) => {
		event.stopPropagation();
		if (selectedAlienInstanceId) {
			if (isMoveTarget) moveAlien(cell);
			else if (cell.cellType === 'alien_core') selectAlienInstance(cell.alienInstanceId);
			else selectAlienInstance(null);
			return;
		}
		if (cell.cellType === 'alien_core') {
			selectAlienInstance(cell.alienInstanceId);
		}
	};

	return (
		<group position={getPositionFromCoords(cell.x, cell.y)} userData={{ cell }}>
			<mesh name="cell-plane" rotation={[-Math.PI / 2, 0, 0]} onClick={handleCellClick}>
				<planeGeometry args={[0.9, 0.9]} />
				<meshStandardMaterial
					color={CELL_COLORS[cell.cellType] || CELL_COLORS.default}
					emissive={isSelected ? '#4488FF' : 'black'}
					emissiveIntensity={isSelected ? 1.5 : 0}
				/>
			</mesh>
			{isMoveTarget && <Outline color="#87CEEB" />}
			{isEffectPreview && !isSummonTarget && <Outline color="#32CD32" />}
		</group>
	);
};