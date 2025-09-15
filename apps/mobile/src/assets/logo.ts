export const NEXA_LOGO_BASE64 =
"iVBORw0KGgoAAAANSUhEUgAAAEEAAABBAQAAAAAqk6mYAAAACXBIWXMAAA7EAAAOxAGVKw4bAAABFklEQVR4nJ2QsQ3CMBRDN8a9jvFQk6lVjQh5nOn8lQpG2qk2xgWm2oXv0xk2ZJ0F3Gqf8M2dM2s7cQb1M9lqCrQjQy3gax0hH3l9Vw2C3u3j9b3jCk0i0VnY0x8a0oS2nq2mGm0G2Kp8HjkXQyQm3wVb6Nwz9gF7qvJYd+GQyWjJmQx6m8JxU2sC3m2Q5c2wqg8G8eXcQmG0j7kX0D7m+zVQYo5w9mQ4W2KJ0a7Qn+YgkC3WgG2gq5SoM1oKfA5yq9wV0J6w3q3a3C0b8kK8H1gO0mHk6zWgU3p9EwZ3o0wAAAAASUVORK5CYII=";
"TS"

# 2) Rewrite Header.tsx WITHOUT backticks
cat > src/components/Header.tsx <<TSX
import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { nexa } from "../theme/nexa";
import { useBreakpoint, rf } from "../utils/responsive";
import { NEXA_LOGO_BASE64 } from "../assets/logo";

export default function Header({ title }: { title: string }){
  const { width } = useBreakpoint();
  return (
    <SafeAreaView style={{ backgroundColor: nexa.colours.bg }}>
      <View style={{ flexDirection:"row", alignItems:"center", paddingHorizontal:16, paddingVertical:12, borderBottomWidth:1, borderColor:"#e5e7eb" }}>
        <Image
          accessibilityLabel="Nexa logo"
          source={{ uri: "data:image/png;base64," + NEXA_LOGO_BASE64 }}
          style={{ width:32, height:32, marginRight:12 }}
        />
        <Text style={{ fontSize: rf(22,width), fontWeight:"800", color: nexa.colours.navy }}>{title}</Text>
      </View>
    </SafeAreaView>
  );
}
TSX

# 3) Start Expo web with a clean cache
pnpm web -- --clear
