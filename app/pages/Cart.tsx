import { View, Text, FlatList, Image, TouchableOpacity,ScrollView } from 'react-native';
import React from 'react';
import { useCart } from '../../components/CartContext';
import { router, useNavigation } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, addOrder, orders, setCart } = useCart();
  const navigation = useNavigation();

  // Only show the actual cart
  const cartToShow = cart;

  const total = cartToShow.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

  const handlePlaceOrder = () => {
    if (cart.length > 0) {
      router.push({
        pathname: '/pages/Payment',
        params: {
          order: JSON.stringify({
            items: cart,
            totalPrice: total,
            totalQuantity: cart.reduce((sum, item) => sum + item.quantity, 0),
          }),
        },
      });
    }
  };

  const handleExploreFoods = () => {
    router.replace('/(tabs)/explore');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Modern Header */}
      <View className="flex-row items-center justify-between px-4 py-4 bg-white shadow-sm">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <AntDesign name="arrowleft" size={26} color="#FF6600" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900 flex-1 text-center">Your Cart</Text>
        <AntDesign name="shoppingcart" size={26} color="#FF6600" />
      </View>

      {/* Cart Content */}
      {cartToShow.length === 0 ? (
        <View className="flex-1 items-center justify-center mt-20">
          <AntDesign name="shoppingcart" size={80} color="#FF6600" style={{ marginBottom: 16 }} />
          <Text className="text-gray-500 text-xl mb-4">Your cart is empty</Text>
          <TouchableOpacity
            onPress={handleExploreFoods}
            className="bg-orange-500 px-6 py-3 rounded-full shadow"
          >
            <Text className="text-white text-lg font-bold">Explore Foods</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cartToShow}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 12, paddingBottom: 120 }}
          style={{ flex: 1 }}
          renderItem={({ item }) => (
            <View className="bg-white rounded-2xl shadow mb-4 p-3 flex-row items-center">
              {/* Food Image */}
              {item.imageUrl && (
                <Image
                  source={{ uri: item.imageUrl }}
                  className="w-16 h-16 rounded-xl mr-3"
                  style={{ backgroundColor: '#f3f4f6' }}
                />
              )}
              {/* Info */}
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="font-bold text-base text-gray-900 flex-1" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View className={`w-3 h-3 rounded-full ml-2 ${item.veg ? 'bg-green-500' : 'bg-red-500'}`} />
                </View>
                <Text className="text-gray-500 text-xs mb-1" numberOfLines={1}>
                  {item.restaurant}
                </Text>
                <View className="flex-row items-center mb-1">
                  <Text className="text-orange-600 font-bold text-base mr-2">₹{item.price}</Text>
                  {item.rating !== undefined && (
                    <View className="flex-row items-center bg-green-100 px-2 py-0.5 rounded-md ml-auto">
                      <Text className="text-green-700 font-bold text-xs mr-1">★</Text>
                      <Text className="text-green-700 font-bold text-xs">{item.rating}</Text>
                    </View>
                  )}
                </View>
                {item.category && (
                  <Text className="text-gray-400 text-xs" numberOfLines={1}>
                    {Array.isArray(item.category) ? item.category.join(', ') : item.category}
                  </Text>
                )}
                {/* Quantity controls and delete button */}
                <View className="flex-row items-center mt-2 justify-between">
                  <View className="flex-row items-center">
                    <TouchableOpacity
                      onPress={() => {
                        if (item.quantity > 1) {
                          updateQuantity(item.id, item.quantity - 1);
                        } else {
                          removeFromCart(item.id);
                        }
                      }}
                      className="px-2 py-1 bg-gray-100 rounded-full mr-1"
                    >
                      <AntDesign name="minus" size={16} color="#FF6600" />
                    </TouchableOpacity>
                    <Text className="text-base font-bold mx-1 min-w-[20px] text-center">{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 bg-gray-100 rounded-full ml-1"
                    >
                      <AntDesign name="plus" size={16} color="#FF6600" />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => removeFromCart(item.id)} className="ml-2 p-1">
                    <AntDesign name="delete" size={18} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Modern Sticky Footer */}
      {cartToShow.length > 0 && (
        <View className="absolute left-0 right-0 bottom-0 px-4 pb-6">
          <View className="flex-row items-center justify-between bg-white rounded-2xl shadow-lg px-6 py-4 mb-2">
            <Text className="text-lg font-semibold text-gray-700">Total</Text>
            <Text className="text-2xl font-extrabold text-orange-600">₹{total.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-end">
            <TouchableOpacity
              onPress={handlePlaceOrder}
              className="bg-orange-500 py-4 px-8 rounded-full shadow-lg"
              style={{ elevation: 2 }}
            >
              <Text className="text-white text-center font-bold text-lg tracking-wide">Place Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
} 