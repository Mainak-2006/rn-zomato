import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native'
import { useCart, Order } from '../../components/CartContext'
import type { CartItem } from '../../components/CartContext'
import { useRouter } from 'expo-router'

function combineOrders(orders: Order[]): (CartItem & { totalPrice: number })[] {
  if (!orders || orders.length === 0) return [];
  // Only combine paid orders
  const paidOrders = orders.filter(order => order.paid);
  if (paidOrders.length === 0) return [];
  const combined: { [name: string]: CartItem & { totalPrice: number } } = {};
  paidOrders.flatMap(order => order.items).forEach((item: CartItem) => {
    if (combined[item.name]) {
      combined[item.name].quantity += item.quantity;
      combined[item.name].totalPrice += Number(item.price) * item.quantity;
    } else {
      combined[item.name] = {
        ...item,
        quantity: item.quantity,
        totalPrice: Number(item.price) * item.quantity,
      };
    }
  });
  return Object.values(combined);
}

export default function Orders() {
  const { orders, cart, addOrder, markOrderPaid, markAllOrdersPaid } = useCart();
  const router = useRouter();
  // Find all unpaid orders
  const unpaidOrders = orders.filter(order => !order.paid);
  
  const itemsToDisplay = unpaidOrders.length > 0 ? unpaidOrders.flatMap(o => o.items) : cart;

  const currentOrderItems = Object.values(itemsToDisplay.reduce((acc, item) => {
    if (acc[item.id]) {
      acc[item.id].quantity += item.quantity;
    } else {
      acc[item.id] = { ...item };
    }
    return acc;
  }, {} as { [id: string]: CartItem }));

  // Calculate total quantity and total price for current order
  const totalQuantity = currentOrderItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = currentOrderItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

  const combinedItems = combineOrders(orders);
  const paidTotalPrice = combinedItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const handlePlaceOrder = () => {
    if (cart.length > 0) {
      addOrder();
    }
  };

  const handlePayAll = () => {
    if (unpaidOrders.length > 0) {
      // Instead of marking as paid directly, navigate to Payment page
      router.push({
        pathname: '/pages/Payment',
        params: {
          order: JSON.stringify({
            items: currentOrderItems,
            totalPrice,
            totalQuantity,
          }),
        },
      });
    }
  };

  // Handler to navigate to OrderDetails with all paid orders combined
  const handleOrderDetails = () => {
    // Get all paid orders
    const paidOrders = orders.filter(order => order.paid);
    if (paidOrders.length === 0) return;
    // Generate a random 9-digit OrderId
    const generateOrderId = () => Math.floor(100000000 + Math.random() * 900000000).toString();
    // Pass all paid orders as a single summary order
    const summaryOrder = {
      orderId: generateOrderId(),
      items: combineOrders(orders).map(({ totalPrice, ...item }) => item),
      paid: true,
    };
    router.push({
      pathname: '/pages/OrderDetails',
      params: { order: JSON.stringify(summaryOrder) },
    });
  };

  // Get all paid orders for past orders section
  const paidOrders = orders.filter(order => order.paid);

  return (
    <View className="flex-1 bg-orange-500">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <Text className="text-white text-5xl font-bold text-center mt-10 mb-4">Orders</Text>
        {/* Past Orders Section */}
        <Text className="text-white text-xl font-bold px-4 mb-2">Past Orders</Text>
        {paidOrders.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-white text-2xl">No paid orders yet.</Text>
            <Text className="text-white text-lg mt-2">Place and pay for an order to see it here.</Text>
          </View>
        ) : (
          <View className="px-4  mb-20">
            {paidOrders.map((order) => {
              const orderTotal = order.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
              return (
                <TouchableOpacity
                  key={order.orderId}
                  onPress={() => router.push({
                    pathname: '/pages/OrderDetails',
                    params: { order: JSON.stringify(order) },
                  })}
                  activeOpacity={0.8}
                >
                  <View className="bg-white rounded-xl p-4 mb-4 shadow">
                    <Text className="text-lg font-bold text-gray-800 mb-2">Paid Orders Summary</Text>
                    {order.items.map((item) => (
                      <View key={item.id} className="flex-row items-center mb-1">
                        <Text className="flex-1 text-gray-800">{item.name}</Text>
                        <Text className="text-gray-600 mr-2">Qty: {item.quantity}</Text>
                        <Text className="text-orange-600 font-bold">₹{Number(item.price) * item.quantity}</Text>
                      </View>
                    ))}
                    <Text className="text-right text-lg font-bold text-orange-600 mt-2">
                      Total: ₹{orderTotal}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  )
}