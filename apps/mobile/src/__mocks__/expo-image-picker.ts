// Mock do expo-image-picker
export const MediaTypeOptions = {
  Images: 'images',
  Videos: 'videos',
  All: 'all',
};

export const requestMediaLibraryPermissionsAsync = jest.fn().mockResolvedValue({
  status: 'granted',
  granted: true,
  canAskAgain: true,
  expires: 'never',
});

export const launchImageLibraryAsync = jest.fn().mockResolvedValue({
  canceled: false,
  assets: [
    {
      uri: 'file:///test/image.jpg',
      width: 100,
      height: 100,
      type: 'image',
    },
  ],
});

export const launchCameraAsync = jest.fn().mockResolvedValue({
  canceled: false,
  assets: [
    {
      uri: 'file:///test/photo.jpg',
      width: 100,
      height: 100,
      type: 'image',
    },
  ],
});

