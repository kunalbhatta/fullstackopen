import { Pressable, Text, View } from 'react-native'
import { styles } from './theme'

export function Label({ style, children, ...props }) {
  return <Text style={[styles.text, style]} {...props}>{children}</Text>
}

export function Button({ children, onPress, disabled, style }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.button, disabled && { opacity: 0.55 }, style]}>
    <Label style={styles.buttonText}>{children}</Label>
  </Pressable>
}

export function ErrorMessage({ error }) {
  return error ? <Label accessibilityRole="alert" style={styles.error}>{error}</Label> : null
}

export function Card({ children }) {
  return <View style={styles.card}>{children}</View>
}
