import { FlashList } from "@shopify/flash-list"
import { StyleSheet, View } from "react-native"
import TrackItem from "./trackItem";
import { Track } from "../types/track";

export default function TracksList() {
    const DATA: Track[] = [
        {
            id: '1',
            title: "First Track",
            coverUrl: "https://picsum.photos/seed/696/3000/2000"
        },
        {
            id: '2',
            title: "Second Track",
            coverUrl: "https://picsum.photos/seed/697/3000/2000"
        },
        {
            id: '3',
            title: "Second Track",
            coverUrl: "https://picsum.photos/seed/690/3000/2000"
        },
        {
            id: '4',
            title: "Second Track",
            coverUrl: "https://picsum.photos/seed/691/3000/2000"
        },
    ];

    return (
        <View style={styles.container}>
            <FlashList
                data={DATA}
                renderItem={({ item }) => <TrackItem track={item} />}
                estimatedItemSize={200}
                keyExtractor={(item) => item.id}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
    }
})