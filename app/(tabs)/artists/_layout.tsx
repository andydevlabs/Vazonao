import { Stack } from 'expo-router'

export default function ArtistsLayout() {
	return (
		<>
			<Stack>
				<Stack.Screen name="index" options={{ title: 'Artists' }} />
			</Stack>
		</>
	)
}
