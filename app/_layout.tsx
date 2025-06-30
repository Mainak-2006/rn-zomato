import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { Slot } from 'expo-router'
import "../global.css"
import { CartProvider } from '../components/CartContext'

export default function RootLayout() {
  return (
    <CartProvider>
      <ClerkProvider tokenCache={tokenCache}>
        <Slot />
      </ClerkProvider>
    </CartProvider>
  )
}