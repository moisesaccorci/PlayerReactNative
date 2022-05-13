import Slider from '@react-native-community/slider';
import React, { useState, useEffect, useRef } from 'react';

import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
    Dimensions,
    TouchableOpacity,
    Image,
    FlatList,
    Animated
} from 'react-native';
import TrackPlayer, {
    Capability,
    Event,
    RepeatMode,
    State,
    usePlaybackState,
    useProgress,
    useTrackPlayerEvents
} from 'react-native-track-player';
import Ionicons from 'react-native-vector-icons/Ionicons';

import musics from '../examples/data';

const { width, height } = Dimensions.get('window')

const setupPlayer = async() => {
    await TrackPlayer.setupPlayer()

    await TrackPlayer.add(musics)
}

const togglePlayback = async(playbackState) => {
    const currentTrack = await TrackPlayer.getCurrentTrack()

    if(currentTrack !== null) {
        if( playbackState == State.Paused) {
            await TrackPlayer.play()
        } else {
            await TrackPlayer.pause()
        }
    }
}

const MusicPlayer = () => {
    const playbackState = usePlaybackState()
    const progress = useProgress()
    const RolarX = useRef(new Animated.Value(0)).current

    const [musicIndex, setMusicIndex] = useState(0)

    const musicSlider = useRef(null)

    const [repeatMode, setRepeatMode] = useState('off')

    const [trackImage, setTrackImage] = useState()
    const [trackArtist, setTrackArtist] = useState()
    const [trackTitle, setTrackTitle] = useState()


    const nextMusic = async(trackId) => {
        await TrackPlayer.skip(trackId)
    }

    useEffect(() => {
        setupPlayer()
        RolarX.addListener(({ value }) => {
            //    console.log('RolarX ', RolarX)
            //    console.log('Device Width ', width)
            const index = Math.round(value / width)
            nextMusic(index)
            setMusicIndex(index)
            //    console.log('index ', index)
        })

        return () => {
            RolarX.removeAllListeners()
        }
    }, [])
    const NextMusic = () => {
        musicSlider.current.scrollToOffset({
            offset: (musicIndex + 1) * width
        })
    }

    const PreviouMusic = () => {
        musicSlider.current.scrollToOffset({
            offset: (musicIndex - 1) * width
        })
    }

    const playRepeatMode = () => {
        if(repeatMode == 'off') {
            TrackPlayer.setRepeatMode(RepeatMode.Track)
            setRepeatMode('track')
        }
        if(repeatMode == 'track') {
            TrackPlayer.setRepeatMode(RepeatMode.Off)
            setRepeatMode('off')
        }
    }

    useTrackPlayerEvents([Event.PlaybackTrackChanged], async event => {
        if( event.type === Event.PlaybackTrackChanged && event.nextTrack !== null) {
            const track = await TrackPlayer.getTrack(event.nextTrack)
            const {title, image, artist} = track
            setTrackArtist(artist)
            setTrackImage(image)
            setTrackTitle(title)
        }
    })

    const musicsRender = ({ index, item }) => {
        return (
            <Animated.View style={{
                width: width,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <View style={styles.ImageWrapper}>
                    <Image
                        source={trackImage}
                        style={styles.imgEdit}
                    />
                </View>
            </Animated.View>

        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.containerPrincipal}>
                <View style={{width: width}}>
                    <Animated.FlatList
                        ref={musicSlider}
                        data={musics}
                        renderItem={musicsRender}
                        keyExtractor={(item) => item.id}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        scrollEventThrottle={16}
                        onScroll={Animated.event(
                            [{
                                nativeEvent: {
                                    contentOffset: { x: RolarX }
                                }
                            }],
                            { useNativeDriver: true }
                        )}
                    />
                </View>
                <View>
                    <Text style={styles.title}>{trackTitle}</Text>
                    <Text style={styles.artista}>{trackArtist}</Text>
                </View>

                <View>
                    <Slider
                        style={styles.progressBar}
                        value={progress.position}
                        minimumValue={0}
                        maximumValue={progress.duration}
                        thumbTintColor='#2B7CB5'
                        minimumTrackTintColor='#2B7CB5'
                        maximumTrackTintColr='#fff'
                        onSlidingComplete={async(value) => {
                            await TrackPlayer.seekTo(value)
                        }}

                    />
                    <View style={styles.progressTxtContainer}>
                        <Text style={styles.progressTxt}>
                            {new Date(progress.position * 1000).toISOString().substr(14, 5)}
                        </Text>
                        <Text style={styles.progressTxt}>
                        {new Date((progress.duration - progress.position) * 1000).toISOString().substr(14, 5)}
                        </Text>
                    </View>
                </View>

                <View style={styles.Controlls}>
                    <TouchableOpacity onPress={PreviouMusic}>
                        <Ionicons name="play-skip-back-outline" size={35} color={'#2B7CB5'} style={styles.button} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => togglePlayback(playbackState)}>
                        <Ionicons name={playbackState == State.Playing ? "ios-pause-circle" : "ios-play-circle"} size={75} color={'#2B7CB5'} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={NextMusic}>
                        <Ionicons name="play-skip-forward-outline" size={35} color={'#2B7CB5'} style={styles.button} />
                    </TouchableOpacity>
                </View>
            </View>


            <View style={styles.bottomContainer}>
                <View style={styles.bottomControls}>
                    <TouchableOpacity onPress={() => { }}>
                        <Ionicons name="heart-outline" size={30} color={'#f5f5f5'} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={playRepeatMode}>
                        <Ionicons name="repeat" size={30} color={repeatMode == 'off' ? '#f5f5f5' : '#2B7CB5'} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { }}>
                        <Ionicons name="share-outline" size={30} color={'#f5f5f5'} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { }}>
                        <Ionicons name="ellipsis-horizontal" size={30} color={'#f5f5f5'} />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D2536',
    },

    containerPrincipal: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    ImageWrapper: {
        width: 300,
        height: 300,
        marginBottom: 25,

        shadowColor: '#ccc',
        shadowOffset: {
            width: 5,
            height: 5
        },
        shadowOpacity: 0.5,
        shadowRadius: 3.9,

        elevation: 5,
    },
    imgEdit: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#f5f5f5'

    },
    artista: {
        fontSize: 16,
        fontWeight: '200',
        textAlign: 'center',
        color: '#EEEEEE'
    },
    progressBar: {
        width: 350,
        height: 40,
        marginTop: 25,
        flexDirection: 'row'
    },
    progressTxtContainer: {
        width: 340,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    progressTxt: {
        color: '#fff'
    },
    Controlls: {
        flexDirection: 'row',
        width: '60%',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    button: {
        marginTop: 20
    },
    bottomContainer: {
        borderTopColor: '#1C5075',
        borderTopWidth: 1,
        width: width,
        alignItems: 'center',
        paddingVertical: 15
    },
    bottomControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: ' 80%'
    },

})

export default MusicPlayer;