import { View, Text, Pressable, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

// Import your screen components
import Index from './index'
import Explore from './explore'
import Orders from './orders'
import Profile from './profile'

const { width } = Dimensions.get('window')

interface TabItem {
  key: string
  label: string
  icon: string
  component: React.ComponentType<any>
}

const tabs: TabItem[] = [
  { key: 'home', label: 'Home', icon: '🏠', component: Index },
  { key: 'explore', label: 'Explore', icon: '🔍', component: Explore },
  { key: 'orders', label: 'Orders', icon: '📋', component: Orders },
  { key: 'profile', label: 'Profile', icon: '👤', component: Profile },
]

export default function Layout() {
  const [activeTab, setActiveTab] = useState<string>('home')
  const insets = useSafeAreaInsets()

  const ActiveComponent = tabs.find(tab => tab.key === activeTab)?.component || Index

  // Create a function to switch to explore tab
  const navigateToExplore = () => {
    setActiveTab('explore')
  }
  const navigateToOrders = () => {
    setActiveTab('orders')
  }

  return (
    <SafeAreaView className="flex-1 bg-default">
      {/* Screen Content */}
      <View className="flex-1">
        <ActiveComponent
          {...(ActiveComponent === Profile
            ? { navigateToOrders, navigateToExplore }
            : { navigateToExplore, navigateToOrders })}
        />
      </View>

      {/* Floating Tab Bar - Adjusted for system UI */}
      <View 
        className="absolute left-4 right-4"
        style={{ 
          bottom: Math.max(insets.bottom + 12, 16) // Ensures proper spacing above system UI
        }}
      >
        <View className="bg-orange-300 rounded-2xl shadow-lg shadow-black/20 elevation-10">
          <View className="flex-row justify-around items-center py-3 px-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  className={`flex-1 items-center justify-center py-2 px-3 rounded-xl mx-1 ${
                    isActive ? 'bg-orange-500' : 'bg-white'
                  }`}
                  style={{
                    minHeight: 56,
                    shadowColor: isActive ? '#000' : 'transparent',
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: isActive ? 0.1 : 0,
                    shadowRadius: 3.84,
                    elevation: isActive ? 5 : 0,
                  }}
                >
                  <Text className="text-2xl mb-1">{tab.icon}</Text>
                  <Text 
                    className={`text-xs font-semibold ${
                      isActive ? 'text-white' : 'text-black'
                    }`}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>
      </View>
    </SafeAreaView>
  )}