import { FlashList } from "@shopify/flash-list"
import { Text } from "react-native"

export default function TracksList() {
    const DATA = [
        {
            title: "First Item",
        },
        {
            title: "Second Item",
        },
    ];
    
    return (
        <>
            <FlashList
                data={DATA}
                renderItem={({ item }) => <Text>{item.title}</Text>}
                estimatedItemSize={200}
            />
        </>
    )
}