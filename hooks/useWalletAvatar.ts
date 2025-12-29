import { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';

export const useWalletAvatar = (walletAddress: string | undefined | null) => {
    const [avatarUri, setAvatarUri] = useState<string | null>(null);

    useEffect(() => {
        if (!walletAddress) {
            setAvatarUri(null);
            return;
        }

        const filename = `avatar_${walletAddress}.png`;
        const localUri = `${FileSystem.documentDirectory}${filename}`;

        const checkAndDownload = async () => {
            try {
                const fileInfo = await FileSystem.getInfoAsync(localUri);
                if (fileInfo.exists) {
                    setAvatarUri(localUri);
                } else {
                    const remoteUri = `https://api.dicebear.com/7.x/identicon/png?seed=${walletAddress}`;
                    await FileSystem.downloadAsync(remoteUri, localUri);
                    setAvatarUri(localUri);
                }
            } catch (e) {
                console.error("Error loading avatar:", e);
                // Fallback to remote if local fails
                setAvatarUri(`https://api.dicebear.com/7.x/identicon/png?seed=${walletAddress}`);
            }
        };

        checkAndDownload();
    }, [walletAddress]);

    return avatarUri;
};
