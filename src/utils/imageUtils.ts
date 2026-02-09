import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Compress image for upload
 * Target: quality 0.7, max width 1024px
 */
export async function compressImage(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1024 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}

/**
 * Get file size in KB
 */
export async function getFileSizeKB(uri: string): Promise<number> {
  const response = await fetch(uri);
  const blob = await response.blob();
  return Math.round(blob.size / 1024);
}
