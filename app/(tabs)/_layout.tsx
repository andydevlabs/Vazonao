import { Tabs } from 'expo-router'
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'
import FloatingTrackPlayer from '@/components/FloatingTrackPlayer'

export default function TabLayout() {
	return (
		<>			
			<Tabs
				screenOptions={{
					headerShown: false,
					tabBarHideOnKeyboard: true,
					tabBarActiveTintColor: '#000',
					tabBarInactiveTintColor: '#000',
					tabBarLabelStyle: {
						display: 'flex',
						fontSize: 11,
					},
					tabBarStyle: {
						position: 'absolute',
						borderTopWidth: 0,
						borderRadius: 30,
						paddingTop: 6,
						marginBottom: 10,
						marginHorizontal: 10,
						backgroundColor: '#c9df8a',
						height: '8.5%',
						display: 'flex',
						justifyContent: 'space-evenly',
						zIndex: 1
					},
				}}
			>
				<Tabs.Screen name="(songs)" options={{
					title: "Songs",
					tabBarIcon: ({ color, focused }) => (
						<Ionicons
							name={focused ? "musical-notes" : "musical-notes-outline"}
							color={color}
							size={26}
							style={{
								marginTop: 3
							}}
						/>
					)
				}} />
				<Tabs.Screen name="playlists" options={{
					title: "Playlists",
					tabBarIcon: ({ color, focused }) => (
						<MaterialCommunityIcons
							name={focused ? "playlist-music" : "playlist-music-outline"}
							color={color}
							size={26}
							style={{
								marginTop: 3
							}}
						/>
					)
				}} />
				<Tabs.Screen name="favorites" options={{
					title: "Favorites",
					tabBarIcon: ({ color, focused }) => (
						<Ionicons
							name={focused ? "heart" : "heart-outline"}
							color={color}
							size={26}
							style={{
								marginTop: 3
							}}
						/>
					)
				}} />
				<Tabs.Screen name="artists" options={{
					title: "Artists",
					tabBarIcon: ({ color, focused }) => (
						<MaterialCommunityIcons
							name={focused ? "account-music" : "account-music-outline"}
							color={color}
							size={26}
							style={{
								marginTop: 3
							}}
						/>
					)
				}} />
			</Tabs>
			<FloatingTrackPlayer />
		</>
	)
}
