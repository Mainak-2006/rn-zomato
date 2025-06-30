import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { useNavigation } from '@react-navigation/native'
import { db } from "../../config/FireBaseConfig"

type FoodType = {
  id: string;
  name: string;
  price: string;
  rating: number;
  restaurant: string;
  category: string;
  description: string;
  veg: boolean;
  imageUrl?: string;
};

export default function FoodItemBox() {
  const navigation = useNavigation();
  const [foodList, setFoodList] = useState<FoodType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GetFoods();
  }, []);

  const GetFoods = async () => {
    setLoading(true);
    setFoodList([]);
    try {
      const snapshot = await getDocs(collection(db, 'Foods'));
      const foods: FoodType[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        foods.push({
          id: doc.id,
          name: data.name,
          price: data.price,
          rating: data.rating,
          restaurant: data.restaurant,
          category: data.category,
          description: data.description,
          veg: data.veg,
          imageUrl: data.imageUrl,
        });
      });
      setFoodList(foods);
    } catch (error) {
      console.error("Error fetching foods:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFoodPress = (food: FoodType) => {
    // @ts-ignore
    navigation.navigate('pages/FoodItem' as never, { food } as never);
  };

  const renderFoodItem = ({ item }: { item: FoodType }) => (
    <TouchableOpacity onPress={() => handleFoodPress(item)}>
      <View className="mx-4 mb-4">
        <View className="bg-white w-full h-40 rounded-2xl shadow-sm flex-row items-center px-4 border border-gray-100">
          {/* Food Image */}
          <View className="w-32 h-32 mx-2  rounded-xl overflow-hidden">
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                className="w-full h-full rounded-xl"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-gray-200 rounded-xl justify-center items-center">
                <Text className="text-gray-500 text-xs">No Image</Text>
              </View>
            )}
          </View>
          
          {/* Food Details */}
          <View className="flex-1 ml-4">
            <View className="flex-row items-center mb-1">
              <Text className="font-bold text-lg text-gray-800 flex-1" numberOfLines={1}>
                {item.name}
              </Text>
              <View className={`w-3 h-3 rounded-full ml-2 ${item.veg ? 'bg-green-500' : 'bg-red-500'}`} />
            </View>
            
            <Text className="text-gray-600 text-sm mb-2" numberOfLines={1}>
              {item.restaurant}
            </Text>
            
            <View className="flex-row justify-between items-center">
              <Text className="font-bold text-lg text-orange-600">
                ₹{item.price}
              </Text>
              
              <View className="flex-row items-center bg-green-100 px-2 py-1 rounded-md">
                <Text className="text-green-700 font-medium text-sm">
                  ★ {item.rating}
                </Text>
              </View>
            </View>
            
            <Text className="text-gray-500 text-xs mt-1 capitalize">
              {item.category}
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
            <View className="bg-gray-300 w-28 h-28 mx-2 px-3 rounded-xl opacity-60" />
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
          data={foodList}
          keyExtractor={(item) => item.id}
          renderItem={renderFoodItem}
          contentContainerStyle={{ paddingVertical: 8 }}
          nestedScrollEnabled={true}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}