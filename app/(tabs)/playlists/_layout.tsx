import { headerOptions } from '@/constants/layout'
import { Stack } from 'expo-router'

export default function PlaylistsLayout() {
	return (
		<>
			<Stack>
				<Stack.Screen name="index" options={{ 
					title: 'Playlists',
					...headerOptions }} />
			</Stack>
		</>
	)
}
