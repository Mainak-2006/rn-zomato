import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSignIn } from '@clerk/clerk-expo';
import {
  validateEmail,
  validatePassword,
  handleClerkError,
  showSecureAlert,
  RateLimiter,
  sanitizeInput
} from '../../utils/auth';
import { useGoogleAuth } from '../../utils/social';
import AntDesign from '@expo/vector-icons/AntDesign';


// Create rate limiter instance
const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000);

export default function EnhancedLogin() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const { signInWithGoogle } = useGoogleAuth();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    const canAttempt = loginRateLimiter.canAttempt('login');
    setIsRateLimited(!canAttempt);

    if (!canAttempt) {
      const timeUntilReset = loginRateLimiter.getTimeUntilReset('login');
      const minutes = Math.ceil(timeUntilReset / (1000 * 60));
      showSecureAlert(
        'Too Many Attempts',
        `Please wait ${minutes} minutes before trying again.`
      );
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.errors[0];
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!isLoaded) return;

    setErrors({});

    if (!loginRateLimiter.canAttempt('login')) {
      setIsRateLimited(true);
      const timeUntilReset = loginRateLimiter.getTimeUntilReset('login');
      const minutes = Math.ceil(timeUntilReset / (1000 * 60));
      showSecureAlert(
        'Too Many Attempts',
        `Please wait ${minutes} minutes before trying again.`
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      loginRateLimiter.recordAttempt('login');
      setLoginAttempts(prev => prev + 1);

      const sanitizedEmail = sanitizeInput(email.toLowerCase());

      const signInAttempt = await signIn.create({
        identifier: sanitizedEmail,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        console.log('Login successful');
        router.replace('/(tabs)');
      } else {
        console.error('Sign-in incomplete:', JSON.stringify(signInAttempt, null, 2));
        const authError = handleClerkError({
          errors: [{ code: 'sign_in_incomplete', message: 'Sign-in incomplete' }]
        });
        showSecureAlert('Error', authError.message, authError.longMessage);
      }
    } catch (error: any) {
      const authError = handleClerkError(error);

      switch (authError.code) {
        case 'invalid_credentials':
          setErrors({ password: 'Invalid email or password' });
          break;
        case 'account_not_found':
          setErrors({ email: 'No account found with this email' });
          break;
        case 'rate_limit':
          setIsRateLimited(true);
          showSecureAlert('Error', authError.message, authError.longMessage);
          break;
        default:
          showSecureAlert('Error', authError.message, authError.longMessage);
      }

      console.error('Login error:', authError);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleForgotPassword = () => {
    if (email) {
      router.push({
        pathname: '/(auth)/forgot-password',
        params: { email }
      });
    } else {
      router.push('/(auth)/forgot-password');
    }
  };

  const getRemainingAttempts = (): number => {
    return loginRateLimiter.getRemainingAttempts('login');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="flex-row items-center pt-5 pb-8">
            <Text className="text-2xl font-bold text-gray-800">Log In</Text>
          </View>

          {/* Security Warning */}
          {isRateLimited && (
            <View className="flex-row items-center bg-yellow-50 p-3 rounded-lg mb-5 border-l-4 border-yellow-500">
              <Ionicons name="warning" size={20} color="#fbbf24" />
              <Text className="text-sm text-yellow-700 ml-2 flex-1">
                Account temporarily locked due to multiple failed attempts
              </Text>
            </View>
          )}

          {/* Attempts Warning */}
          {loginAttempts > 0 && getRemainingAttempts() <= 2 && !isRateLimited && (
            <View className="flex-row items-center bg-orange-50 p-3 rounded-lg mb-5 border-l-4 border-orange-500">
              <Ionicons name="alert-circle" size={20} color="#f97316" />
              <Text className="text-sm text-orange-700 ml-2 flex-1">
                {getRemainingAttempts()} attempts remaining
              </Text>
            </View>
          )}

          {/* Form */}
          <View className="mb-8">
            <View className="mb-5">
              <Text className="text-base font-medium text-gray-800 mb-2">Email</Text>
              <TextInput
                ref={emailRef}
                className={`border rounded-xl px-4 py-4 text-base bg-gray-50 ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                value={email}
                onChangeText={handleEmailChange}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                editable={!loading && !isRateLimited}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                accessibilityLabel="Email input"
                accessibilityHint="Enter your email address"
              />
              {errors.email && (
                <Text className="text-xs text-red-400 mt-1 ml-1">{errors.email}</Text>
              )}
            </View>

            <View className="mb-5">
              <Text className="text-base font-medium text-gray-800 mb-2">Password</Text>
              <View className={`flex-row items-center border rounded-xl bg-gray-50 ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}>
                <TextInput
                  ref={passwordRef}
                  className="flex-1 px-4 py-4 text-base"
                  value={password}
                  onChangeText={handlePasswordChange}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  autoCorrect={false}
                  editable={!loading && !isRateLimited}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  accessibilityLabel="Password input"
                  accessibilityHint="Enter your password"
                />
                <TouchableOpacity
                  className="px-4 py-1"
                  onPress={() => setShowPassword(!showPassword)}
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className="text-xs text-red-400 mt-1 ml-1">{errors.password}</Text>
              )}
            </View>

            <TouchableOpacity
              className="self-end mb-8 p-1"
              onPress={handleForgotPassword}
              accessibilityLabel="Forgot password"
            >
              <Text className="text-red-600 text-sm font-medium">Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`rounded-xl py-4 items-center min-h-[52px] justify-center ${(loading || isRateLimited) ? 'bg-gray-300' : 'bg-red-600'
                }`}
              onPress={handleLogin}
              disabled={loading || isRateLimited}
              accessibilityLabel={loading ? "Logging in" : "Log in"}
            >
              {loading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text className="text-white text-base font-semibold ml-2">Logging in...</Text>
                </View>
              ) : (
                <Text className="text-white text-base font-semibold">Log In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-8">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="px-4 text-gray-500 text-sm">or</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Social Login */}
          <View className="mb-8">
            <TouchableOpacity
              className={`border border-gray-300 rounded-xl py-4 flex-row justify-center gap-2 items-center bg-gray-50 ${isRateLimited ? 'opacity-50' : ''}`}
              disabled={isRateLimited}
              onPress={signInWithGoogle}
              accessibilityLabel="Continue with Google"
            > 
            <AntDesign name="google" size={24} color="black" />
              <Text className="text-base text-gray-800 font-medium">Continue with Google</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View className="items-center pb-5">
            <Text className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Text
                className="text-red-600 font-semibold"
                onPress={() => router.push('/(auth)/register')}
                accessibilityLabel="Sign up"
              >
                Sign Up
              </Text>
            </Text>
          </View>

          {/* Security Notice */}
          <View className="flex-row items-center justify-center pb-5">
            <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
            <Text className="text-xs text-green-600 ml-1">
              Your data is encrypted and secure
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}