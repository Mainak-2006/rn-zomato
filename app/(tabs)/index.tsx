import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native'
import { useUser } from '@clerk/clerk-expo'
import FoodByCategory from 'components/home/FoodByCategory';
import Search from 'components/Search';
import FoodItemBox from '@/components/home/FoodItemBox';
import { useCart } from '@/components/CartContext';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function Index() {
  const { user } = useUser();
  const { cart } = useCart();
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <ScrollView className="flex-1 bg-orange-500" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
      {/* Header Section */}
      <View className="flex-row justify-between items-center px-6 pt-12 pb-4">
        {/* Welcome Message */}
        <View>
          <Text className="text-white text-xl font-medium">Welcome,</Text>
          <Text className="text-white text-2xl font-bold">
            {user?.firstName || 'Guest'}
          </Text>
        </View>

        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.push('/pages/Cart')} className="p-2 relative">
            <FontAwesome name="shopping-cart" size={28} color="white" />
            {cartItemCount > 0 && (
              <View className="absolute top-0 right-0 bg-red-500 rounded-full w-5 h-5 justify-center items-center">
                <Text className="text-white text-xs font-bold">{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          {/* User Profile */}
          <TouchableOpacity
            className="flex-row items-center rounded-full ml-4"
          >
            {user?.imageUrl ? (
              <Image
                source={{ uri: user.imageUrl }}
                className="w-12 h-12 rounded-full"
              />
            ) : null}
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Hero Section */}
      <View className="items-center px-6 py-8">
        <Text className="text-white text-6xl font-bold mb-2">Zomato</Text>
        <Text className="text-white/80 text-lg text-center">Discover great food around you</Text>
      </View>

      {/*Search*/}
      <Search/>

      {/*Food Types*/}
     <FoodByCategory/>
     <Text className="font-semibold text-2xl mt-4 ml-5">Most Ordered</Text>
     <View className="mb-20">
     <FoodItemBox/>
     </View>
    </ScrollView>
  )
}
