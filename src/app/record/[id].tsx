import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const RecordsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={styles.container}>
      <Text>{id}</Text>
    </View>
  );
};

export default RecordsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
