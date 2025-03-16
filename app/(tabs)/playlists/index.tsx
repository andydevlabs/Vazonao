import TrackTest from '@/components/trackList'
import { StyleSheet, Text, View } from 'react-native'

export default function PlaylistsScreen() {
	return (
		<>
			<View style={styles.container}>
				<TrackTest/>
			</View>
		</>
	)
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		height: '100%',
		backgroundColor: '#fff'
	}
})