import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { t } from './i18n';

// Small embedded JPEGs also work offline and travel with shared list operations.
export async function chooseProductPhoto(): Promise<string | undefined> {
  const selection = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 1,
  });
  if (selection.canceled) return;
  const asset = selection.assets[0];
  const longest = Math.max(asset.width, asset.height);
  const ratio = Math.min(1, 240 / longest);
  const result = await ImageManipulator.manipulateAsync(
    asset.uri,
    [
      {
        resize: {
          width: Math.max(1, Math.round(asset.width * ratio)),
          height: Math.max(1, Math.round(asset.height * ratio)),
        },
      },
    ],
    { compress: 0.65, format: ImageManipulator.SaveFormat.JPEG, base64: true },
  );
  const image = `data:image/jpeg;base64,${result.base64 || ''}`;
  if (!result.base64 || image.length > 60000)
    throw new Error(t('La imagen es demasiado grande. Prueba con otra foto.'));
  return image;
}
