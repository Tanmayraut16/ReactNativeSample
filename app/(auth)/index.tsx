import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Sparkles, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function AuthIndex() {
  return (
    <LinearGradient
      colors={['#000000', '#1f2937', '#374151', '#1f2937', '#000000']}
      className="flex-1"
    >
      <View className="flex-1 px-8 justify-center">

        {/* Hero Section */}
        <View className="mb-12 items-center">
          <Text className="text-white text-5xl font-black text-center mb-4 leading-tight">
            Your Journey{'\n'}
            <Text className="text-orange-500">Starts Here</Text>
          </Text>
          <Text className="text-gray-300 text-lg text-center leading-7 max-w-sm">
            Join thousands of users who trust us with their daily needs and discover endless possibilities
          </Text>
        </View>

        {/* Buttons */}
        <View className="space-y-4 mb-12">
          <Link href="./login" asChild>
            <TouchableOpacity 
              className="bg-black/50 py-5 mb-2 rounded-2xl items-center border-2 border-orange-500/50 active:scale-95 active:bg-orange-500/10"
              // style={{
              //   shadowColor: '#000',
              //   shadowOffset: { width: 0, height: 4 },
              //   shadowOpacity: 0.3,
              //   shadowRadius: 8,
              //   elevation: 8,
              // }}
            >
              <Text className="text-orange-500 text-lg font-bold">Log In</Text>
            </TouchableOpacity>
          </Link>

          <Link href="./signup" asChild>
            <TouchableOpacity 
              className="bg-black/50 py-5 rounded-2xl items-center border-2 border-orange-500/50 active:scale-95 active:bg-orange-500/10"
              
            >
              <Text className="text-orange-500 text-lg font-bold">Create Account</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Footer */}
        <View className="items-center">
          <Text className="text-gray-500 text-xs text-center leading-5 max-w-xs">
            By continuing, you agree to our{' '}
            <Text className="text-orange-500 underline">Terms of Service</Text>
            {' '}and{' '}
            <Text className="text-orange-500 underline">Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}