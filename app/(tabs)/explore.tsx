import Restaurant from '@/components/explore/Restaurant'
import FoodItemBox from '@/components/home/FoodItemBox'
import Search from '@/components/Search'
import { View, Text, ScrollView } from 'react-native'


export default function Orders() {
  return (
    <ScrollView className="flex-1 bg-orange-500" showsVerticalScrollIndicator={false}>
      <View className="mt-2 py-2">
      <Search/>
      </View>
      <Text className="px-5 text-3xl text-black font-semibold mb-1">Foods</Text>
      <FoodItemBox/>
      <Text className="px-5 text-3xl text-black font-semibold mb-1">Restuarants</Text>
      <View className="mb-20">
      <Restaurant/>
      </View>
    </ScrollView>
  )
}