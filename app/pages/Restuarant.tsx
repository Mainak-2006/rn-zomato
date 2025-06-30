import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  FlatList,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/FireBaseConfig';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';

const { width } = Dimensions.get('window');

interface Restaurant {
  id: string;
  address: string;
  category: string[];
  delivery_time: string;
  image: string;
  name: string;
  rating: string;
}

type FoodType = {
  id: string;
  name: string;
  price: string;
  rating: number;
  restaurant: string;
  category: string[]; // MULTIPLE categories
  description: string;
  veg: boolean;
  imageUrl?: string;
};

export default function RestaurantDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { restaurant } = route.params as { restaurant: Restaurant };

  const [foods, setFoods] = useState<FoodType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchRestaurantFoods();
  }, []);

  const fetchRestaurantFoods = async () => {
    try {
      setLoading(true);
      const foodsRef = collection(db, 'Foods');
      const q = query(foodsRef, where('restaurant', '==', restaurant.name));
      const querySnapshot = await getDocs(q);

      const foodData: FoodType[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        foodData.push({
          id: doc.id,
          name: data.name,
          price: data.price,
          rating: data.rating,
          restaurant: data.restaurant,
          category: data.category || [],
          description: data.description,
          veg: data.veg,
          imageUrl: data.imageUrl,
        });
      });

      setFoods(foodData);
    } catch (error) {
      console.error('Error fetching restaurant foods:', error);
      Alert.alert('Error', 'Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const getAllCategories = () => {
    const unique = new Set<string>();
    foods.forEach(food => food.category.forEach(cat => unique.add(cat)));
    return ['All', ...Array.from(unique)];
  };

  const getFilteredFoods = () => {
    if (selectedCategory === 'All') return foods;
    return foods.filter(food => food.category.includes(selectedCategory));
  };

  const renderCategoryTabs = () => {
    const categories = getAllCategories();
    return (
      <View className="px-4 mb-4">
        <Text className="text-lg font-bold text-gray-800 mb-3">Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            {categories.map((cat, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedCategory(cat)}
                className={`mr-3 px-4 py-2 rounded-full ${
                  selectedCategory === cat ? 'bg-red-500' : 'bg-gray-200'
                }`}
              >
                <Text className={`font-medium ${
                  selectedCategory === cat ? 'text-white' : 'text-gray-700'
                }`}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };
  const handleFoodPress = (food: FoodType) => {
    // @ts-ignore
    navigation.navigate('pages/FoodItem' as never, { food } as never);
  };

  const renderFoodItem = ({ item }: { item: FoodType }) => (
    <TouchableOpacity onPress={() => handleFoodPress(item)}>
      <View className="mx-4 mb-4">
        <View className="bg-gray-300 w-full h-32 rounded-2xl shadow-sm flex-row items-center px-4 border border-gray-100">
          <View className="w-24 h-24 mx-2 rounded-xl overflow-hidden">
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} className="w-full h-full rounded-xl" />
            ) : (
              <View className="bg-gray-200 w-full h-full justify-center items-center">
                <Text className="text-gray-500 text-xs">No Image</Text>
              </View>
            )}
          </View>

          <View className="flex-1 ml-3 bg-gray-300 rounded-xl">
            <View className="flex-row items-center mb-1">
              <Text className="font-bold text-base text-gray-800 flex-1" numberOfLines={1}>
                {item.name}
              </Text>
              <View className={`w-3 h-3 rounded-full ml-2 ${item.veg ? 'bg-green-500' : 'bg-red-500'}`} />
            </View>
            <Text className="text-gray-500 text-xs mb-2" numberOfLines={2}>
              {item.description}
            </Text>
            <View className="flex-row justify-between items-center">
              <Text className="text-orange-600 font-bold text-lg">₹{item.price}</Text>
              <View className="bg-green-100 px-2 py-1 rounded-md">
                <Text className="text-green-700 font-medium text-sm">★ {item.rating}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const RestaurantHeader = () => (
    <View className="bg-white">
      <View className="relative">
        <Image source={{ uri: restaurant.image }} style={{ width, height: 250 }} resizeMode="cover" />
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="absolute top-12 left-4 bg-white w-10 h-10 rounded-full justify-center items-center shadow-md"
        >
          <AntDesign name="leftcircle" size={24} color="black" />
        </TouchableOpacity>
        <View className="absolute top-12 right-4 bg-green-500 px-3 py-2 rounded-lg">
          <Text className="text-white font-bold">⭐ {restaurant.rating}</Text>
        </View>
      </View>

      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-2">{restaurant.name}</Text>
        <View className="flex-row flex-wrap mb-3">
          {restaurant.category.map((cat, i) => (
            <View key={i} className="bg-orange-100 px-3 py-1 rounded-full mr-2 mb-1">
              <Text className="text-orange-600 text-sm font-medium">{cat}</Text>
            </View>
          ))}
        </View>
        <View className="flex-row items-start mb-4">
          <Text className="text-gray-600 mr-2">📍</Text>
          <Text className="text-gray-600 flex-1">{restaurant.address}</Text>
        </View>
        <View className="flex-row justify-center items-center">
          <TouchableOpacity className="bg-gray-300 flex-1 ml-2 py-3 rounded-lg flex-row justify-center items-center">
            <Entypo name="star-outlined" size={24} color="black" />
            <Text className="text-gray-900 text-xl font-bold ml-2">Add to Favorites</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <RestaurantHeader />

        <View className="mt-4">
          <View className="px-4 mb-2">
            <Text className="text-xl font-bold text-gray-800">
              Menu ({getFilteredFoods().length} items)
            </Text>
          </View>

          {renderCategoryTabs()}

          {loading ? (
            <Text className="text-center py-10 text-gray-500">Loading...</Text>
          ) : getFilteredFoods().length > 0 ? (
            <FlatList
              data={getFilteredFoods()}
              keyExtractor={(item) => item.id}
              renderItem={renderFoodItem}
              scrollEnabled={false}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View className="flex-1 justify-center items-center py-20">
              <Text className="text-gray-500 text-lg">No menu items found</Text>
              <Text className="text-gray-400 text-sm mt-2">Try a different category</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
