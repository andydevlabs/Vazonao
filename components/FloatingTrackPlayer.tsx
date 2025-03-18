import { Pressable, StyleSheet, Text, View } from "react-native";
import { PlayPauseButton, SkipToNextButton } from "./TrackControllerButton";
import TrackPlayer, { useTrackPlayerEvents, Event, State, useActiveTrack } from 'react-native-track-player';
import { useState, useEffect } from 'react'

export default function FloatingTrackPlayer() {
    const activeTrack = useActiveTrack();
    const [trackTitle, setTrackTitle] = useState<string>('No track playing');

    useEffect(() => {
        setTrackTitle(activeTrack?.title || 'No track playing');
    }, [activeTrack]);

    return (
        <Pressable onPress={() => { }} style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>{trackTitle}</Text>
                <View style={styles.controls}>
                    <PlayPauseButton />
                    <SkipToNextButton />
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        alignSelf: 'center',
        width: '94%',
        height: '19%',
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderTopStartRadius: 30,
        borderTopEndRadius: 30,
    },
    content: {
        backgroundColor: '#5D8AA8',
        height: '48%',
        borderBottomStartRadius: 32,
        borderBottomEndRadius: 32,
        borderWidth: 2,
        borderColor: 'rgba(93, 138, 168, 0.86)',
        overflow: 'hidden',
        paddingHorizontal: 16,
        paddingVertical: 8,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    controls: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    title: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        maxWidth: '60%'
    }
});