import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
  StatusBar,
  FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface Category {
  slug: string;
  name: string;
  url: string;
}

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  thumbnail: string;
  [key: string]: any;
}

const { width } = Dimensions.get("window");

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [showProducts, setShowProducts] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const { logout: authLogout, user } = useAuth();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch(
          "https://dummyjson.com/products/categories"
        );
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        // Fetch featured products
        const featuredResponse = await fetch(
          "https://dummyjson.com/products?limit=6&skip=0"
        );
        const featuredData = await featuredResponse.json();
        setFeaturedProducts(featuredData.products || []);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        Alert.alert("Error", "Failed to load data");
      }
    };

    fetchInitialData();
  }, []);

  const fetchProductsForCategory = async (categorySlug: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://dummyjson.com/products/category/${categorySlug}`);
      const data = await response.json();

      setTimeout(() => {
        setProducts(data.products || []);
        setSelectedCategorySlug(categorySlug);
        setShowProducts(true);
        setIsLoading(false);
      }, 300);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      Alert.alert("Error", "Failed to fetch products");
      setIsLoading(false);
    }
  };

  const handleProductClick = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  const handleCategoryChange = (slug: string) => {
    if (slug && slug !== selectedCategorySlug) {
      setShowProducts(false);
      setTimeout(() => {
        fetchProductsForCategory(slug);
      }, 200);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await authLogout();
              router.replace("/(auth)");
            } catch (error) {
              console.error("Logout failed:", error);
              Alert.alert("Error", "Failed to logout");
            }
          },
        },
      ]
    );
  };

  const getDiscountedPrice = (price: number, discountPercentage: number) => {
    return price - (price * discountPercentage / 100);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={12} color="#fb923c" />);
    }

    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={12} color="#fb923c" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={12} color="#6b7280" />);
    }

    return stars;
  };


  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      onPress={() => handleProductClick(item)}
      className="bg-gray-800 rounded-2xl p-4 mb-4 border border-orange-500/10"
    >
      <View className="flex-row">
        <View className="bg-white/5 rounded-xl mr-4 overflow-hidden">
          <Image
            source={{ uri: item.thumbnail }}
            className="w-20 h-20"
            resizeMode="cover"
          />
        </View>
        
        <View className="flex-1">
          <View className="flex-row items-start justify-between mb-2">
            <Text className="text-white font-semibold text-base flex-1 mr-2" numberOfLines={2}>
              {item.title}
            </Text>
            {item.discountPercentage > 0 && (
              <View className="bg-red-500 px-2 py-1 rounded-full">
                <Text className="text-white text-xs font-bold">
                  -{item.discountPercentage.toFixed(0)}%
                </Text>
              </View>
            )}
          </View>
          
          <Text className="text-orange-300 text-sm mb-2">{item.brand}</Text>
          
          <View className="flex-row items-center mb-2">
            {renderStars(item.rating)}
            <Text className="text-gray-400 text-xs ml-2">({item.rating})</Text>
          </View>
          
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-orange-400 font-bold text-lg">
                ${getDiscountedPrice(item.price, item.discountPercentage).toFixed(2)}
              </Text>
              {item.discountPercentage > 0 && (
                <Text className="text-gray-500 line-through ml-2 text-sm">
                  ${item.price.toFixed(2)}
                </Text>
              )}
            </View>
            <View className="flex-row items-center">
              <Ionicons name="cube-outline" size={14} color="#6b7280" />
              <Text className="text-gray-400 text-sm ml-1">{item.stock} left</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      
      {/* Header */}
      <View className="bg-gray-800 pt-12 pb-6 px-6 border-b border-orange-500/10">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-gray-400 text-sm">Welcome back,</Text>
            <Text className="text-white text-2xl font-bold">
              {user?.name || "User"}!
            </Text>
          </View>
          
          <View className="flex-row items-center gap-2">
            <TouchableOpacity className="p-3 rounded-full bg-orange-600/10">
              <Ionicons name="search-outline" size={20} color="#fb923c" />
            </TouchableOpacity>
            
            <TouchableOpacity className="p-3 rounded-full bg-orange-600/10">
              <Ionicons name="notifications-outline" size={20} color="#fb923c" />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleLogout}
              className="bg-orange-600 px-4 py-2 rounded-xl"
            >
              <Text className="text-white font-medium">Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* Category Selection */}
        <View className="px-6 py-6 pb-6">
          <View className="bg-gray-800 rounded-2xl p-6 border border-orange-500/10">
            <View className="flex-row items-center mb-4">
              <View className="bg-orange-500/10 p-2 rounded-full mr-3">
                <Ionicons name="grid-outline" size={20} color="#fb923c" />
              </View>
              <Text className="text-white text-xl font-bold">Browse Categories</Text>
            </View>

            <View className="bg-gray-700 rounded-xl border border-orange-500/20 overflow-hidden">
              <Picker
                selectedValue={selectedCategorySlug}
                onValueChange={handleCategoryChange}
                enabled={!isLoading}
                style={{ color: "white", backgroundColor: "transparent" }}
                dropdownIconColor="#fb923c"
              >
                <Picker.Item label="Choose a category..." value="" />
                {categories.map((category) => (
                  <Picker.Item
                    key={category.slug}
                    label={category.name}
                    value={category.slug}
                  />
                ))}
              </Picker>
            </View>

            {selectedCategorySlug && (
              <View className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mt-4">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={16} color="#fb923c" />
                  <Text className="text-orange-300 text-sm font-medium ml-2">
                    Selected Category:
                  </Text>
                </View>
                <Text className="text-white font-semibold mt-1">
                  {categories.find((cat) => cat.slug === selectedCategorySlug)?.name}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Loading Indicator */}
        {isLoading && (
          <View className="px-6 pb-6">
            <View className="bg-gray-800 rounded-2xl p-12 items-center border border-orange-500/10">
              <ActivityIndicator size="large" color="#fb923c" />
              <Text className="text-orange-300 text-lg mt-4 font-medium">
                Loading products...
              </Text>
              <Text className="text-gray-400 text-sm mt-2">
                Please wait while we fetch the latest products
              </Text>
            </View>
          </View>
        )}

        {/* Products List */}
        {showProducts && !isLoading && (
          <View className="px-6 pb-6">
            <View className="bg-gray-800 rounded-2xl p-6 border border-orange-500/10">
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center">
                  <View className="bg-orange-500/10 p-2 rounded-full mr-3">
                    <Ionicons name="bag-outline" size={20} color="#fb923c" />
                  </View>
                  <View>
                    <Text className="text-white text-xl font-bold">Products</Text>
                    <Text className="text-gray-400 text-sm">
                      {categories.find((cat) => cat.slug === selectedCategorySlug)?.name}
                    </Text>
                  </View>
                </View>
                
                <View className="bg-orange-500/20 px-3 py-2 rounded-full">
                  <Text className="text-orange-300 text-sm font-medium">
                    {products.length} items
                  </Text>
                </View>
              </View>

              {products.length > 0 ? (
                <FlatList
                  data={products}
                  renderItem={renderProduct}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View className="items-center py-12">
                  <View className="bg-orange-500/10 p-4 rounded-full mb-4">
                    <Ionicons name="bag-outline" size={40} color="#fb923c" />
                  </View>
                  <Text className="text-orange-300 text-lg font-medium">
                    No products found
                  </Text>
                  <Text className="text-gray-400 text-center mt-2">
                    This category doesn't have any products available right now
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Empty State */}
        {!showProducts && !isLoading && (
          <View className="px-6 pb-6">
            <View className="bg-gray-800 rounded-2xl p-12 items-center border border-orange-500/10">
              <View className="bg-orange-500/10 p-4 rounded-full mb-4">
                <Ionicons name="storefront-outline" size={40} color="#fb923c" />
              </View>
              <Text className="text-orange-300 text-lg font-medium">
                Ready to explore?
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                Select a category above to discover amazing products
              </Text>
            </View>
          </View>
        )}

        {/* Bottom spacing */}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}