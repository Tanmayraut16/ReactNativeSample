import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { User, Mail, Lock, UserPlus, Eye, EyeOff } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  setHasAccount: (value: boolean) => void;
}

const Signup: React.FC<Props> = ({ setHasAccount }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const { signup, isLoading } = useAuth();
  const router = useRouter();

  const isValidFullName = (name: string): boolean => {
    // Must be 2-50 characters, only letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
    const trimmedName = name.trim();
    
    if (!nameRegex.test(trimmedName)) return false;
    if (trimmedName.length < 2) return false;
    
    // Check for at least one letter
    if (!/[a-zA-Z]/.test(trimmedName)) return false;
    
    // Prevent multiple consecutive spaces or special characters
    if (/[\s\-']{2,}/.test(trimmedName)) return false;
    
    return true;
  };

  const isValidEmail = (email: string): boolean => {
    // More comprehensive email validation
    const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-])*[a-zA-Z0-9]@[a-zA-Z0-9]([a-zA-Z0-9.-])*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!emailRegex.test(trimmedEmail)) return false;
    if (trimmedEmail.length > 254) return false; // RFC 5321 limit
    
    // Check for common disposable email domains (basic list)
    const disposableDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com'];
    const domain = trimmedEmail.split('@')[1];
    if (disposableDomains.includes(domain)) return false;
    
    return true;
  };

  const getPasswordRequirements = (password: string) => {
    return {
      minLength: { met: password.length >= 8, text: "At least 8 characters" },
      maxLength: { met: password.length <= 128, text: "Maximum 128 characters" },
      uppercase: { met: /[A-Z]/.test(password), text: "One uppercase letter" },
      lowercase: { met: /[a-z]/.test(password), text: "One lowercase letter" },
      number: { met: /[0-9]/.test(password), text: "One number" },
      special: { met: /[!@#$%^&*(),.?":{}|<>_+=\[\]\\;'`~\-]/.test(password), text: "One special character" },
      noSpaces: { met: !/\s/.test(password), text: "No spaces allowed" },
      noCommon: { met: !isCommonPassword(password), text: "Not a common password" }
    };
  };

  const isCommonPassword = (password: string): boolean => {
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
      'admin', 'letmein', 'welcome', '12345678', 'monkey', '1234567890'
    ];
    return commonPasswords.includes(password.toLowerCase());
  };

  const checkPasswordStrength = (password: string): string => {
    const requirements = getPasswordRequirements(password);
    const unmetRequirements = Object.values(requirements).filter(req => !req.met);
    
    if (unmetRequirements.length > 0) {
      return unmetRequirements[0].text;
    }
    return "";
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = "Full name is required";
    } else if (!isValidFullName(name)) {
      newErrors.name = "Enter a valid name (2-50 characters, letters only)";
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Enter a valid email address";
    }

    // Password validation
    const passwordError = checkPasswordStrength(password);
    if (!password) {
      newErrors.password = "Password is required";
    } else if (passwordError) {
      newErrors.password = passwordError;
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateForm();
  };

  const handleSignup = async () => {
    // Mark all fields as touched for validation
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    if (!validateForm()) return;

    const success = await signup(email.trim(), password.trim(), name.trim());
    if (success) {
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => router.replace("../HomePage") },
      ]);
    } else {
      Alert.alert(
        "Error",
        "Email already exists or signup failed. Please try again."
      );
    }
  };

  const getInputBorder = (field: string) => {
    if (errors[field]) return "border-red-500";
    if (field === "password" && password && !checkPasswordStrength(password))
      return "border-green-500";
    if (field === "confirmPassword" && confirmPassword && password === confirmPassword)
      return "border-green-500";
    if (field === "email" && email && isValidEmail(email)) return "border-green-500";
    if (field === "name" && name && isValidFullName(name)) return "border-green-500";
    return "border-orange-400";
  };

  const PasswordRequirements = ({ password }: { password: string }) => {
    const requirements = getPasswordRequirements(password);
    
    return (
      <View className="mt-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
        <Text className="text-orange-300 text-sm font-semibold mb-2">Password Requirements:</Text>
        {Object.entries(requirements).map(([key, req]) => (
          <View key={key} className="flex-row items-center mb-1">
            <View className={`w-2 h-2 rounded-full mr-2 ${req.met ? 'bg-green-500' : 'bg-red-500'}`} />
            <Text className={`text-xs ${req.met ? 'text-green-400' : 'text-red-400'}`}>
              {req.text}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <LinearGradient colors={["#000000", "#1f2937", "#000000"]} className="flex-1">
      <ScrollView
        className="flex-1 px-6 mt-10"
        contentContainerStyle={{ paddingVertical: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-orange-500/20 rounded-full justify-center items-center mb-6 border-2 border-orange-500">
            <UserPlus color="#f97316" size={32} />
          </View>
          <Text className="text-orange-500 text-3xl font-bold mb-2">Create Account</Text>
          <Text className="text-orange-300 text-base">Join us today</Text>
        </View>

        <View className="space-y-4 mb-8 gap-3">

          {/* Full Name */}
          <View>
            <View className="relative">
              <View className="absolute left-4 top-5 z-10">
                <User color="#fb923c" size={20} />
              </View>
              <TextInput
                placeholder="Full Name"
                placeholderTextColor="#fb923c"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (touched.name || errors.name) validateForm();
                }}
                onBlur={() => handleFieldBlur('name')}
                className={`w-full pl-12 pr-4 py-4 bg-black rounded-xl text-orange-100 text-base border ${getInputBorder("name")}`}
                maxLength={50}
                autoCapitalize="words"
              />
            </View>
            {errors.name && <Text className="text-red-400 text-sm mt-1 ml-2">{errors.name}</Text>}
          </View>

          {/* Email */}
          <View>
            <View className="relative">
              <View className="absolute left-4 top-5 z-10">
                <Mail color="#fb923c" size={20} />
              </View>
              <TextInput
                placeholder="Email"
                placeholderTextColor="#fb923c"
                value={email}
                onChangeText={(text) => {
                  setEmail(text.trim().toLowerCase());
                  if (touched.email || errors.email) validateForm();
                }}
                onBlur={() => handleFieldBlur('email')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                className={`w-full pl-12 pr-4 py-4 bg-black rounded-xl text-orange-100 text-base border ${getInputBorder("email")}`}
                maxLength={254}
              />
            </View>
            {errors.email && <Text className="text-red-400 text-sm mt-1 ml-2">{errors.email}</Text>}
          </View>

          {/* Password */}
          <View>
            <View className="relative">
              <View className="absolute left-4 top-5 z-10">
                <Lock color="#fb923c" size={20} />
              </View>
              <TouchableOpacity
                className="absolute right-4 top-5 z-10"
                onPress={() => setPasswordVisible((prev) => !prev)}
              >
                {passwordVisible ? <EyeOff color="#fb923c" size={20} /> : <Eye color="#fb923c" size={20} />}
              </TouchableOpacity>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#fb923c"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (touched.password || errors.password) validateForm();
                }}
                onBlur={() => handleFieldBlur('password')}
                secureTextEntry={!passwordVisible}
                className={`w-full pl-12 pr-12 py-4 bg-black rounded-xl text-orange-100 text-base border ${getInputBorder("password")}`}
                maxLength={128}
                autoComplete="new-password"
              />
            </View>
            {errors.password && <Text className="text-red-400 text-sm mt-1 ml-2">{errors.password}</Text>}
            {password && <PasswordRequirements password={password} />}
          </View>

          {/* Confirm Password */}
          <View>
            <View className="relative">
              <View className="absolute left-4 top-5 z-10">
                <Lock color="#fb923c" size={20} />
              </View>
              <TouchableOpacity
                className="absolute right-4 top-5 z-10"
                onPress={() => setConfirmPasswordVisible((prev) => !prev)}
              >
                {confirmPasswordVisible ? <EyeOff color="#fb923c" size={20} /> : <Eye color="#fb923c" size={20} />}
              </TouchableOpacity>
              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor="#fb923c"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (touched.confirmPassword || errors.confirmPassword) validateForm();
                }}
                onBlur={() => handleFieldBlur('confirmPassword')}
                secureTextEntry={!confirmPasswordVisible}
                className={`w-full pl-12 pr-12 py-4 bg-black rounded-xl text-orange-100 text-base border ${getInputBorder("confirmPassword")}`}
                maxLength={128}
                autoComplete="new-password"
              />
            </View>
            {errors.confirmPassword && (
              <Text className="text-red-400 text-sm mt-1 ml-2">{errors.confirmPassword}</Text>
            )}
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            onPress={handleSignup}
            disabled={isLoading}
            className="w-full rounded-xl items-center active:scale-95 disabled:opacity-60 mt-6"
            style={{
              backgroundColor: "#f97316",
              paddingVertical: 16,
              shadowColor: "#f97316",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            {isLoading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#fff" />
                <Text className="text-white text-base font-semibold ml-2">Creating Account...</Text>
              </View>
            ) : (
              <Text className="text-white text-base font-semibold">Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="items-center">
          <Text className="text-orange-300 text-base">
            Already have an account?{" "}
            <Text
              onPress={() => router.replace("./login")}
              className="text-orange-500 font-semibold"
            >
              Login
            </Text>
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default Signup;
