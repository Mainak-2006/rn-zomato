import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { db } from "../config/FireBaseConfig";

interface SearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onChangeText?: (text: string) => void;
  onCategorySelect?: (categoryId: string, categoryName: string) => void;
  onRestaurantSelect?: (restaurant: RestaurantType) => void;
  onFoodSelect?: (food: FoodType) => void;
  value?: string;
}

type CategoryType = {
  id: string;
  name: string;
  imageUrl: string;
};

type RestaurantType = {
  id: string;
  name: string;
  address: string;
  category: string[];
  delivery_time: string;
  image: string;
  rating: string;
};

type FoodType = {
  id: string;
  name: string;
  price: string;
  rating: number;
  restaurant: string;
  category: string[];
  description: string;
  veg: boolean;
  imageUrl?: string;
};

type SearchResultType = {
  type: 'category' | 'restaurant' | 'food';
  data: CategoryType | RestaurantType | FoodType;
};

const Search: React.FC<SearchProps> = ({ 
  placeholder = "Search for restaurants, food, cuisines...", 
  onSearch,
  onChangeText,
  onCategorySelect,
  onRestaurantSelect,
  onFoodSelect,
  value 
}) => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [categoryList, setCategoryList] = useState<CategoryType[]>([]);
  const [restaurantList, setRestaurantList] = useState<RestaurantType[]>([]);
  const [foodList, setFoodList] = useState<FoodType[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResultType[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const results = searchAllData(searchQuery);
      setFilteredResults(results);
      setShowSuggestions(true);
    } else {
      setFilteredResults([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, categoryList, restaurantList, foodList]);

  const getAllData = async () => {
    setLoading(true);
    try {
      // Fetch Categories
      const categorySnapshot = await getDocs(collection(db, 'Category'));
      const categories: CategoryType[] = [];
      categorySnapshot.forEach((doc) => {
        const data = doc.data();
        categories.push({
          id: doc.id,
          name: data.name,
          imageUrl: data.imageUrl,
        });
      });
      setCategoryList(categories);

      // Fetch Restaurants
      const restaurantSnapshot = await getDocs(collection(db, 'Restaurants'));
      const restaurants: RestaurantType[] = [];
      restaurantSnapshot.forEach((doc) => {
        const data = doc.data();
        restaurants.push({
          id: doc.id,
          name: data.name,
          address: data.address,
          category: data.category || [],
          delivery_time: data.delivery_time,
          image: data.imageUrl,
          rating: data.rating,
        });
      });
      setRestaurantList(restaurants);

      // Fetch Foods
      const foodSnapshot = await getDocs(collection(db, 'Foods'));
      const foods: FoodType[] = [];
      foodSnapshot.forEach((doc) => {
        const data = doc.data();
        foods.push({
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
      setFoodList(foods);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchAllData = (query: string): SearchResultType[] => {
    const lowerQuery = query.toLowerCase();
    const results: SearchResultType[] = [];

    // Search Categories
    categoryList.forEach(category => {
      if (category.name.toLowerCase().includes(lowerQuery)) {
        results.push({ type: 'category', data: category });
      }
    });

    // Search Restaurants
    restaurantList.forEach(restaurant => {
      if (
        restaurant.name.toLowerCase().includes(lowerQuery) ||
        restaurant.address.toLowerCase().includes(lowerQuery) ||
        restaurant.category.some(cat => cat.toLowerCase().includes(lowerQuery))
      ) {
        results.push({ type: 'restaurant', data: restaurant });
      }
    });

    // Search Foods
    foodList.forEach(food => {
      if (
        food.name.toLowerCase().includes(lowerQuery) ||
        food.description.toLowerCase().includes(lowerQuery) ||
        food.restaurant.toLowerCase().includes(lowerQuery) ||
        food.category.some(cat => cat.toLowerCase().includes(lowerQuery))
      ) {
        results.push({ type: 'food', data: food });
      }
    });

    // Sort results: categories first, then restaurants, then foods
    return results.sort((a, b) => {
      const order = { category: 0, restaurant: 1, food: 2 };
      return order[a.type] - order[b.type];
    });
  };

  const handleTextChange = (text: string) => {
    setSearchQuery(text);
    onChangeText?.(text);
  };

  const handleSearch = () => {
    onSearch?.(searchQuery);
    setShowSuggestions(false);
  };

  const handleResultSelect = (result: SearchResultType) => {
    setShowSuggestions(false);
    
    switch (result.type) {
      case 'category':
        const category = result.data as CategoryType;
        setSearchQuery(category.name);
        onCategorySelect?.(category.id, category.name);
        // Navigate to Food page
        // @ts-ignore
        navigation.navigate('pages/Food' as never, { categoryId: category.id, categoryName: category.name } as never);
        break;
        
      case 'restaurant':
        const restaurant = result.data as RestaurantType;
        setSearchQuery(restaurant.name);
        onRestaurantSelect?.(restaurant);
        
        // Navigate to Restaurant page
        // @ts-ignore
        navigation.navigate('pages/Restuarant' as never, { restaurant } as never);
        break;
        
      case 'food':
        const food = result.data as FoodType;
        setSearchQuery(food.name);
        onFoodSelect?.(food);
        
        // Navigate to FoodItem page
        // @ts-ignore
        navigation.navigate('pages/FoodItem' as never, { food } as never);
        break;
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'category': return 'restaurant-outline';
      case 'restaurant': return 'storefront-outline';
      case 'food': return 'fast-food-outline';
      default: return 'search-outline';
    }
  };

  const getResultSubtext = (result: SearchResultType) => {
    switch (result.type) {
      case 'category':
        return 'Category';
      case 'restaurant':
        const restaurant = result.data as RestaurantType;
        return `Restaurant • ${restaurant.category.join(', ')}`;
      case 'food':
        const food = result.data as FoodType;
        return `Food • ${food.restaurant} • ₹${food.price}`;
      default:
        return '';
    }
  };

  const renderSearchResult = (result: SearchResultType, index: number) => {
    const isCategory = result.type === 'category';
    const isRestaurant = result.type === 'restaurant';
    const isFood = result.type === 'food';
    
    let name = '';
    let imageUrl = '';
    
    if (isCategory) {
      const category = result.data as CategoryType;
      name = category.name;
      imageUrl = category.imageUrl;
    } else if (isRestaurant) {
      const restaurant = result.data as RestaurantType;
      name = restaurant.name;
      imageUrl = restaurant.image;
    } else if (isFood) {
      const food = result.data as FoodType;
      name = food.name;
      imageUrl = food.imageUrl || '';
    }

    return (
      <TouchableOpacity 
        key={`${result.type}-${index}`}
        onPress={() => handleResultSelect(result)}
        className="flex-row items-center p-3 border-b border-gray-100"
        activeOpacity={0.7}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="w-10 h-10 rounded-full mr-3"
          />
        ) : (
          <View className="w-10 h-10 rounded-full mr-3 bg-gray-200 justify-center items-center">
            <Ionicons 
              name={getResultIcon(result.type)} 
              size={20} 
              color="#9CA3AF" 
            />
          </View>
        )}
        
        <View className="flex-1">
          <Text className="text-gray-800 text-base font-medium" numberOfLines={1}>
            {name}
          </Text>
          <Text className="text-gray-500 text-sm" numberOfLines={1}>
            {getResultSubtext(result)}
          </Text>
        </View>
        
        <Ionicons 
          name="arrow-up-outline" 
          size={16} 
          color="#9CA3AF" 
          style={{ transform: [{ rotate: '45deg' }] }} 
        />
      </TouchableOpacity>
    );
  };

  return (
    <View className="mx-4 my-2">
      <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 shadow-sm">
        <TouchableOpacity onPress={handleSearch} className="mr-3">
          <Ionicons 
            name="search" 
            size={20} 
            color="#6B7280" 
          />
        </TouchableOpacity>
        
        <TextInput
          className="flex-1 text-gray-800 text-base"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={handleTextChange}
          onSubmitEditing={handleSearch}
          onFocus={() => {
            if (searchQuery.trim().length > 0) {
              setShowSuggestions(true);
            }
          }}
          returnKeyType="search"
        />
        
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            onPress={() => {
              setSearchQuery('');
              setShowSuggestions(false);
              onChangeText?.('');
            }}
            className="ml-2"
          >
            <Ionicons 
              name="close-circle" 
              size={20} 
              color="#9CA3AF" 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Results Dropdown */}
      {showSuggestions && filteredResults.length > 0 && (
        <View className="bg-white rounded-2xl shadow-md mt-2 max-h-80">
          <ScrollView 
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
          >
            {filteredResults.slice(0, 10).map((result, index) => 
              renderSearchResult(result, index)
            )}
            {filteredResults.length > 10 && (
              <View className="p-3 border-t border-gray-100">
                <Text className="text-gray-500 text-center text-sm">
                  +{filteredResults.length - 10} more results
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* No Results Message */}
      {showSuggestions && searchQuery.trim().length > 0 && filteredResults.length === 0 && !loading && (
        <View className="bg-white rounded-2xl shadow-md mt-2 p-4">
          <View className="flex-row items-center justify-center">
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <Text className="text-gray-500 ml-2">No results found for "{searchQuery}"</Text>
          </View>
          <Text className="text-gray-400 text-center text-sm mt-2">
            Try searching for restaurants, food items, or cuisines
          </Text>
        </View>
      )}

      {/* Loading State */}
      {loading && showSuggestions && (
        <View className="bg-white rounded-2xl shadow-md mt-2 p-4">
          <View className="flex-row items-center justify-center">
            <Text className="text-gray-500">Searching...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default Search;