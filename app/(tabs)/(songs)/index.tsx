import TrackList from '@/components/trackList'
import { StyleSheet, Text, View } from 'react-native'

export default function HomeSongsScreen() {
	return (
		<>
			<View style={styles.container}>
				<TrackList/>
			</View>
		</>
	)
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		height: '100%',
	}
})