// forgot-password.tsx

import React, { useState } from 'react';
import {
  Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSignIn } from '@clerk/clerk-expo';

export default function ForgotPassword() {
  const { signIn, isLoaded } = useSignIn();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendResetCode = async () => {
    if (!isLoaded || !signIn) return;
    if (!email) return alert('Enter your email');

    setLoading(true);
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      router.push({
        pathname: '/reset-code',
        params: { email },
      });
    } catch (err: any) {
      alert(err?.errors?.[0]?.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-6 justify-center">
      <Text className="text-2xl font-bold mb-4">Forgot Password</Text>
      <TextInput
        className="border px-4 py-3 rounded-xl mb-4 bg-gray-100"
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity
        className={`py-4 rounded-xl items-center ${loading ? 'bg-gray-300' : 'bg-[#e23744]'}`}
        onPress={handleSendResetCode}
        disabled={loading}
      >
        <Text className="text-white font-semibold">{loading ? 'Sending...' : 'Send Reset Code'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
