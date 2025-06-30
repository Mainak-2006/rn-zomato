import { View, Text, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import {db} from "../../config/FireBaseConfig"

const { width } = Dimensions.get('window');
const itemWidth = (width -48) / 3; 

export default function Category() {

  type CategoryType = {
    id: string;
    name: string;
    imageUrl: string;
  };

  const [categoryList, setCategoryList] = useState<CategoryType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GetCategories();
  }, [])

  const GetCategories = async () => {
    setLoading(true);
    setCategoryList([]);
    try {
      const snapshot = await getDocs(collection(db, 'Category'));
      const categories: CategoryType[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        categories.push({
          id: doc.id,
          name: data.name,
          imageUrl: data.imageUrl,
        });
      });
      setCategoryList(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  }

  const renderCategoryItem = ({ item }: { item: CategoryType }) => (
    <View className="items-center mb-4" style={{ width: itemWidth }}>
      <TouchableOpacity onPress={() => {
        setSelectedCategory(item.id);
        // Navigate to Food.tsx with category details
        router.push({
          pathname: '/pages/Food',
          params: { 
            categoryId: item.id, 
            categoryName: item.name 
          }
        });
      }}>
        <View className={`w-22 h-22 rounded-full justify-center items-center shadow-sm ${
          selectedCategory === item.id 
            ? 'bg-red-200 border-red-800 border-4' 
            : 'bg-yellow-100'
        }`}>
          <Image
            source={{ uri: item?.imageUrl }}
            className="w-20 h-20 rounded-full"
          />
        </View>
      </TouchableOpacity>
      <Text className="text-sm mt-2 font-semibold text-center" numberOfLines={2}>
        {item.name}
      </Text>
    </View>
  );

  const LoadingPlaceholders = () => (
    <FlatList
      numColumns={3}
      showsVerticalScrollIndicator={false}
      data={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
      keyExtractor={(item) => item.toString()}
      renderItem={() => (
        <View className="items-center mb-4" style={{ width: itemWidth }}>
          <View className="bg-gray-200 w-20 h-20 rounded-full opacity-80 shadow-sm" />
          <View className="bg-gray-200 w-16 h-3 rounded-md mt-2 opacity-80" />
        </View>
      )}
      contentContainerStyle={{ paddingHorizontal: 16 }}
    />
  );

  return (
    <View className="flex-1  p-4 bg-orange-500">
      {/* Header with Back Button */}
      <View className="flex-row items-center justify-between mb-4 mx-1">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="p-2 mt-10"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="font-bold text-2xl flex-1 text-center mt-10 mr-10">
          All Categories
        </Text>
      </View>
      {loading ? (
        <LoadingPlaceholders />
      ) : (
        <FlatList
          numColumns={3}
          showsVerticalScrollIndicator={false}
          data={categoryList}
          keyExtractor={(item) => item.id}
          renderItem={renderCategoryItem}
          contentContainerStyle={{ paddingHorizontal: 8 }}
        />
      )}
    </View>
  )
}
