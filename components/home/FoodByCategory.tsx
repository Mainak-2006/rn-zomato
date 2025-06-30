import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { router, useNavigation } from 'expo-router'
import {db} from "../../config/FireBaseConfig"

export default function Category() {
  const navigation = useNavigation();

  type CategoryType = {
    id: string;
    name: string;
    imageUrl: string;
  };

  const [categoryList, setCategoryList] = useState<CategoryType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const INITIAL_DISPLAY_COUNT = 5; // Show only 5 categories initially

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

  // Navigate to Category.tsx screen
  const handleShowMore = () => {
    navigation.navigate('pages/Category' as never);
  };

  // Get the categories to display based on showAll state
  const displayedCategories = showAll 
    ? categoryList 
    : categoryList.slice(0, INITIAL_DISPLAY_COUNT);

    const renderCategoryItem = ({ item }: { item: CategoryType }) => (
      <View className="items-center mx-3 w-20">
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
        <Text className="text-sm mt-1 font-semibold text-center" numberOfLines={2}>
          {item.name}
        </Text>
      </View>
    );

  const LoadingPlaceholders = () => (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={[1, 2, 3, 4, 5]}
      keyExtractor={(item) => item.toString()}
      renderItem={() => (
        <View className="items-center mx-2 w-20">
          <View className="bg-gray-200 w-20 h-20 rounded-full opacity-80 shadow-sm" />
          <View className="bg-gray-200 w-16 h-3 rounded-md mt-2 opacity-80" />
        </View>
      )}
      contentContainerStyle={{ paddingHorizontal: 4 }}
    />
  );

  return (
    <View className="mt-5 p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="font-medium text-2xl">Category</Text>
        {!loading && categoryList.length > INITIAL_DISPLAY_COUNT && (
          <TouchableOpacity 
            onPress={handleShowMore}
            className="px-3 py-1 bg-orange-500 rounded-full"
          >
            <Text className="text-white text-sm font-medium">
              Show More
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {loading ? (
        <LoadingPlaceholders />
      ) : (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={displayedCategories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategoryItem}
          contentContainerStyle={{ paddingHorizontal: 4 }}
          ItemSeparatorComponent={() => <View className="mx-2" />}
        />
      )}
    </View>
  )
}