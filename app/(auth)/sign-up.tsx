import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { createUser } from "@/lib/appwrite";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";

const SignUp = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = async () => {
    const { name, email, password } = form;
    if (!email || !name || !password)
      return Alert.alert(
        "Error",
        "Please enter valid email address and password"
      );
    // prevent continuing if fields are empty

    setIsSubmitting(true);

    try {
      // TODO: Call Appwrite Sign Up function here
      await createUser({
        email,
        password,
        name,
      });

      Alert.alert("Success", "User Login successfully");
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="gap-10 mt-5 p-5 bg-white">
      <CustomInput
        placeholder="Enter your full name"
        label="Full Name"
        value={form.name}
        onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
      />

      <CustomInput
        placeholder="Enter your email"
        label="Email Address"
        value={form.email}
        onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
        keyboardType="email-address"
      />

      <CustomInput
        placeholder="Enter your password"
        label="Password"
        value={form.password}
        onChangeText={(text) =>
          setForm((prev) => ({ ...prev, password: text }))
        }
        secureTextEntry
      />

      <CustomButton title="Login" isLoading={isSubmitting} onPress={submit} />

      <View className="flex justify-center flex-row mt-5 gap-2">
        <Text className="base-regular text-gray-100">
          Already have an account?
        </Text>
        <Link href="/sign-in" className="base-bold text-primary">
          Login
        </Link>
      </View>
    </View>
  );
};

export default SignUp;
