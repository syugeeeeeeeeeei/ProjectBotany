import { useEffect, useState } from 'react';

/**
 * モバイルブラウザのアドレスバーなどを考慮した、実際の画面高さを取得するフック
 */
export const useFullscreenHeight = () => {
	const [height, setHeight] = useState(window.innerHeight);

	useEffect(() => {
		const handleResize = () => setHeight(window.innerHeight);
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return height;
};