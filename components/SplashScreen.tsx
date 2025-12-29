import React from 'react';
import { StyleSheet, Image, View } from 'react-native';
import { Theme } from '@/constants/Theme';

export default function SplashScreen() {
    return (
        <View style={styles.container}>
            <Image
                source={require('@/assets/images/icon.png')}
                style={styles.logo}
                resizeMode="contain"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 250, // Slightly larger for a premium feel
        height: 250,
    },
});
