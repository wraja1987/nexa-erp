import AsyncStorage from '@react-native-async-storage/async-storage'

export async function saveDraft(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(`draft:${key}`, JSON.stringify(value))
}

export async function loadDraft<T = unknown>(key: string): Promise<T | null> {
  const v = await AsyncStorage.getItem(`draft:${key}`)
  return v ? (JSON.parse(v) as T) : null
}


