import { PlaybackService } from 'services/TrackPlayerService'
import { SplashScreen, Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import TrackPlayer from 'react-native-track-player';
import { useSetupTrackPlayer } from '@/hooks/useSetupTrackPlayer';

SplashScreen.preventAutoHideAsync()

TrackPlayer.registerPlaybackService(() => PlaybackService);

export default function RootLayout() {
	useSetupTrackPlayer({
		onLoad: () => {
			SplashScreen.preventAutoHideAsync()
		},
	})
	
	return (
		<>
			<Stack>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			</Stack>
			<StatusBar style="auto" />
		</>
	)
}
