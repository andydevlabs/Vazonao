import { Tabs } from 'expo-router'

export default function TabLayout() {
	return (
		<>
			<Tabs
				screenOptions={{
					headerShown: false
				}}
			>
				<Tabs.Screen name="(songs)" />
				<Tabs.Screen name="playlists" />
				<Tabs.Screen name="favorites" />
				<Tabs.Screen name="artists" />
			</Tabs>
		</>
	)
}
