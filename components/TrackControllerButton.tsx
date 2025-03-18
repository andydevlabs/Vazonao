import { Pressable, StyleSheet, View } from "react-native";
import TrackPlayer, { useIsPlaying, useActiveTrack } from "react-native-track-player";
import { Ionicons } from '@expo/vector-icons'

export const PlayPauseButton = () => {
    const { playing } = useIsPlaying();
    const activeTrack = useActiveTrack();

    const handlePlayPress = async () => {
        try {
            if (!activeTrack) return;
            if (playing) {
                await TrackPlayer.pause();
            } else {
                await TrackPlayer.play();
            }
        } catch (error) {
            console.error('Error handling play/pause:', error);
        }
    };

    return (
        <View>
            <Pressable onPress={handlePlayPress} style={styles.container}>
                <Ionicons 
                    name={(!activeTrack || !playing) ? 'play' : 'pause'} 
                    size={34} 
                />
            </Pressable>
        </View>
    );
};

export const SkipToNextButton = () => {
    return (
        <View>
            <Pressable onPress={() => TrackPlayer.skipToNext()} style={styles.container}>
                <Ionicons name={"play-forward"} size={32} />
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 'auto',
        width: 'auto',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 4
    }
})