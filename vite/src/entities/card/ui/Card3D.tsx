import { Image, Text } from '@react-three/drei';
import React from 'react';
import type { CardDefinition } from '../../../shared/types/data';

interface Card3DProps {
	card: CardDefinition;
	isSelected?: boolean;
	onClick?: () => void;
	opacity?: number;
}

export const Card3D: React.FC<Card3DProps> = ({ card, isSelected, onClick, opacity = 1 }) => {
	return (
		<group onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
			{/* カード本体 */}
			<mesh castShadow receiveShadow>
				<boxGeometry args={[2, 3, 0.05]} />
				<meshStandardMaterial
					color={isSelected ? "#fff59d" : "#ffffff"}
					transparent
					opacity={opacity}
				/>
			</mesh>

			{/* カード名 */}
			<Text
				position={[0, 1.2, 0.03]}
				fontSize={0.2}
				color="#333"
				anchorX="center"
				anchorY="middle"
				font="/MPLUS1p-Bold.ttf"
			>
				{card.name}
			</Text>

			{/* コスト表示 */}
			<group position={[-0.7, 1.2, 0.04]}>
				<mesh>
					<circleGeometry args={[0.2, 32]} />
					<meshBasicMaterial color="#3f51b5" />
				</mesh>
				<Text fontSize={0.2} color="white" position={[0, 0, 0.01]}>
					{card.cost}
				</Text>
			</group>

			{/* 植物画像 */}
			<Image
				url={card.imagePath}
				position={[0, 0.1, 0.03]}
				scale={[1.6, 1.6]}
				transparent
				opacity={opacity}
			/>

			{/* 説明文 */}
			<Text
				position={[0, -1, 0.03]}
				fontSize={0.12}
				color="#555"
				maxWidth={1.8}
				lineHeight={1.2}
				font="/MPLUS1p-Regular.ttf"
			>
				{card.description}
			</Text>
		</group>
	);
};