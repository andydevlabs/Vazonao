import { headerOptions } from '@/constants/layout'
import { Stack } from 'expo-router'

export default function FavoritesLayout() {
	return (
		<>
			<Stack>
				<Stack.Screen name="index" options={{
					title: 'Favorites',
					...headerOptions
				}}
				/>
			</Stack>
		</>
	)
}
