import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { APP_CONFIG } from '@lib/constants/config';

export interface ImageAsset {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export const useCamera = () => {
  const [loading, setLoading] = useState(false);

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Camera permission is required to take photos.',
          [{ text: 'OK' }]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Camera permission error:', error);
      return false;
    }
  };

  const requestMediaLibraryPermission = async (): Promise<boolean> => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Media library permission is required to select photos.',
          [{ text: 'OK' }]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Media library permission error:', error);
      return false;
    }
  };

  const takePhoto = async (): Promise<ImageAsset | null> => {
    setLoading(true);

    try {
      const hasPermission = await requestCameraPermission();

      if (!hasPermission) {
        setLoading(false);
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      setLoading(false);

      if (result.canceled) {
        return null;
      }

      const asset = result.assets[0];

      // Check file size
      if (asset.fileSize && asset.fileSize > APP_CONFIG.limits.maxImageSize) {
        Alert.alert(
          'File Too Large',
          `Image size must be less than ${APP_CONFIG.limits.maxImageSize / (1024 * 1024)}MB`,
          [{ text: 'OK' }]
        );
        return null;
      }

      return {
        uri: asset.uri,
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        type: asset.type || 'image/jpeg',
        size: asset.fileSize,
      };
    } catch (error) {
      console.error('Take photo error:', error);
      setLoading(false);
      return null;
    }
  };

  const selectImage = async (): Promise<ImageAsset | null> => {
    setLoading(true);

    try {
      const hasPermission = await requestMediaLibraryPermission();

      if (!hasPermission) {
        setLoading(false);
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      setLoading(false);

      if (result.canceled) {
        return null;
      }

      const asset = result.assets[0];

      // Check file size
      if (asset.fileSize && asset.fileSize > APP_CONFIG.limits.maxImageSize) {
        Alert.alert(
          'File Too Large',
          `Image size must be less than ${APP_CONFIG.limits.maxImageSize / (1024 * 1024)}MB`,
          [{ text: 'OK' }]
        );
        return null;
      }

      return {
        uri: asset.uri,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        type: asset.type || 'image/jpeg',
        size: asset.fileSize,
      };
    } catch (error) {
      console.error('Select image error:', error);
      setLoading(false);
      return null;
    }
  };

  const selectMultipleImages = async (maxImages: number = 5): Promise<ImageAsset[]> => {
    setLoading(true);

    try {
      const hasPermission = await requestMediaLibraryPermission();

      if (!hasPermission) {
        setLoading(false);
        return [];
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: maxImages,
      });

      setLoading(false);

      if (result.canceled) {
        return [];
      }

      const validAssets: ImageAsset[] = [];

      for (const asset of result.assets) {
        // Check file size
        if (asset.fileSize && asset.fileSize > APP_CONFIG.limits.maxImageSize) {
          Alert.alert(
            'File Too Large',
            `Some images exceed ${APP_CONFIG.limits.maxImageSize / (1024 * 1024)}MB and were skipped`,
            [{ text: 'OK' }]
          );
          continue;
        }

        validAssets.push({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}_${validAssets.length}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize,
        });
      }

      return validAssets;
    } catch (error) {
      console.error('Select multiple images error:', error);
      setLoading(false);
      return [];
    }
  };

  return {
    loading,
    takePhoto,
    selectImage,
    selectMultipleImages,
  };
};