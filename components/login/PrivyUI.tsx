import { useLogin } from "@privy-io/expo/ui";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Theme } from "@/constants/Theme";

export default function PrivyUI() {
  const [error, setError] = useState("");

  const { login } = useLogin();
  
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          login({ loginMethods: ["email", "google", "twitter"] })
            .then((session) => {
              console.log("User logged in", session.user);
            })
            .catch((err) => {
              setError(JSON.stringify(err.error) as string);
            });
        }}
        data-testid="privy-login-button"
      >
        <LinearGradient
          colors={Theme.gradients.primary}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>Continue with Email</Text>
        </LinearGradient>
      </TouchableOpacity>
      
      {error && <Text style={styles.errorText}>Error: {error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: Theme.borderRadius.md,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: Theme.colors.error,
    fontSize: 14,
    marginTop: Theme.spacing.sm,
    textAlign: 'center',
  },
});
