import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { getAssetsAsync, requestPermissionsAsync } from 'expo-music-library';
import { AudioAsset } from '@/types/audioAsset';
import placeholderAlbum from '../assets/placeholder-album.png';

const BATCH_SIZE = 5;
const BATCH_DELAY = 10;
const ARTWORK_CACHE_KEY = 'artwork_cache_data';
const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export default function TrackList() {
    const [audioFiles, setAudioFiles] = useState<AudioAsset[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [loadedArtwork, setLoadedArtwork] = useState<Set<string>>(new Set());
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
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

    const fetchAssets = useCallback(async () => {
        try {
            const { assets } = await getAssetsAsync({ first: 10000 });
            const filteredAssets = assets.filter(asset => !asset.filename.toLowerCase().endsWith('.wma'))
                .map(asset => ({ ...asset, artworkUri: null, artwork: asset.artwork || null }));

            setAudioFiles(filteredAssets);
            setIsLoading(false);
            processArtworkQueue(filteredAssets);
        } catch (error) {
            console.error('Error fetching audio assets:', error);
            setIsLoading(false);
        }
    }, [processArtworkQueue]);

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
        <Pressable onPress={() => { }} style={({ pressed }) => [styles.itemContainer, pressed && { backgroundColor: '#f0f0f0' }]}>
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
    searchBar: { height: 40, margin: 12, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#f0f0f0', fontSize: 16 }
});
