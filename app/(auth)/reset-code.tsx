// reset-code.tsx

import React, { useState } from 'react';
import {
  Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSignIn } from '@clerk/clerk-expo';
import { useLocalSearchParams, router } from 'expo-router';

export default function ResetCode() {
  const { signIn, isLoaded } = useSignIn();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!isLoaded || !signIn) return;
    if (!code || !newPassword) return alert('Fill in all fields');

    setLoading(true);
    try {
      await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      });
      alert('Password reset successful');
      router.replace('/(auth)/login');
    } catch (err: any) {
      alert(err?.errors?.[0]?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-6 justify-center">
      <Text className="text-2xl font-bold mb-4">Reset Password</Text>
      <Text className="mb-2">Code sent to: {email}</Text>
      <TextInput
        className="border px-4 py-3 rounded-xl mb-4 bg-gray-100"
        placeholder="Enter code"
        keyboardType="number-pad"
        value={code}
        onChangeText={setCode}
      />
      <TextInput
        className="border px-4 py-3 rounded-xl mb-4 bg-gray-100"
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TouchableOpacity
        className={`py-4 rounded-xl items-center ${loading ? 'bg-gray-300' : 'bg-[#e23744]'}`}
        onPress={handleReset}
        disabled={loading}
      >
        <Text className="text-white font-semibold">{loading ? 'Resetting...' : 'Reset Password'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
