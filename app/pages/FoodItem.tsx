import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { useRoute, useNavigation } from '@react-navigation/native'
import AntDesign from '@expo/vector-icons/AntDesign';
import { useCart } from '../../components/CartContext';
import { router } from 'expo-router';

type FoodType = {
  id: string;
  name: string;
  price: string;
  rating: number;
  restaurant: string;
  category: string[]; // Changed from string to string[] for multiple categories
  description: string;
  veg: boolean;
  imageUrl?: string;
};

type RouteParams = {
  food: FoodType;
};

interface IndexProps {
  navigateToOrders?: () => void;
}

export default function FoodItem({ navigateToOrders}: IndexProps) {
  const route = useRoute();
  const navigation = useNavigation();
  const { food } = route.params as RouteParams;
  const { cart, addToCart, updateQuantity, addOrder } = useCart();

  const cartItem = cart.find((item) => item.id === food.id);
  const quantity = cartItem?.quantity || 0;

  const handleOrderNow = () => {
    // If item is not in cart, add it first
    if (quantity === 0) {
      addToCart({
        id: food.id,
        name: food.name,
        price: food.price,
        imageUrl: food.imageUrl,
        restaurant: food.restaurant,
        category: food.category,
        description: food.description,
        veg: food.veg,
        rating: food.rating,
      });
    }
    // Place the order
    addOrder();
    // Navigate to orders tab
    router.replace("/(tabs)/orders");
  };

  return (
    <ScrollView className="flex-1 bg-orange-500" showsVerticalScrollIndicator={false}>
      {/* Header Image */}
      <View className="relative">
        {food.imageUrl ? (
          <Image
            source={{ uri: food.imageUrl }}
            className="w-full h-80"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-80 bg-gray-200 justify-center items-center">
            <Text className="text-gray-500 text-lg">No Image Available</Text>
          </View>
        )}
        
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="absolute top-12 left-4 bg-white w-10 h-10 rounded-full justify-center items-center shadow-md"
        >
          <AntDesign name="leftcircle" size={24} color="black" />
        </TouchableOpacity>

        {/* Veg/Non-veg Indicator */}
        <View className="absolute top-12 right-4 bg-white px-3 py-2 rounded-full shadow-md">
          <View className="flex-row items-center">
            <View className={`w-3 h-3 rounded-full mr-2 ${food.veg ? 'bg-green-500' : 'bg-red-500'}`} />
            <Text className="text-sm font-medium">
              {food.veg ? 'Veg' : 'Non-Veg'}
            </Text>
          </View>
        </View>
      </View>

      {/* Food Details */}
      <View className="p-6">
        {/* Title and Category */}
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              {food.name}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {food.category.map((cat, index) => (
                <Text
                  key={index}
                  className="text-lg text-gray-600 capitalize bg-gray-100 px-3 py-1 rounded-full"
                >
                  {cat}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Restaurant and Rating */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-lg font-medium text-gray-700">
              {food.restaurant}
            </Text>
          </View>
          <View className="bg-green-100 px-3 py-2 rounded-lg">
            <Text className="text-green-700 font-bold text-lg">
              ★ {food.rating}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-gray-900 mb-3">
            Description
          </Text>
          <Text className="text-gray-900 leading-6 text-base">
            {food.description}
          </Text>
        </View>

        {/* Price Section */}
        <View className="bg-orange-50 p-4 rounded-xl mb-6">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-medium text-gray-700">
              Price
            </Text>
            <Text className="text-3xl font-bold text-orange-600">
              ₹{food.price}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row space-x-4 gap-4 items-center justify-center mb-4">
          <View className="flex-row items-center flex-1 justify-center bg-white rounded-xl">
            <TouchableOpacity
              className="px-4 py-2"
              onPress={() => {
                if (quantity > 0) {
                  updateQuantity(food.id, quantity - 1);
                }
              }}
              disabled={quantity === 0}
            >
              <Text className={`text-2xl font-bold ${quantity === 0 ? 'text-gray-400' : ''}`}>-</Text>
            </TouchableOpacity>
            <Text className="text-xl font-bold mx-2">{quantity}</Text>
            <TouchableOpacity
              className="px-4 py-2"
              onPress={() => {
                if (quantity === 0) {
                  addToCart({
                    id: food.id,
                    name: food.name,
                    price: food.price,
                    imageUrl: food.imageUrl,
                    restaurant: food.restaurant,
                    category: food.category,
                    description: food.description,
                    veg: food.veg,
                    rating: food.rating,
                  });
                } else {
                  updateQuantity(food.id, quantity + 1);
                }
              }}
            >
              <Text className="text-2xl font-bold">+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity className="flex-1 bg-red-700 py-4 rounded-xl"
            onPress={() => {
              if (quantity === 0) {
                addToCart({
                  id: food.id,
                  name: food.name,
                  price: food.price,
                  imageUrl: food.imageUrl,
                  restaurant: food.restaurant,
                  category: food.category,
                  description: food.description,
                  veg: food.veg,
                  rating: food.rating,
                });
              }
              // Do NOT call addOrder or navigate here
            }}
          >
            <Text className="text-white text-center font-bold text-lg">
              Add To Cart
            </Text>
          </TouchableOpacity>
        </View>

        {/* Additional Info */}
        <View className="mt-6 p-4 bg-gray-50 rounded-xl">
          <Text className="font-semibold text-gray-800 mb-2">Food Details</Text>
          <View className="flex-row justify-between py-1">
            <Text className="text-gray-600">Category:</Text>
            <View className="flex-row flex-wrap gap-1"></View>
              {food.category.map((cat, index) => (
                <Text key={index} className="font-medium capitalize">
                  {cat}{index < food.category.length - 1 ? ',' :''}
                </Text>
              ))}
            </View>
          <View className="flex-row justify-between py-1">
            <Text className="text-gray-600">Type:</Text>
            <Text className="font-medium">{food.veg ? 'Vegetarian' : 'Non-Vegetarian'}</Text>
          </View>
          <View className="flex-row justify-between py-1">
            <Text className="text-gray-600">Restaurant:</Text>
            <Text className="font-medium">{food.restaurant}</Text>
          </View>
        </View>
        </View>
      </ScrollView>
    );
}