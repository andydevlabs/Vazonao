import { useEffect, useRef, useState } from 'react'
import TrackPlayer, { Capability, RatingType, RepeatMode } from 'react-native-track-player'

const setupPlayer = async () => {
    try {
        await TrackPlayer.setupPlayer({
            maxCacheSize: 1024 * 10,
        })

        await TrackPlayer.updateOptions({
            ratingType: RatingType.Heart,
            capabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.SkipToNext,
                Capability.SkipToPrevious,
                Capability.Stop
            ],
        })
        await TrackPlayer.setRepeatMode(RepeatMode.Queue)
    } catch (error) {
        console.log('Error setting up player:', error)
    }
}

export const useSetupTrackPlayer = ({ onLoad }: { onLoad?: () => void }) => {
    const isInitialized = useRef(false)
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        if (isInitialized.current) return

        setupPlayer()
            .then(() => {
                isInitialized.current = true
                setIsReady(true)
                onLoad?.()
            })
            .catch((error) => {
                isInitialized.current = false
                console.error(error)
                // Don't call onLoad on error
            })
    }, [onLoad])

    return { isReady }
}
