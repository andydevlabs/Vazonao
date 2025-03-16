import { headerOptions } from '@/constants/layout'
import { Stack } from 'expo-router'

export default function HomeSongLayout() {
	return (
		<>
			<Stack>
				<Stack.Screen name="index" options={{
					title: 'Songs',
					...headerOptions
				}}
				/>
			</Stack>
		</>
	)
}

