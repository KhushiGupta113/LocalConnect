import * as ImagePicker from 'expo-image-picker';

export async function pickPhoto(): Promise<
  { uri: string } | { error: string } | { canceled: true }
> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return { error: 'Photo access is off. Allow it in system settings to attach an image.' };
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.7,
  });
  if (result.canceled) {
    return { canceled: true };
  }
  const uri = result.assets[0]?.uri;
  if (uri === undefined) {
    return { error: 'That photo could not be read. Try another image.' };
  }
  return { uri };
}
