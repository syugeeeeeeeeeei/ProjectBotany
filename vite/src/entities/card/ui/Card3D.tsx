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

			{/* カード名 - 位置とフォントを微調整 */}
			<Text
				position={[0, 1.25, 0.03]}
				fontSize={0.22}
				color="#212121"
				anchorX="center"
				anchorY="middle"
				font="/MPLUS1p-Bold.ttf"
			>
				{card.name}
			</Text>

			{/* コスト表示 - 元のデザインに準拠 */}
			<group position={[-0.7, 1.25, 0.04]}>
				<mesh>
					<circleGeometry args={[0.22, 32]} />
					<meshBasicMaterial color="#303f9f" />
				</mesh>
				<Text fontSize={0.2} color="white" position={[0, 0, 0.01]} font="/MPLUS1p-Bold.ttf">
					{card.cost}
				</Text>
			</group>

			{/* 植物画像 - ボヤけ防止のため解像度設定を意識 */}
			<Image
				url={card.imagePath}
				position={[0, 0.15, 0.03]}
				scale={[1.7, 1.7]}
				transparent
				opacity={opacity}
			/>

			{/* 説明文 - 行間と幅を修正 */}
			<Text
				position={[0, -0.95, 0.03]}
				fontSize={0.13}
				color="#424242"
				maxWidth={1.8}
				lineHeight={1.4}
				font="/MPLUS1p-Regular.ttf"
			>
				{card.description}
			</Text>
		</group>
	);
};