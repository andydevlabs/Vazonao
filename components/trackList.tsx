import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { getAssetsAsync, requestPermissionsAsync } from 'expo-music-library';
import { AudioAsset } from '@/types/audioAsset';
import placeholderAlbum from '../assets/placeholder-album.png';
import TrackPlayer, { Track } from 'react-native-track-player';
import { getAudioMetadata } from '@missingcore/audio-metadata';

type MetadataResponse = {
    album?: string;
    albumArtist?: string;
    artist?: string;
    name?: string;
    track?: string;
    year?: string;
    artwork?: string;
};

const BATCH_SIZE = 5;
const BATCH_DELAY = 10;
const ARTWORK_CACHE_KEY = 'artwork_cache_data';
const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const wantedTags = ['album', 'albumArtist', 'artist', 'name', 'track', 'year'] as const;

export default function TrackList() {
    const [audioFiles, setAudioFiles] = useState<AudioAsset[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [loadedArtwork, setLoadedArtwork] = useState<Set<string>>(new Set());
    const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50, minimumViewTime: 300 });

    const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: Array<{ item: AudioAsset }> }) => {
        setLoadedArtwork(new Set(viewableItems.map(item => item.item?.id)));
    }, []);

    useEffect(() => {
        const loadCachedArtworkData = async () => {
            try {
                const cachedData = await SecureStore.getItemAsync(ARTWORK_CACHE_KEY);
                if (cachedData) setLoadedArtwork(new Set(JSON.parse(cachedData)));
            } catch (error) {
                console.error('Error loading cached artwork:', error);
            }
        };
        loadCachedArtworkData();
    }, []);

    const cacheArtwork = async (artworkUri: string | null, id: string): Promise<string | null> => {
        if (!artworkUri) return null;
        const cacheDir = `${FileSystem.cacheDirectory}artwork/`;
        const localUri = `${cacheDir}${id}.jpg`;

        try {
            const dirInfo = await FileSystem.getInfoAsync(cacheDir);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
            }

            const fileInfo = await FileSystem.getInfoAsync(localUri);
            if (fileInfo.exists) return localUri;

            const artworkInfo = await FileSystem.getInfoAsync(artworkUri);
            if (!artworkInfo.exists) return null;

            await FileSystem.copyAsync({ from: artworkUri, to: localUri });
            setLoadedArtwork(prev => new Set(prev).add(id));
            return localUri;
        } catch (error) {
            console.error(`Error caching artwork for ${id}:`, error);
            return null;
        }
    };

    const loadArtworkForAsset = async (asset: AudioAsset): Promise<void> => {
        if (!asset.artwork || loadedArtwork.has(asset.id)) return;

        try {
            const cachedUri = await cacheArtwork(asset.artwork, asset.id);
            if (cachedUri) {
                setAudioFiles(prev => prev.map(file =>
                    file.id === asset.id ? { ...file, artworkUri: cachedUri } : file
                ));
            }
        } catch (error) {
            console.error(`Error loading artwork for ${asset.filename}:`, error);
        }
    };

    const processArtworkQueue = useCallback(async (assets: AudioAsset[]) => {
        for (let i = 0; i < assets.length; i += BATCH_SIZE) {
            await Promise.all(assets.slice(i, i + BATCH_SIZE).map(loadArtworkForAsset));
            await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
        }
    }, []);

    const processMetadataBatch = async (assets: AudioAsset[]): Promise<AudioAsset[]> => {
        const processedAssets = [];
        for (const asset of assets) {
            try {
                const metadata = await getAudioMetadata(asset.uri, wantedTags) as MetadataResponse;
                console.log(metadata);
                
                processedAssets.push({
                    ...asset,
                    album: metadata?.album || 'Unknown Album',
                    artist: metadata?.artist || asset.artist || 'Unknown Artist',
                    artworkUri: null,
                    artwork: asset.artwork || null
                });

            } catch (error) {
                processedAssets.push({
                    ...asset,
                    album: asset.album || 'Unknown Album',
                    artist: asset.artist || 'Unknown Artist',
                    artworkUri: null,
                    artwork: asset.artwork || null
                });
            }
        }
        return processedAssets;
    };

    const fetchAssets = useCallback(async () => {
        try {
            const { assets } = await getAssetsAsync({ first: 10000 });
            const filteredAssets = assets
                .filter(asset => !asset.filename.toLowerCase().endsWith('.wma'))
                .map(asset => ({
                    ...asset,
                    artworkUri: null, // Add required property
                    album: 'Unknown Album', // Add default values
                    artist: asset.artist || 'Unknown Artist'
                })) as AudioAsset[];

            // Process metadata in batches
            const processedAssets = [];
            for (let i = 0; i < filteredAssets.length; i += BATCH_SIZE) {
                const batch = filteredAssets.slice(i, i + BATCH_SIZE);
                const processedBatch = await processMetadataBatch(batch);
                processedAssets.push(...processedBatch);

                setAudioFiles(current => [...current, ...processedBatch]);
                await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
            }

            setIsLoading(false);
            processArtworkQueue(processedAssets);
        } catch (error) {
            console.error('Error fetching audio assets:', error);
            setIsLoading(false);
        }
    }, [processArtworkQueue]);

    const InitializeTrack = async (selectedTrack: AudioAsset): Promise<void> => {
        await TrackPlayer.reset();
        await TrackPlayer.add({
            id: selectedTrack.id,
            url: selectedTrack.uri,
            title: selectedTrack.filename,
            artist: selectedTrack.artist || 'Unknown Artist',
            artwork: selectedTrack.artworkUri || undefined,
            duration: selectedTrack.duration
        });
        await TrackPlayer.play();
    };

    useEffect(() => {
        requestPermissionsAsync().then(({ status }) => {
            if (status === 'granted') fetchAssets();
        });
    }, [fetchAssets]);

    const filteredAudioFiles = useMemo(() => {
        if (!searchQuery) return audioFiles;
        return audioFiles.filter(file => file.filename.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery, audioFiles]);

    const renderItem = useCallback(({ item }: { item: AudioAsset }) => (
        <Pressable
            onPress={() => InitializeTrack(item)}
            style={({ pressed }) => [styles.itemContainer, pressed && { backgroundColor: '#f0f0f0' }]}
        >
            <Image
                source={item.artworkUri ? { uri: item.artworkUri } : placeholderAlbum}
                style={styles.albumCover}
                placeholder={{ blurhash }}
                contentFit="cover"
                transition={300}
                cachePolicy="memory-disk"
            />
            <View style={styles.textContainer}>
                <Text numberOfLines={1} style={styles.filename}>{item.filename}</Text>
                <Text numberOfLines={1} style={styles.metadata}>{`${item.artist} - ${item.album}`}</Text>
                <Text style={styles.duration}>{`${Math.floor(item.duration / 60)}:${String(Math.floor(item.duration % 60)).padStart(2, '0')}`}</Text>
            </View>
        </Pressable>
    ), []);

    return (
        <View style={styles.container}>
            <TextInput style={styles.searchBar} placeholder="Search songs..." value={searchQuery} onChangeText={setSearchQuery} clearButtonMode="while-editing" />
            <FlashList data={filteredAudioFiles} renderItem={renderItem} estimatedItemSize={70} keyExtractor={item => item.id} onViewableItemsChanged={onViewableItemsChanged} viewabilityConfig={viewabilityConfig.current} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    itemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
    albumCover: { width: 50, height: 50, borderRadius: 4, marginRight: 12, backgroundColor: '#f0f0f0' },
    textContainer: { flex: 1 },
    filename: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
    duration: { fontSize: 14, color: '#666' },
    searchBar: { height: 40, margin: 12, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#f0f0f0', fontSize: 16 },
    metadata: { fontSize: 14, color: '#666', marginBottom: 2 }
});
