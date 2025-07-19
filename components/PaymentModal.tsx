import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Product {
  id: number;
  title: string;
  price: number;
  discountPercentage: number;
  thumbnail: string;
}

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  product: Product;
  discountedPrice: number;
}

export default function PaymentModal({ visible, onClose, product, discountedPrice }: PaymentModalProps) {
  const [currentStep, setCurrentStep] = useState("details"); // details, payment, processing, success
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  });

  const handlePayment = async () => {
    setIsProcessing(true);
    setCurrentStep("processing");
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep("success");
    }, 2500);
  };

  const resetAndClose = () => {
    setCurrentStep("details");
    setQuantity(1);
    setPaymentMethod("card");
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      zipCode: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardName: "",
    });
    onClose();
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const isDetailsValid = () => {
    return formData.fullName && formData.email && formData.phone && formData.address && formData.city && formData.zipCode;
  };

  const isPaymentValid = () => {
    if (paymentMethod === "card") {
      return formData.cardNumber && formData.expiryDate && formData.cvv && formData.cardName;
    }
    return true;
  };

  const totalAmount = discountedPrice * quantity;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={resetAndClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-black"
      >
        {/* Header */}
        <View className="bg-gray-900 border-b border-orange-500/20 pt-12 pb-4 px-6">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={resetAndClose}
              className="p-2 rounded-full bg-orange-500/10"
            >
              <Ionicons name="close" size={24} color="#f97316" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-white">
              {currentStep === "details" ? "Checkout" : 
               currentStep === "payment" ? "Payment" : 
               currentStep === "processing" ? "Processing" : "Complete"}
            </Text>
            <View className="w-10" />
          </View>
        </View>

        {/* Order Summary - Always visible */}
        <View className="bg-gray-900 mx-6 mt-6 rounded-lg p-4">
          <View className="flex-row items-center">
            <Image
              source={{ uri: product.thumbnail }}
              className="w-16 h-16 rounded-lg"
            />
            <View className="flex-1 ml-4">
              <Text className="text-white font-medium text-base" numberOfLines={2}>
                {product.title}
              </Text>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-gray-400">Qty: {quantity}</Text>
                <Text className="text-orange-400 font-bold text-lg">
                  ${totalAmount.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 py-6">
          {/* Shipping Details */}
          {currentStep === "details" && (
            <View className="bg-gray-900 rounded-lg p-6">
              <Text className="text-white font-bold text-lg mb-4">Shipping Details</Text>
              
              <View className="gap-4">
                <View>
                  <Text className="text-gray-300 mb-2">Full Name</Text>
                  <TextInput
                    value={formData.fullName}
                    onChangeText={(text) => setFormData({...formData, fullName: text})}
                    placeholder="Enter your full name"
                    placeholderTextColor="#6b7280"
                    className="bg-black border border-gray-600 rounded-lg px-4 py-3 text-white"
                  />
                </View>
                
                <View>
                  <Text className="text-gray-300 mb-2">Email</Text>
                  <TextInput
                    value={formData.email}
                    onChangeText={(text) => setFormData({...formData, email: text})}
                    placeholder="Enter your email"
                    placeholderTextColor="#6b7280"
                    keyboardType="email-address"
                    className="bg-black border border-gray-600 rounded-lg px-4 py-3 text-white"
                  />
                </View>
                
                <View>
                  <Text className="text-gray-300 mb-2">Phone</Text>
                  <TextInput
                    value={formData.phone}
                    onChangeText={(text) => setFormData({...formData, phone: text})}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#6b7280"
                    keyboardType="phone-pad"
                    className="bg-black border border-gray-600 rounded-lg px-4 py-3 text-white"
                  />
                </View>
                
                <View>
                  <Text className="text-gray-300 mb-2">Address</Text>
                  <TextInput
                    value={formData.address}
                    onChangeText={(text) => setFormData({...formData, address: text})}
                    placeholder="Enter your address"
                    placeholderTextColor="#6b7280"
                    className="bg-black border border-gray-600 rounded-lg px-4 py-3 text-white"
                  />
                </View>
                
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="text-gray-300 mb-2">City</Text>
                    <TextInput
                      value={formData.city}
                      onChangeText={(text) => setFormData({...formData, city: text})}
                      placeholder="City"
                      placeholderTextColor="#6b7280"
                      className="bg-black border border-gray-600 rounded-lg px-4 py-3 text-white"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-300 mb-2">ZIP Code</Text>
                    <TextInput
                      value={formData.zipCode}
                      onChangeText={(text) => setFormData({...formData, zipCode: text})}
                      placeholder="ZIP"
                      placeholderTextColor="#6b7280"
                      className="bg-black border border-gray-600 rounded-lg px-4 py-3 text-white"
                    />
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Payment Method */}
          {currentStep === "payment" && (
            <View className="bg-gray-900 rounded-lg p-6">
              <Text className="text-white font-bold text-lg mb-4">Payment Method</Text>
              
              {/* Payment Options */}
              <View className="mb-6">
                <TouchableOpacity
                  onPress={() => setPaymentMethod("card")}
                  className={`flex-row items-center p-4 rounded-lg border-2 mb-3 ${
                    paymentMethod === "card" 
                      ? "bg-orange-500/10 border-orange-500" 
                      : "bg-black border-gray-600"
                  }`}
                >
                  <Ionicons name="card" size={24} color={paymentMethod === "card" ? "#f97316" : "#9ca3af"} />
                  <Text className={`ml-3 font-medium ${paymentMethod === "card" ? "text-orange-400" : "text-white"}`}>
                    Credit/Debit Card
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setPaymentMethod("upi")}
                  className={`flex-row items-center p-4 rounded-lg border-2 mb-3 ${
                    paymentMethod === "upi" 
                      ? "bg-orange-500/10 border-orange-500" 
                      : "bg-black border-gray-600"
                  }`}
                >
                  <Ionicons name="phone-portrait" size={24} color={paymentMethod === "upi" ? "#f97316" : "#9ca3af"} />
                  <Text className={`ml-3 font-medium ${paymentMethod === "upi" ? "text-orange-400" : "text-white"}`}>
                    UPI Payment
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setPaymentMethod("wallet")}
                  className={`flex-row items-center p-4 rounded-lg border-2 ${
                    paymentMethod === "wallet" 
                      ? "bg-orange-500/10 border-orange-500" 
                      : "bg-black border-gray-600"
                  }`}
                >
                  <Ionicons name="wallet" size={24} color={paymentMethod === "wallet" ? "#f97316" : "#9ca3af"} />
                  <Text className={`ml-3 font-medium ${paymentMethod === "wallet" ? "text-orange-400" : "text-white"}`}>
                    Digital Wallet
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Card Details */}
              {paymentMethod === "card" && (
                <View className="space-y-4">
                  <View>
                    <Text className="text-gray-300 mb-2">Card Number</Text>
                    <TextInput
                      value={formData.cardNumber}
                      onChangeText={(text) => setFormData({...formData, cardNumber: formatCardNumber(text)})}
                      placeholder="1234 5678 9012 3456"
                      placeholderTextColor="#6b7280"
                      keyboardType="numeric"
                      maxLength={19}
                      className="bg-black border border-gray-600 rounded-lg px-4 py-3 text-white"
                    />
                  </View>
                  
                  <View>
                    <Text className="text-gray-300 mb-2">Cardholder Name</Text>
                    <TextInput
                      value={formData.cardName}
                      onChangeText={(text) => setFormData({...formData, cardName: text})}
                      placeholder="John Doe"
                      placeholderTextColor="#6b7280"
                      className="bg-black border border-gray-600 rounded-lg px-4 py-3 text-white"
                    />
                  </View>
                  
                  <View className="flex-row space-x-3">
                    <View className="flex-1">
                      <Text className="text-gray-300 mb-2">Expiry Date</Text>
                      <TextInput
                        value={formData.expiryDate}
                        onChangeText={(text) => setFormData({...formData, expiryDate: formatExpiryDate(text)})}
                        placeholder="MM/YY"
                        placeholderTextColor="#6b7280"
                        keyboardType="numeric"
                        maxLength={5}
                        className="bg-black border border-gray-600 rounded-lg px-4 py-3 text-white"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-300 mb-2">CVV</Text>
                      <TextInput
                        value={formData.cvv}
                        onChangeText={(text) => setFormData({...formData, cvv: text})}
                        placeholder="123"
                        placeholderTextColor="#6b7280"
                        keyboardType="numeric"
                        maxLength={3}
                        secureTextEntry
                        className="bg-black border border-gray-600 rounded-lg px-4 py-3 text-white"
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* UPI Payment */}
              {paymentMethod === "upi" && (
                <View className="items-center py-6">
                  <View className="bg-white p-6 rounded-lg mb-4">
                    <Ionicons name="qr-code" size={100} color="#000" />
                  </View>
                  <Text className="text-white font-medium mb-2">
                    Scan QR Code with your UPI app
                  </Text>
                  <Text className="text-gray-400 text-center">
                    Or pay to: merchant@upi
                  </Text>
                </View>
              )}

              {/* Wallet Payment */}
              {paymentMethod === "wallet" && (
                <View className="items-center py-6">
                  <Text className="text-white font-medium mb-4">
                    Choose your wallet:
                  </Text>
                  <View className="flex-row space-x-4">
                    <TouchableOpacity className="bg-blue-600 px-6 py-3 rounded-lg">
                      <Text className="text-white font-medium">PayTM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-green-600 px-6 py-3 rounded-lg">
                      <Text className="text-white font-medium">PhonePe</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-red-600 px-6 py-3 rounded-lg">
                      <Text className="text-white font-medium">GPay</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Processing */}
          {currentStep === "processing" && (
            <View className="bg-gray-900 rounded-lg p-12 items-center">
              <ActivityIndicator size="large" color="#f97316" />
              <Text className="text-white text-xl font-bold mt-4">
                Processing Payment
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                Please wait...
              </Text>
            </View>
          )}

          {/* Success */}
          {currentStep === "success" && (
            <View className="bg-gray-900 rounded-lg p-12 items-center">
              <View className="bg-green-500 rounded-full p-4 mb-4">
                <Ionicons name="checkmark" size={48} color="white" />
              </View>
              <Text className="text-green-400 text-2xl font-bold mb-2">
                Payment Successful!
              </Text>
              <Text className="text-gray-400 text-center mb-6">
                Your order has been placed successfully
              </Text>
              <View className="bg-green-500/10 border border-green-500 p-4 rounded-lg w-full">
                <Text className="text-green-400 font-bold text-center">
                  Order ID: #ORD{Date.now().toString().slice(-6)}
                </Text>
                <Text className="text-white text-center mt-1">
                  Delivery in 3-5 business days
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer Button */}
        <View className="bg-gray-900 border-t border-gray-700 p-6">
          {currentStep === "details" && (
            <TouchableOpacity
              onPress={() => setCurrentStep("payment")}
              disabled={!isDetailsValid()}
              className={`py-4 rounded-lg ${
                isDetailsValid() ? "bg-orange-500" : "bg-gray-600"
              }`}
            >
              <Text className="text-white text-center text-lg font-bold">
                Continue to Payment
              </Text>
            </TouchableOpacity>
          )}
          
          {currentStep === "payment" && (
            <TouchableOpacity
              onPress={handlePayment}
              disabled={!isPaymentValid()}
              className={`py-4 rounded-lg ${
                isPaymentValid() ? "bg-orange-500" : "bg-gray-600"
              }`}
            >
              <Text className="text-white text-center text-lg font-bold">
                Pay ${totalAmount.toFixed(2)}
              </Text>
            </TouchableOpacity>
          )}
          
          {currentStep === "success" && (
            <TouchableOpacity
              onPress={resetAndClose}
              className="bg-green-500 py-4 rounded-lg"
            >
              <Text className="text-white text-center text-lg font-bold">
                Continue Shopping
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}