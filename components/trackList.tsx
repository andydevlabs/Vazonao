import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import coverArtPlaceholder from '@/assets/placeholder-album.png';
import { AudioAsset } from '../types/audioAsset';

const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';


export default function TrackList() {
    const [audioFiles, setAudioFiles] = useState<AudioAsset[]>([]);

    useEffect(() => {
        MediaLibrary.requestPermissionsAsync()
            .then(({ granted }) => {
                if (granted) {
                    return MediaLibrary.getAssetsAsync({ mediaType: 'audio', first: 1000 });
                }
                throw new Error('Permission required');
            })
            .then(media => {
                const audioAssets = media.assets.map(asset => ({
                    id: asset.id,
                    filename: asset.filename,
                    uri: asset.uri,
                    duration: asset.duration,
                    albumCover: coverArtPlaceholder,
                }));
                setAudioFiles(audioAssets);
            })
            .catch(console.error);
    }, []);

    const renderItem = ({ item }: { item: AudioAsset }) => {
        const minutes = Math.floor(item.duration / 60);
        const seconds = Math.floor(item.duration % 60);
        const formattedSeconds = seconds.toString().padStart(2, '0');
        const formattedDuration = `${minutes}:${formattedSeconds}`;

        return (
            <Pressable
                onPress={() => console.log('Pressed:', item.filename)}
                style={({ pressed }) => [
                    styles.itemContainer,
                    pressed && { backgroundColor: 'rgba(0, 0, 0, 0.03)' }
                ]}
            >
                <Image
                    source={item.albumCover}
                    style={styles.albumCover}
                    placeholder={{ blurhash }}
                    contentFit="cover"
                    transition={300}
                />
                <View style={styles.textContainer}>
                    <Text style={styles.filename}>{item.filename}</Text>
                    <Text style={styles.duration}>{formattedDuration}</Text>
                </View>
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <FlashList
                data={audioFiles}
                renderItem={renderItem}
                estimatedItemSize={70}
                keyExtractor={item => item.id}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    pressable: {
        flex: 1
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    itemContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        alignItems: 'center',
    },
    albumCover: {
        width: 50,
        height: 50,
        borderRadius: 4,
        marginRight: 12,
        backgroundColor: '#f0f0f0',
    },
    textContainer: { flex: 1 },
    filename: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    duration: {
        fontSize: 14,
        color: '#666',
    },
});
