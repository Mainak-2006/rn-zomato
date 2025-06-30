import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import type { Order, CartItem } from '../../components/CartContext';
import { router, useLocalSearchParams } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRoute, useNavigation } from '@react-navigation/native'

const handleBack = () => {
  if (router.canGoBack && router.canGoBack()) {
    router.back();
  } else {
    router.replace('/orders');
  }
};

export default function OrderDetails() {
  // Assume order is passed as a navigation param (serialized as JSON)
  const { order: orderParam } = useLocalSearchParams();
  const order: Order = orderParam ? JSON.parse(orderParam as string) : null;

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-orange-500">
        <Text className="text-white text-2xl">Order not found.</Text>
      </View>
    );
  }

  const orderTotal = order.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View className="flex-1 bg-orange-500">
      <TouchableOpacity
        onPress={handleBack}
        className="absolute top-12 left-4 bg-white w-10 h-10 rounded-full justify-center items-center shadow-md"
      >
        <AntDesign name="leftcircle" size={24} color="black" />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <Text className="text-white text-3xl font-bold text-center pt-10 mt-4 mb-4">Order Details</Text>
        <View className="bg-white rounded-xl mx-4 mt-2 p-4 shadow mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-1">Order Summary</Text>
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-700">Order ID:</Text>
            <Text className="text-gray-900 font-semibold">{order.orderId || 'N/A'}</Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-700">Status:</Text>
            <Text className={`font-semibold ${order.paid ? 'text-green-600' : 'text-red-500'}`}>{order.paid ? 'Paid' : 'Unpaid'}</Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-700">Total Items:</Text>
            <Text className="text-gray-900 font-semibold">{totalItems}</Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-700">Total Price:</Text>
            <Text className="text-orange-600 font-bold">₹{orderTotal}</Text>
          </View>
        </View>
        <View className="px-4">
          <Text className="text-xl font-bold text-white mb-2">Items Breakdown</Text>
          {order.items.map((item: CartItem) => (
            <View key={item.id} className="flex-row items-center bg-white rounded-xl p-4 mb-4 shadow">
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} className="w-16 h-16 rounded-lg mr-4" />
              ) : (
                <View className="w-16 h-16 bg-gray-200 rounded-lg mr-4 items-center justify-center">
                  <Text className="text-gray-500 text-xs">No Image</Text>
                </View>
              )}
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Qty: {item.quantity}</Text>
                  <Text className="text-gray-600">Price: ₹{item.price}</Text>
                  <Text className="text-orange-600 font-bold">Subtotal: ₹{Number(item.price) * item.quantity}</Text>
                </View>
              </View>
            </View>
          ))}
          <View className="flex-row items-center justify-end mb-8 mt-2">
            <Text className="text-white text-2xl font-bold">Total: ₹{orderTotal}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}