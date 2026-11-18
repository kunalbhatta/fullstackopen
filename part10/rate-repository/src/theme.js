import { Platform, StyleSheet } from 'react-native'

export const colors = { surface: '#ffffff', background: '#e9eeeb', text: '#1a332b', muted: '#476056', accent: '#1e654d', error: '#932f26' }

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  text: { color: colors.text, fontFamily: Platform.select({ ios: 'System', android: 'Roboto', default: 'system-ui' }), fontSize: 15 },
  title: { fontSize: 20, fontWeight: '700' },
  muted: { color: colors.muted },
  appBar: { backgroundColor: '#14352a', paddingTop: Platform.OS === 'android' ? 26 : 12 },
  navigation: { minHeight: 56, alignItems: 'center', gap: 15, paddingHorizontal: 15 },
  navLink: { color: 'white', fontWeight: '700', paddingVertical: 10 },
  card: { backgroundColor: colors.surface, margin: 8, borderRadius: 9, padding: 15, gap: 8 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  avatar: { width: 46, height: 46, borderRadius: 8 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 17, justifyContent: 'space-between', marginTop: 7 },
  stat: { alignItems: 'center' },
  label: { color: 'white', backgroundColor: colors.accent, padding: 5, borderRadius: 5, alignSelf: 'flex-start' },
  input: { color: colors.text, padding: 10, borderWidth: 1, borderColor: '#88a298', borderRadius: 6, marginBottom: 4 },
  button: { backgroundColor: colors.accent, padding: 11, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '700' },
  error: { color: colors.error, paddingVertical: 4 },
  rating: { minWidth: 44, color: colors.accent, fontWeight: '700', borderColor: colors.accent, borderWidth: 2, borderRadius: 22, padding: 8, textAlign: 'center' },
})
