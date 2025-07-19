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
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import PaymentModal from "@/components/PaymentModal";

interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand: string;
  sku: string;
  weight: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: Review[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  images: string[];
  thumbnail: string;
}

const { width } = Dimensions.get("window");

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`https://dummyjson.com/products/${id}`);
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        Alert.alert("Error", "Failed to fetch product details");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleBuyNow = () => {
    if (product) {
      setShowPaymentModal(true);
    }
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={14} color="#fb923c" />);
    }

    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={14} color="#fb923c" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={14} color="#9ca3af" />);
    }

    return stars;
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <StatusBar barStyle="light-content" backgroundColor="#111827" />
        <ActivityIndicator size="large" color="#fb923c" />
        <Text className="text-orange-300 text-lg mt-4 font-medium">Loading product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center px-6">
        <StatusBar barStyle="light-content" backgroundColor="#111827" />
        <Ionicons name="alert-circle-outline" size={80} color="#fb923c" />
        <Text className="text-white text-xl font-bold mt-4">Product not found</Text>
        <Text className="text-gray-400 text-center mt-2">
          Sorry, we {`couldn't`} find the product {`you're`} looking for.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-orange-600 px-8 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const discountedPrice = product.price - (product.price * product.discountPercentage / 100);

  return (
    <View className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      
      {/* Header */}
      <View className="bg-gray-800 pt-12 pb-4 px-4 border-b border-orange-500/10">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4 p-2 rounded-full bg-orange-600/10"
          >
            <Ionicons name="arrow-back" size={24} color="#fb923c" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-white flex-1" numberOfLines={1}>
            Product Details
          </Text>
          <TouchableOpacity className="p-2 rounded-full bg-orange-600/10">
            <Ionicons name="share-outline" size={24} color="#fb923c" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Product Images */}
        <View className="bg-gray-800 mx-4 mt-4 rounded-2xl overflow-hidden">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / (width - 32));
              setCurrentImageIndex(index);
            }}
          >
            {product.images.map((image, index) => (
              <View key={index} className="bg-white/5 items-center justify-center" style={{ width: width - 32 }}>
                <Image
                  source={{ uri: image }}
                  style={{ width: width - 64, height: 300 }}
                  className="rounded-xl"
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>
          
          {product.images.length > 1 && (
            <View className="flex-row justify-center py-4">
              {product.images.map((_, index) => (
                <View
                  key={index}
                  className={`w-2 h-2 rounded-full mx-1 ${
                    index === currentImageIndex ? "bg-orange-500" : "bg-gray-600"
                  }`}
                />
              ))}
            </View>
          )}
          
          {/* Badge */}
          {product.discountPercentage > 0 && (
            <View className="absolute top-4 right-4 bg-red-500 px-3 py-1 rounded-full">
              <Text className="text-white text-sm font-bold">
                -{product.discountPercentage.toFixed(0)}% OFF
              </Text>
            </View>
          )}
        </View>

        {/* Product Header */}
        <View className="px-4 py-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-orange-400 text-sm font-medium uppercase tracking-wider">
              {product.brand}
            </Text>
            <View className="flex-row items-center bg-gray-800 px-3 py-1 rounded-full">
              <Ionicons name="star" size={12} color="#fb923c" />
              <Text className="text-white text-sm ml-1 font-medium">
                {product.rating}
              </Text>
            </View>
          </View>
          
          <Text className="text-white text-2xl font-bold mb-3 leading-tight">
            {product.title}
          </Text>
          
          <View className="flex-row items-center mb-4">
            <View className="flex-row items-center">
              {renderStars(product.rating)}
              <Text className="text-gray-400 ml-2 text-sm">
                ({product.reviews.length} reviews)
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mb-4">
            <Text className="text-white text-3xl font-bold">
              ${discountedPrice.toFixed(2)}
            </Text>
            {product.discountPercentage > 0 && (
              <Text className="text-gray-500 line-through ml-3 text-xl">
                ${product.price.toFixed(2)}
              </Text>
            )}
          </View>

          <View className="flex-row items-center mb-4">
            <View className="flex-row items-center mr-6">
              <Ionicons name="cube-outline" size={16} color="#fb923c" />
              <Text className="text-gray-400 ml-2 text-sm">
                {product.stock} in stock
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text className="text-green-400 ml-2 text-sm font-medium">
                {product.availabilityStatus}
              </Text>
            </View>
          </View>

          {/* Tags */}
          <View className="flex-row flex-wrap gap-2 mb-6">
            {product.tags.slice(0, 4).map((tag, index) => (
              <View key={index} className="bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
                <Text className="text-orange-300 text-xs font-medium">{tag}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <View className="bg-gray-800 rounded-2xl p-6 mb-6">
            <Text className="text-orange-400 text-lg font-bold mb-3">Description</Text>
            <Text className="text-gray-300 leading-6">{product.description}</Text>
          </View>

          {/* Specifications */}
          <View className="bg-gray-800 rounded-2xl p-6 mb-6">
            <Text className="text-orange-400 text-lg font-bold mb-4">Specifications</Text>
            
            <View className="space-y-4">
              {[
                { label: "Category", value: product.category, icon: "apps-outline" },
                { label: "SKU", value: product.sku, icon: "barcode-outline" },
                { label: "Weight", value: `${product.weight} kg`, icon: "fitness-outline" },
                { label: "Dimensions", value: `${product.dimensions.width} × ${product.dimensions.height} × ${product.dimensions.depth} cm`, icon: "resize-outline" },
                { label: "Min Order", value: `${product.minimumOrderQuantity} units`, icon: "bag-outline" },
              ].map((spec, index) => (
                <View key={index} className="flex-row items-center justify-between py-2">
                  <View className="flex-row items-center flex-1">
                    <Ionicons name={spec.icon as any} size={20} color="#fb923c" />
                    <Text className="text-gray-400 ml-3 font-medium">{spec.label}</Text>
                  </View>
                  <Text className="text-white font-medium">{spec.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Shipping & Warranty */}
          <View className="bg-gray-800 rounded-2xl p-6 mb-6">
            <Text className="text-orange-400 text-lg font-bold mb-4">Shipping & Warranty</Text>
            
            <View className="space-y-4">
              <View className="flex-row items-start">
                <View className="bg-orange-500/10 p-2 rounded-full mr-4">
                  <Ionicons name="car-outline" size={20} color="#fb923c" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-medium mb-1">Shipping</Text>
                  <Text className="text-gray-400 text-sm">{product.shippingInformation}</Text>
                </View>
              </View>
              
              <View className="flex-row items-start">
                <View className="bg-orange-500/10 p-2 rounded-full mr-4">
                  <Ionicons name="shield-checkmark-outline" size={20} color="#fb923c" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-medium mb-1">Warranty</Text>
                  <Text className="text-gray-400 text-sm">{product.warrantyInformation}</Text>
                </View>
              </View>
              
              <View className="flex-row items-start">
                <View className="bg-orange-500/10 p-2 rounded-full mr-4">
                  <Ionicons name="return-up-back-outline" size={20} color="#fb923c" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-medium mb-1">Returns</Text>
                  <Text className="text-gray-400 text-sm">{product.returnPolicy}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Reviews */}
          <View className="bg-gray-800 rounded-2xl p-6 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-orange-400 text-lg font-bold">Reviews</Text>
              <View className="flex-row items-center">
                <Ionicons name="star" size={16} color="#fb923c" />
                <Text className="text-white ml-1 font-medium">
                  {product.rating} ({product.reviews.length})
                </Text>
              </View>
            </View>
            
            {product.reviews.length > 0 ? (
              <View className="gap-4">
                {product.reviews.slice(0, 2).map((review, index) => (
                  <View key={index} className="bg-gray-700/50 rounded-xl p-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-white font-medium">{review.reviewerName}</Text>
                      <Text className="text-gray-400 text-sm">
                        {new Date(review.date).toLocaleDateString()}
                      </Text>
                    </View>
                    
                    <View className="flex-row items-center mb-2">
                      {renderStars(review.rating)}
                      <Text className="text-gray-400 ml-2 text-sm">({review.rating})</Text>
                    </View>
                    
                    <Text className="text-gray-300 text-sm leading-5">{review.comment}</Text>
                  </View>
                ))}
                
                {product.reviews.length > 2 && (
                  <TouchableOpacity className="bg-orange-500/10 border border-orange-500/20 py-3 px-4 rounded-xl">
                    <Text className="text-orange-300 text-center font-medium">
                      View all {product.reviews.length} reviews
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View className="items-center py-8">
                <Ionicons name="chatbubble-outline" size={40} color="#6b7280" />
                <Text className="text-gray-400 text-center mt-2">No reviews yet</Text>
                <Text className="text-gray-500 text-center text-sm mt-1">
                  Be the first to review this product
                </Text>
              </View>
            )}
          </View>

          {/* Bottom spacing */}
          <View className="h-24" />
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View className="bg-gray-800 border-t border-orange-500/10 px-4 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-gray-400 text-sm">Total Price</Text>
            <Text className="text-white text-xl font-bold">
              ${discountedPrice.toFixed(2)}
            </Text>
          </View>
          
          <View className="flex-row items-center gap-3">
            <TouchableOpacity 
              className="bg-gray-700 px-4 py-3 rounded-xl"
              onPress={() => Alert.alert("Added to Cart", "Product added to cart successfully!")}
            >
              <Ionicons name="cart-outline" size={20} color="#fb923c" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`px-8 py-3 rounded-xl ${
                product.stock === 0 ? "bg-gray-600" : "bg-orange-600"
              }`}
              onPress={handleBuyNow}
              disabled={product.stock === 0}
            >
              <Text className="text-white font-semibold">
                {product.stock === 0 ? "Out of Stock" : "Buy Now"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Payment Modal */}
      {showPaymentModal && product && (
        <PaymentModal
          visible={showPaymentModal}
          onClose={closePaymentModal}
          product={product}
        />
      )}
    </View>
  );
}