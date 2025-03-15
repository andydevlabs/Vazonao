import { Image } from 'expo-image';
import { StyleSheet, View, Text } from 'react-native';
import { Track } from '../types/track';

const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

interface Props {
    track: Track;
}

export default function TrackItem({ track }: Props) {
    return (
        <View style={styles.container}>
            <Image
                style={styles.image}
                source={track.coverUrl}
                placeholder={{ blurhash }}
                contentFit="cover"
                transition={1000}
            />
            <Text style={styles.title}>{track.title}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgb(56, 144, 196)',
        display: 'flex',
        flexDirection: 'row'
    },
    image: {
        height: 60,
        width: 60,
        backgroundColor: '#0553',
    },
    title: {
        fontSize: 16,
        paddingLeft: 10
    },
});