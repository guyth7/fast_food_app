import { Slot } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const _layout = () => {
  return (
    <View>
      <Text>layout auth</Text>
      <Slot />
    </View>
  );
};

export default _layout;
