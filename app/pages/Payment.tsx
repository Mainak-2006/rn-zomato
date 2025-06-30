import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { AntDesign } from '@expo/vector-icons';
import { useCart } from '../../components/CartContext';


export default function Payment() {
  const { order: orderParam } = useLocalSearchParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { addOrder, markOrderPaid } = useCart();
  const order = orderParam ? JSON.parse(orderParam as string) : null;
  
  const [isEditing, setIsEditing] = useState(false);
  const [address, setAddress] = useState('Siliguri,West Bengal,India');
  const [phone, setPhone] = useState('+91 98000XXXXX');


  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-orange-500">
        <Text className="text-white text-2xl">Order not found.</Text>
      </View>
    );
  }


  return (
    <ScrollView className="flex-1 bg-orange-500" contentContainerStyle={{ padding: 20, flexGrow: 1, paddingBottom: 40 }}>
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-12 left-4 bg-white w-10 h-10 rounded-full justify-center items-center shadow-md z-10"
      >
        <AntDesign name="leftcircle" size={24} color="black" />
      </TouchableOpacity>
      <Text className="text-white text-3xl font-bold text-center mb-6" style={{ marginTop: 40 }}>Payment</Text>
      <View className="bg-white rounded-xl p-4 mb-4">
        <Text className="text-lg font-bold text-gray-800 mb-2">Order Details</Text>
        {order.items.map((item: any) => (
          <View key={item.id} className="flex-row justify-between mb-1">
            <Text className="text-gray-700">{item.name} x{item.quantity}</Text>
            <Text className="text-orange-600 font-bold">₹{Number(item.price) * item.quantity}</Text>
          </View>
        ))}
        <View className="flex-row justify-between mt-2 border-t border-gray-200 pt-2">
          <Text className="text-lg font-bold text-gray-800">Total</Text>
          <Text className="text-lg font-bold text-orange-600">₹{order.totalPrice}</Text>
        </View>
      </View>

      <View className="bg-white rounded-xl p-4 mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-bold text-gray-800">Your Details</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Text className="text-blue-600 font-semibold">{isEditing ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-gray-700 mb-1">Name: <Text className="font-semibold">{isLoaded && user ? user.fullName : '...'}</Text></Text>
        <Text className="text-gray-700 mb-1">Email: <Text className="font-semibold">{isLoaded && user ? user.primaryEmailAddress?.emailAddress : '...'}</Text></Text>
        
        {isEditing ? (
          <>
            <Text className="text-gray-700 mt-2 mb-1">Address:</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-2 mb-2 bg-gray-50"
              value={address}
              onChangeText={setAddress}
              placeholder="Enter your address"
            />
            <Text className="text-gray-700 mt-2 mb-1">Phone:</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-2 mb-2 bg-gray-50"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
            <TouchableOpacity 
              className="bg-blue-600 px-4 py-2 rounded-lg mt-2 self-start"
              onPress={() => setIsEditing(false)}
            >
              <Text className="text-white text-center font-bold">Save</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text className="text-gray-700 mb-1">Address: <Text className="font-semibold">{address}</Text></Text>
            <Text className="text-gray-700 mb-1">Phone: <Text className="font-semibold">{phone}</Text></Text>
          </>
        )}
      </View>

      <View className="bg-white rounded-xl p-4 mb-4">
        <Text className="text-lg font-bold text-gray-800 mb-2">Payment Method</Text>
        <TouchableOpacity className="bg-green-600 px-4 py-3 rounded-lg mb-2"
          onPress={() => {
            addOrder();
            markOrderPaid();
            router.replace('/(tabs)/orders');
          }}
        >
          <Text className="text-white text-center font-bold">Pay</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

