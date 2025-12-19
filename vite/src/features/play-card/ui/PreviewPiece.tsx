import { useThree } from '@react-three/fiber';
import { useGesture } from '@use-gesture/react';
import React from 'react';
import type { Group } from 'three';
import * as THREE from 'three';
import { useGameStore } from '../../../app/providers/StoreProvider'; // パスを修正
import { getPositionFromCoords } from '../../../shared/lib/coords';
import type { CardDefinition } from '../../../shared/types/data';

interface PreviewPieceProps {
	card: CardDefinition;
	position: { x: number; y: number };
	boardRef: React.RefObject<Group | null>;
}

export const PreviewPiece: React.FC<PreviewPieceProps> = ({ card, position, boardRef }) => {
	const { setPreviewPlacement } = useGameStore(); // store名を変更
	const { size, camera, raycaster } = useThree();

	const bind = useGesture({
		onDrag: ({ xy: [px, py], event }) => {
			event.stopPropagation();
			if (!boardRef.current) return;

			const pointer = new THREE.Vector2((px / size.width) * 2 - 1, -(py / size.height) * 2 + 1);
			raycaster.setFromCamera(pointer, camera);
			const intersects = raycaster.intersectObjects(boardRef.current.children, true);
			const intersectedCell = intersects.find(i => i.object.name.startsWith('cell-plane'))?.object.parent?.userData?.cell;
			if (intersectedCell) {
				setPreviewPlacement({ x: intersectedCell.x, y: intersectedCell.y });
			}
		},
	}, { drag: { filterTaps: true } });

	const pieceColor = card.cardType === 'alien' ? '#C62828' : card.cardType === 'eradication' ? '#4a82a2' : '#579d5b';

	return (
		<group position={getPositionFromCoords(position.x, position.y)} {...bind()}>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
				<boxGeometry args={[0.9, 0.9, 0.2]} />
				<meshStandardMaterial color={pieceColor} transparent opacity={0.7} emissive={'#FFD700'} emissiveIntensity={0.5} />
			</mesh>
		</group>
	);
};