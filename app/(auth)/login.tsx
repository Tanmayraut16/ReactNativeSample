import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  setIsAuthenticated?: (value: boolean) => void;
  setHasAccount?: (value: boolean) => void;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  general?: string;
}

const Login: React.FC<Props> = ({ setIsAuthenticated, setHasAccount }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [attemptCount, setAttemptCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  
  const router = useRouter();
  const { login, isLoading } = useAuth();

  // Rate limiting - block after 5 failed attempts for 15 minutes
  const MAX_ATTEMPTS = 5;
  const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isBlocked && blockTimeRemaining > 0) {
      interval = setInterval(() => {
        setBlockTimeRemaining(prev => {
          if (prev <= 1000) {
            setIsBlocked(false);
            setAttemptCount(0);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBlocked, blockTimeRemaining]);

  // Enhanced email validation with industry standards
  const validateEmail = (email: string): string | null => {
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail) return "Email is required";
    
    // RFC 5321 length limits
    if (trimmedEmail.length > 254) return "Email address too long (max 254 characters)";
    
    // Enhanced email regex - more RFC compliant
    const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-])*[a-zA-Z0-9]@[a-zA-Z0-9]([a-zA-Z0-9.-])*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) return "Please enter a valid email address";
    
    // Split and validate parts
    const parts = trimmedEmail.split('@');
    if (parts.length !== 2) return "Invalid email format";
    
    const [localPart, domain] = parts;
    
    // Local part validation
    if (localPart.length > 64) return "Email username too long (max 64 characters)";
    if (localPart.length < 1) return "Email username required";
    
    // Check for consecutive dots or special characters
    if (/[._-]{2,}/.test(localPart)) return "Email cannot contain consecutive special characters";
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return "Email cannot start or end with a dot";
    }
    
    // Domain validation
    if (domain.length > 253) return "Email domain too long";
    if (domain.startsWith('-') || domain.endsWith('-') || domain.startsWith('.') || domain.endsWith('.')) {
      return "Invalid domain format";
    }
    
    // Check for valid domain structure
    const domainParts = domain.split('.');
    if (domainParts.some(part => part.length === 0 || part.length > 63)) {
      return "Invalid domain structure";
    }
    
    // Check for common typos in popular domains
    const domainSuggestions: { [key: string]: string } = {
      'gmial.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'yahooo.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
      'outlok.com': 'outlook.com'
    };
    
    if (domainSuggestions[domain]) {
      return `Did you mean ${domainSuggestions[domain]}?`;
    }
    
    return null;
  };

  // Enhanced password validation for login
  const validatePassword = (password: string): string | null => {
    if (!password) return "Password is required";
    
    // Basic length validation (for login, we don't need to check all creation rules)
    if (password.length < 1) return "Password cannot be empty";
    if (password.length > 128) return "Password too long (max 128 characters)";
    
    // Check for obvious security issues
    if (password.includes(' ')) return "Password cannot contain spaces";
    
    // Check for null bytes or other control characters
    if (/[\x00-\x1F\x7F]/.test(password)) return "Password contains invalid characters";
    
    return null;
  };

  // Real-time validation with debouncing
  const handleEmailChange = (text: string) => {
    const cleanedEmail = text.trim().toLowerCase();
    setEmail(cleanedEmail);
    
    if (touched.email) {
      const error = validateEmail(cleanedEmail);
      setErrors(prev => ({ ...prev, email: error || undefined }));
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (touched.password) {
      const error = validatePassword(text);
      setErrors(prev => ({ ...prev, password: error || undefined }));
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (field === 'email') {
      const error = validateEmail(email);
      setErrors(prev => ({ ...prev, email: error || undefined }));
    } else if (field === 'password') {
      const error = validatePassword(password);
      setErrors(prev => ({ ...prev, password: error || undefined }));
    }
  };

  const validateForm = (): boolean => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    setErrors({
      email: emailError || undefined,
      password: passwordError || undefined,
    });
    
    setTouched({ email: true, password: true });
    
    return !emailError && !passwordError;
  };

  const handleLogin = async () => {
    // Dismiss keyboard
    Keyboard.dismiss();
    
    if (isBlocked) {
      const minutes = Math.ceil(blockTimeRemaining / 60000);
      Alert.alert(
        "Account Temporarily Locked",
        `Too many failed login attempts. Please wait ${minutes} minute(s) before trying again.`
      );
      return;
    }

    if (!validateForm()) return;

    try {
      // Sanitize inputs before sending
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedPassword = password.replace(/[<>]/g, '');
      
      const success = await login(sanitizedEmail, sanitizedPassword);
      
      if (success) {
        // Reset attempt count on success
        setAttemptCount(0);
        setErrors({});
        router.replace("../HomePage");
      } else {
        // Increment attempt count on failure
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);
        
        if (newAttemptCount >= MAX_ATTEMPTS) {
          setIsBlocked(true);
          setBlockTimeRemaining(BLOCK_DURATION);
          Alert.alert(
            "Account Temporarily Locked",
            `Too many failed login attempts. Your account is locked for 15 minutes.`
          );
        } else {
          const remainingAttempts = MAX_ATTEMPTS - newAttemptCount;
          setErrors({ 
            general: `Invalid email or password. ${remainingAttempts} attempt(s) remaining.` 
          });
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrors({ 
        general: "Connection error. Please check your internet and try again." 
      });
    }
  };

  const getInputBorderColor = (field: string, hasError: boolean) => {
    if (hasError) return "border-red-500";
    if (touched[field] && !hasError) {
      if (field === 'email' && email && !validateEmail(email)) return "border-green-500";
      if (field === 'password' && password && !validatePassword(password)) return "border-green-500";
    }
    return "border-orange-400";
  };

  const formatBlockTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Security Tips Component
  const SecurityTips = () => (
    <View className="mt-4 p-3 bg-blue-500/10 border border-blue-500/50 rounded-lg">
      <Text className="text-blue-400 text-xs font-semibold mb-1">🔒 Security Tips:</Text>
      <Text className="text-blue-300 text-xs">• Use a unique password for this account</Text>
      <Text className="text-blue-300 text-xs">• Enable two-factor authentication when available</Text>
      <Text className="text-blue-300 text-xs">• Log out from shared or public devices</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={["#000000", "#1f2937", "#000000"]}
      className="flex-1"
    >
      <View className="flex-1 px-6 justify-center">
        {/* Header */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-orange-500/20 rounded-full justify-center items-center mb-6 border-2 border-orange-500">
            <Lock color="#f97316" size={32} />
          </View>
          <Text className="text-orange-500 text-3xl font-bold mb-2">
            Welcome Back
          </Text>
          <Text className="text-orange-300 text-base">
            Sign in to your account
          </Text>
        </View>

        {/* General Error */}
        {errors.general && (
          <View className="flex-row items-center bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4">
            <AlertCircle color="#ef4444" size={20} />
            <Text className="text-red-400 text-sm ml-2 flex-1">{errors.general}</Text>
          </View>
        )}

        {/* Rate Limiting Warning */}
        {isBlocked && (
          <View className="flex-row items-center bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3 mb-4">
            <AlertCircle color="#eab308" size={20} />
            <Text className="text-yellow-400 text-sm ml-2 flex-1">
              Account locked. Time remaining: {formatBlockTime(blockTimeRemaining)}
            </Text>
          </View>
        )}

        {/* Form */}
        <View className="space-y-6 mb-8 gap-4">
          {/* Email Input */}
          <View>
            <View className="relative">
              <View className="absolute left-4 top-5 z-10">
                <Mail color={errors.email ? "#ef4444" : "#fb923c"} size={20} />
              </View>
              <TextInput
                placeholder="Email"
                placeholderTextColor={errors.email ? "#fca5a5" : "#fb923c"}
                value={email}
                onChangeText={handleEmailChange}
                onBlur={() => handleFieldBlur('email')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                maxLength={254}
                editable={!isBlocked}
                className={`w-full pl-12 pr-4 py-4 bg-black rounded-xl text-orange-100 text-base border ${getInputBorderColor('email', !!errors.email)}`}
              />
            </View>
            {errors.email && (
              <View className="flex-row items-center mt-1 ml-2">
                <AlertCircle color="#ef4444" size={16} />
                <Text className="text-red-400 text-sm ml-1">{errors.email}</Text>
              </View>
            )}
          </View>

          {/* Password Input */}
          <View>
            <View className="relative">
              <View className="absolute left-4 top-5 z-10">
                <Lock color={errors.password ? "#ef4444" : "#fb923c"} size={20} />
              </View>
              <TouchableOpacity
                className="absolute right-4 top-5 z-10"
                onPress={() => setPasswordVisible((prev) => !prev)}
              >
                {passwordVisible ? (
                  <EyeOff color={errors.password ? "#ef4444" : "#fb923c"} size={20} />
                ) : (
                  <Eye color={errors.password ? "#ef4444" : "#fb923c"} size={20} />
                )}
              </TouchableOpacity>
              <TextInput
                placeholder="Password"
                placeholderTextColor={errors.password ? "#fca5a5" : "#fb923c"}
                value={password}
                onChangeText={handlePasswordChange}
                onBlur={() => handleFieldBlur('password')}
                secureTextEntry={!passwordVisible}
                autoComplete="current-password"
                textContentType="password"
                maxLength={128}
                editable={!isBlocked}
                className={`w-full pl-12 pr-12 py-4 bg-black rounded-xl text-orange-100 text-base border ${getInputBorderColor('password', !!errors.password)}`}
              />
            </View>
            {errors.password && (
              <View className="flex-row items-center mt-1 ml-2">
                <AlertCircle color="#ef4444" size={16} />
                <Text className="text-red-400 text-sm ml-1">{errors.password}</Text>
              </View>
            )}
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading || isBlocked}
            className="w-full rounded-xl items-center active:scale-95 disabled:opacity-60 mt-6"
            style={{
              backgroundColor: isBlocked ? "#6b7280" : "#f97316",
              paddingVertical: 16,
              shadowColor: isBlocked ? "#6b7280" : "#f97316",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            {isLoading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#fff" />
                <Text className="text-white text-base font-semibold ml-2">
                  Signing in...
                </Text>
              </View>
            ) : (
              <Text className="text-white text-base font-semibold">
                {isBlocked ? "Account Locked" : "Sign In"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="items-center">
          <Text className="text-orange-300 text-base mb-4">
            {`Don't`} have an account?{" "}
            <Text
              onPress={() => router.replace("./signup")}
              className="text-orange-500 font-semibold"
            >
              Sign up
            </Text>
          </Text>
          
          {/* Security Tips - only show when not blocked */}
          {!isBlocked && <SecurityTips />}
        </View>
      </View>
    </LinearGradient>
  );
};

export default Login;