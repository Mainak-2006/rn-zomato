// register.tsx
import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSignUp } from '@clerk/clerk-expo';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import { useGoogleAuth } from '../../utils/social'; // adjust path if needed

export default function Register() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { signInWithGoogle } = useGoogleAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const handleInputChange = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleRegister = async () => {
    if (!isLoaded) return;
    const { fullName, email, password, confirmPassword } = formData;

    if (!fullName || !email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    if (!agreeTerms) {
      alert('Please agree to the Terms and Conditions');
      return;
    }

    setLoading(true);
    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName: fullName.split(' ')[0],
        lastName: fullName.split(' ').slice(1).join(' ') || '',
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (error: any) {
      console.error('Signup error:', error);
      alert(error?.errors?.[0]?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!isLoaded || !verificationCode) return;

    setLoading(true);
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({ code: verificationCode });
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace('/(tabs)');
      } else {
        alert('Verification failed. Try again.');
      }
    } catch (error: any) {
      console.error(error);
      alert(error?.errors?.[0]?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationCode = async () => {
    if (!isLoaded || !signUp) return;

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      alert('Verification code resent!');
    } catch {
      alert('Failed to resend code');
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 px-6">
          <View className="flex-row items-center pt-6 pb-8">
            <TouchableOpacity onPress={() => setPendingVerification(false)}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-800 ml-4">Verify Email</Text>
          </View>

          <View className="flex-1 justify-center items-center pb-12">
            <Ionicons name="mail-outline" size={64} color="#e23744" />
            <Text className="text-2xl font-bold text-center text-gray-800 mb-4">Check Your Email</Text>
            <Text className="text-base text-center text-gray-600 mb-10">
              We've sent a verification code to{'\n'}
              <Text className="text-[#e23744] font-semibold">{formData.email}</Text>
            </Text>

            <TextInput
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 text-base mb-4"
              placeholder="Enter 6-digit code"
              keyboardType="number-pad"
              maxLength={6}
              autoComplete="one-time-code"
              value={verificationCode}
              onChangeText={setVerificationCode}
            />

            <TouchableOpacity
              className={`w-full rounded-xl py-4 items-center mb-4 ${loading ? 'bg-gray-300' : 'bg-[#e23744]'}`}
              onPress={handleVerification}
              disabled={loading}
            >
              <Text className="text-white text-base font-semibold">
                {loading ? 'Verifying...' : 'Verify Email'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={resendVerificationCode}>
              <Text className="text-[#e23744] font-medium">Resend Code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6">
          <View className="flex-row items-center pt-6 pb-8">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-800 ml-4">Create Account</Text>
          </View>

          <View className="mb-8">
            {['fullName', 'email'].map((field, idx) => (
              <View key={idx} className="mb-5">
                <Text className="text-base font-medium text-gray-800 mb-2">
                  {field === 'fullName' ? 'Full Name' : 'Email'}
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 text-base"
                  value={formData[field as keyof typeof formData]}
                  placeholder={field === 'fullName' ? 'Enter your full name' : 'Enter your email'}
                  keyboardType={field === 'email' ? 'email-address' : 'default'}
                  autoCapitalize="none"
                  autoComplete={field === 'email' ? 'email' : 'name'}
                  onChangeText={value => handleInputChange(field, value)}
                />
              </View>
            ))}

            {[{ label: 'Password', key: 'password', toggle: showPassword }, { label: 'Confirm Password', key: 'confirmPassword', toggle: showConfirmPassword }].map((item, idx) => (
              <View key={idx} className="mb-5">
                <Text className="text-base font-medium text-gray-800 mb-2">{item.label}</Text>
                <View className="flex-row items-center border border-gray-300 rounded-xl bg-gray-50">
                  <TextInput
                    className="flex-1 px-4 py-3 text-base"
                    secureTextEntry={!item.toggle}
                    value={formData[item.key as keyof typeof formData]}
                    onChangeText={value => handleInputChange(item.key, value)}
                    placeholder={`Enter ${item.label.toLowerCase()}`}
                  />
                  <TouchableOpacity
                    className="px-4"
                    onPress={() =>
                      item.key === 'password'
                        ? setShowPassword(prev => !prev)
                        : setShowConfirmPassword(prev => !prev)
                    }
                  >
                    <Ionicons name={item.toggle ? 'eye-off' : 'eye'} size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity className="flex-row items-start mb-6" onPress={() => setAgreeTerms(!agreeTerms)}>
              <View
                className={`w-5 h-5 rounded-md border-2 mr-3 mt-1 items-center justify-center ${
                  agreeTerms ? 'bg-[#e23744] border-[#e23744]' : 'border-gray-300'
                }`}
              >
                {agreeTerms && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text className="text-sm text-gray-600">
                I agree to the <Text className="text-[#e23744] font-medium">Terms & Conditions</Text> and{' '}
                <Text className="text-[#e23744] font-medium">Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`rounded-xl py-4 items-center mb-4 ${loading ? 'bg-gray-300' : 'bg-[#e23744]'}`}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text className="text-white text-base font-semibold">
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="border border-gray-300 flex-row gap-2 justify-center rounded-xl py-4 items-center bg-gray-50"
              onPress={signInWithGoogle}
              accessibilityLabel="Sign up with Google"
            >
              <AntDesign name="google" size={24} color="black" />
              <Text className="text-base text-gray-800 font-medium"> Sign up with Google</Text>
            </TouchableOpacity>
          </View>

          <View className="items-center pb-6">
            <Text className="text-sm text-gray-600">
              Already have an account?{' '}
              <Text className="text-[#e23744] font-semibold" onPress={() => router.push('/(auth)/login')}>
                Log In
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
