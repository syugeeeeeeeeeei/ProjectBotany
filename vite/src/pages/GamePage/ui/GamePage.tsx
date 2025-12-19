import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useGameStore } from '../../../app/providers/StoreProvider';
import cardMasterData from '../../../entities/card/model/cardMasterData';
import { duplicateCardsWithInstanceId } from '../../../entities/card/model/cards';
import { TIMERS } from '../../../shared/config/gameConfig';
import { GameBoard3D } from '../../../widgets/GameBoard';
import { UIOverlay } from '../../../widgets/GameUIOverlay';
import { PlayerHand } from '../../../widgets/PlayerHand';
import { SideControlPanel } from '../../../widgets/SideControlPanel';

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #50342b;
`;

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
`;

const SidePanel = styled.div<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 120px;
  padding: 0 10px;
  z-index: 10;
  ${props => props.$side === 'left' ? 'left: 5px; transform: translateY(-50%) rotate(180deg);' : 'right: 5px;'}
`;

export const GamePage: React.FC = () => {
	const store = useGameStore();
	const [isGameStarted, setIsGameStarted] = useState(false);
	const [showBanner, setShowBanner] = useState(false);

	// カードデータの準備
	const { alienCards, nativeCards } = useMemo(() => {
		const alien = cardMasterData.filter(c => c.cardType === 'alien');
		const native = cardMasterData.filter(c => c.cardType !== 'alien');
		return {
			alienCards: duplicateCardsWithInstanceId(alien),
			nativeCards: duplicateCardsWithInstanceId(native)
		};
	}, []);

	// ターン開始演出
	useEffect(() => {
		if (!isGameStarted || store.isGameOver) return;
		setShowBanner(true);
		const timer = setTimeout(() => setShowBanner(false), TIMERS.TURN_BANNER_DURATION);
		return () => clearTimeout(timer);
	}, [store.activePlayerId, store.currentTurn, isGameStarted]);

	const getOverlayProps = (playerId: 'alien' | 'native') => {
		const isMyTurn = store.activePlayerId === playerId;
		if (!isGameStarted) return { show: true, message: 'Project Botany', buttonText: 'Start Game', onButtonClick: () => setIsGameStarted(true) };
		if (store.isGameOver) {
			const result = store.winningPlayerId === playerId ? '勝利！' : store.winningPlayerId === null ? '引き分け' : '敗北';
			return { show: true, message: 'Game Over', subMessage: result, buttonText: 'Play Again', onButtonClick: () => { store.resetGame(); setIsGameStarted(true); } };
		}
		if (showBanner && isMyTurn) return { show: true, message: `Your Turn\n(Turn ${store.currentTurn})` };
		if (store.notification && store.notification.forPlayer === playerId) return { show: true, message: store.notification.message, isDismissible: true };
		return { show: false, message: '' };
	};

	return (
		<PageContainer>
			<UIOverlay {...getOverlayProps('alien')} side="bottom" onDismiss={() => store.setNotification(null)} />
			<UIOverlay {...getOverlayProps('native')} side="top" onDismiss={() => store.setNotification(null)} />

			<SidePanel $side="right">
				<SideControlPanel player="alien" />
			</SidePanel>
			<SidePanel $side="left">
				<SideControlPanel player="native" />
			</SidePanel>

			<CanvasContainer>
				<Canvas shadows camera={{ position: [0, 15, 14], fov: 70 }}>
					<ambientLight intensity={0.8} />
					<directionalLight position={[10, 10, 5]} intensity={1} />
					<GameBoard3D fieldState={store.gameField} />

					<PlayerHand
						player="alien"
						cards={alienCards}
						isVisible={isGameStarted && store.activePlayerId === 'alien' && !store.selectedCardId}
						currentPage={0}
						onPageChange={() => { }}
						isInteractionLocked={!!store.selectedCardId}
					/>
					<PlayerHand
						player="native"
						cards={nativeCards}
						isVisible={isGameStarted && store.activePlayerId === 'native' && !store.selectedCardId}
						currentPage={0}
						onPageChange={() => { }}
						isInteractionLocked={!!store.selectedCardId}
					/>

					<OrbitControls enableZoom={false} enableRotate={false} enablePan={false} />
				</Canvas>
			</CanvasContainer>
		</PageContainer>
	);
};