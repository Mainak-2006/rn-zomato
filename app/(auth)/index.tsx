import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthIndex() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 justify-between pt-10 pb-5">
        {/* Logo/Brand Section */}
        <View className="items-center">
          <View className="bg-red-600 px-5 py-3 rounded-lg mb-4">
            <Text className="text-2xl font-bold text-white tracking-wider">ZOMATO</Text>
          </View>
          <Text className="text-lg text-gray-700 text-center font-medium">
            Discover great food around you
          </Text>
        </View>

        {/* Illustration/Image */}
        <View className="items-center justify-center flex-1">
          <View className="w-50 h-50 bg-gray-100 rounded-full items-center justify-center">
            <Text className="text-6xl">🍕</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-4">
          <TouchableOpacity 
            className="bg-red-600 py-4 rounded-xl items-center"
            onPress={() => router.push('/(auth)/login')}
          >
            <Text className="text-white text-base font-semibold">Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-transparent py-4 rounded-xl items-center border border-red-600"
            onPress={() => router.push('/(auth)/register')}
          >
            <Text className="text-red-600 text-base font-semibold">Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <Text className="text-xs text-gray-500 text-center leading-5 mt-5">
          By continuing, you agree to our{' '}
          <Text className="text-red-600 font-medium">Terms of Service</Text> and{' '}
          <Text className="text-red-600 font-medium">Privacy Policy</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}