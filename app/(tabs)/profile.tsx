import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialIcons, Feather, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { validateName, handleClerkError, showSecureAlert } from '../../utils/auth';

const accountOptions = [
  { icon: <MaterialIcons name="history" size={22} color="#e23744" />, label: 'My Orders', desc: 'View your order history' },
  { icon: <Feather name="map-pin" size={22} color="#e23744" />, label: 'Addresses', desc: 'Manage delivery addresses' },
  { icon: <Feather name="heart" size={22} color="#e23744" />, label: 'Favorites', desc: 'Your favorite restaurants' },
  { icon: <FontAwesome name="credit-card" size={22} color="#e23744" />, label: 'Payment Methods', desc: 'Manage payment options' },
  { icon: <Ionicons name="notifications-outline" size={22} color="#e23744" />, label: 'Notifications', desc: 'Notification preferences' },
  { icon: <Feather name="help-circle" size={22} color="#e23744" />, label: 'Help & Support', desc: 'Get help and support' }
];

export default function Profile({ navigateToOrders, ...props }: { navigateToOrders?: () => void; [key: string]: any }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const [name, setName] = useState(user?.fullName || '');
  const [image, setImage] = useState<string | null>(user?.imageUrl || null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  if (!isLoaded) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#e23744" />
      </View>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-[#e23744] text-xl">Sign in to view your profile</Text>
      </View>
    );
  }

  const pickImage = async () => {
    setError(null);
    setSuccess(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
        setImageBase64(result.assets[0].base64 || null);
      }
    } catch (e) {
      setError('Failed to pick image.');
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    const validation = validateName(name);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }
    setSaving(true);
    try {
      await user.update({
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' '),
      });
      if (imageBase64 && image !== user.imageUrl) {
        setUploading(true);
        await user.setProfileImage({ file: `data:image/jpeg;base64,${imageBase64}` });
        setUploading(false);
      }
      setSuccess('Profile updated!');
      await user.reload();
      setEditMode(false);
    } catch (err: any) {
      const authError = handleClerkError(err);
      setError(authError.message);
      showSecureAlert('Error', authError.message, authError.longMessage);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-orange-500">
      <ScrollView>
        {/* Profile Card & Edit Icon */}
        <View className="px-4 pt-6 bg-gray-300 rounded-2xl mt-2 mx-2">
          <View className="flex-row items-start mb-4">
            {/* Card */}
            <View className="bg-[#e5e7eb] rounded-2xl flex-row items-center p-4 mb-2 flex-1">
              {/* Profile Image */}
              <View style={{ position: 'relative' }}>
                <TouchableOpacity
                  onPress={editMode ? pickImage : undefined}
                  className="mr-4"
                  activeOpacity={editMode ? 0.7 : 1}
                >
                  {image ? (
                    <Image
                      source={{ uri: image }}
                      className="w-16 h-16 rounded-full bg-white"
                      style={{ width: 64, height: 64, borderRadius: 32 }}
                    />
                  ) : (
                    <View className="w-16 h-16 rounded-full bg-white items-center justify-center">
                      <Ionicons name="person" size={36} color="#e23744" />
                    </View>
                  )}
                  {/* Camera Icon Overlay */}
                  {editMode && (
                    <TouchableOpacity
                      onPress={pickImage}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: '#fff',
                        borderRadius: 16,
                        padding: 4,
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                        elevation: 2,
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="camera" size={18} color="#e23744" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              </View>
              {/* Info */}
              <View className="flex-1">
                {editMode ? (
                  <TextInput
                    className="text-lg font-bold text-gray-800 mb-1 bg-white rounded px-2"
                    value={name}
                    onChangeText={setName}
                    placeholder="Full Name"
                    autoCapitalize="words"
                    editable={!saving && !uploading}
                  />
                ) : (
                  <Text className="text-lg font-bold text-gray-800 mx-2 mb-1">{user.fullName}</Text>
                )}
                <Text className="text-gray-600 text-sm mx-2 mb-1">{user.primaryEmailAddress?.emailAddress}</Text>
                <View className="flex-row items-center gap-1">
                  <Text className="text-yellow-500 mx-1 text-base">★</Text>
                  <Text className="text-gray-700 text-base font-semibold">4.5</Text>
                  <Text className="text-gray-500 text-base ml-1">· Food Lover</Text>
                </View>
              </View>
            </View>
            {/* Edit Icon */}
            <TouchableOpacity
              onPress={() => setEditMode((prev) => !prev)}
              className="p-4 ml-2 mt-6"
            >
              <Feather name="edit-2" size={22} color="#e23744" />
            </TouchableOpacity>
          </View>
          {/* Save/Cancel Buttons in Edit Mode */}
          {editMode && (
            <View className="flex-row justify-end mt-2 mb-2 gap-2">
              <TouchableOpacity
                className="bg-gray-300 px-4 py-2 rounded-xl"
                onPress={() => {
                  setEditMode(false);
                  setName(user.fullName || '');
                  setImage(user.imageUrl || null);
                  setImageBase64(null);
                  setError(null);
                  setSuccess(null);
                }}
                disabled={saving || uploading}
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-[#e23744] px-4 py-2 rounded-xl"
                onPress={handleSave}
                disabled={saving || uploading}
              >
                {saving || uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold">Save</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
          {error ? <Text className="text-red-500 mt-2 ml-1">{error}</Text> : null}
          {success ? <Text className="text-green-600 mt-2 ml-1">{success}</Text> : null}
        </View>

        {/* Account Section */}
        <View className="px-4 mt-2">
          <Text className="text-2xl font-bold text-gray-900 mb-2">Account</Text>
          <View className="bg-white rounded-2xl overflow-hidden mb-30">
            {accountOptions.map((opt, idx) => (
              <TouchableOpacity
                key={opt.label}
                className={`flex-row items-center px-4 py-4 ${idx !== accountOptions.length - 1 ? 'border-b border-gray-100' : ''}`}
                activeOpacity={0.7}
                onPress={opt.label === 'My Orders' && navigateToOrders ? navigateToOrders : undefined}
              >
                <View className="w-8 items-center justify-center mr-3">{opt.icon}</View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-800">{opt.label}</Text>
                  <Text className="text-xs text-gray-500 mt-1">{opt.desc}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={22} color="#bdbdbd" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
