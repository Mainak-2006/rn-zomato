import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { db } from '../../config/FireBaseConfig';

interface Restaurant {
  id: string;
  address: string;
  category: string[];
  delivery_time: string;
  image: string;
  name: string;
  rating: string;
}

export default function Restaurant() {
  const navigation = useNavigation();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    GetRestaurants();
  }, []);

  const GetRestaurants = async () => {
    setLoading(true);
    setRestaurants([]);
    try {
      const restaurantsRef = collection(db, 'Restaurants');
      const q = query(restaurantsRef, orderBy('rating', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const restaurantData: Restaurant[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        restaurantData.push({
          id: doc.id,
          address: data.address,
          category: data.category,
          delivery_time: data.delivery_time,
          image: data.imageUrl,
          name: data.name,
          rating: data.rating,
        });
      });
      
      setRestaurants(restaurantData);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      Alert.alert('Error', 'Failed to fetch restaurants');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    GetRestaurants();
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    // @ts-ignore
    navigation.navigate('pages/Restuarant' as never, { restaurant } as never);
  };

  const renderRestaurantItem = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity onPress={() => handleRestaurantPress(item)}>
      <View className="mx-4 mb-4">
        <View className="bg-white w-full h-40 rounded-2xl shadow-sm flex-row items-center px-4 border border-gray-100">
          {/* Restaurant Image */}
          <View className="w-32 h-32 mx-2 rounded-xl overflow-hidden">
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                className="w-full h-full rounded-xl"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-gray-200 rounded-xl justify-center items-center">
                <Text className="text-gray-500 text-xs">No Image</Text>
              </View>
            )}
          </View>
          
          {/* Restaurant Details */}
          <View className="flex-1 ml-4">
            <View className="flex-row items-center mb-1">
              <Text className="font-bold text-lg text-gray-800 flex-1" numberOfLines={1}>
                {item.name}
              </Text>
              <View className="bg-green-100 px-2 py-1 rounded-md ml-2">
                <Text className="text-green-700 font-medium text-sm">
                  ★ {item.rating}
                </Text>
              </View>
            </View>
            
            {/* Categories */}
            <View className="flex-row flex-wrap mb-2">
              {item.category.slice(0, 2).map((cat, index) => (
                <Text key={index} className="text-gray-600 text-sm mr-2">
                  {cat}{index < Math.min(item.category.length - 1, 1) ? ' •' : ''}
                </Text>
              ))}
              {item.category.length > 2 && (
                <Text className="text-gray-600 text-sm">+{item.category.length - 2} more</Text>
              )}
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="font-bold text-lg text-orange-600">
                🚚 {item.delivery_time} mins
              </Text>
              
              <View className="bg-red-100 px-2 py-1 rounded-md">
                <Text className="text-red-700 font-medium text-sm">
                  Order Now
                </Text>
              </View>
            </View>
            
            <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>
              📍 {item.address}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const LoadingPlaceholders = () => (
    <FlatList
      showsVerticalScrollIndicator={false}
      data={[1, 2, 3, 4, 5]}
      keyExtractor={(item) => item.toString()}
      renderItem={() => (
        <View className="mx-4 mb-4">
          <View className="bg-gray-200 w-full h-40 rounded-2xl opacity-80 shadow-sm flex-row items-center px-4">
            {/* Image placeholder */}
            <View className="bg-gray-300 w-32 h-32 mx-2 rounded-xl opacity-60" />
            {/* Text content placeholder */}
            <View className="flex-1 ml-4">
              <View className="bg-gray-300 w-3/4 h-4 rounded-md mb-2 opacity-60" />
              <View className="bg-gray-300 w-1/2 h-3 rounded-md opacity-60" />
              <View className="bg-gray-300 w-1/3 h-4 mt-2 rounded-md opacity-60" />
            </View>
          </View>
        </View>
      )}
      contentContainerStyle={{ paddingVertical: 8 }}
      nestedScrollEnabled={true}
      scrollEnabled={false}
    />
  );

  return (
    <View className="mt-5 p-4">
      {loading ? (
        <LoadingPlaceholders />
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={restaurants}
          keyExtractor={(item) => item.id}
          renderItem={renderRestaurantItem}
          contentContainerStyle={{ paddingVertical: 8 }}
          nestedScrollEnabled={true}
          scrollEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#ef4444']}
              tintColor="#ef4444"
            />
          }
        />
      )}
    </View>
  );
}