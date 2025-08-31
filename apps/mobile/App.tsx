import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Text, View, TextInput, Button, Pressable } from 'react-native'
import { useState } from 'react'
import { modules } from './src/registry'

type RootStackParamList = {
  Login: undefined
  ForgotPassword: undefined
  Home: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

function LoginScreen({ navigation }: any) {
  return (
    <View style={{ padding: 16 }}>
      <Text accessibilityRole="header" style={{ fontSize: 20, marginBottom: 12 }}>Sign in</Text>
      <View style={{ gap: 8 }}>
        <Text>Email</Text>
        <TextInput accessibilityLabel="email" placeholder="you@example.com" autoCapitalize="none" />
        <Text>Password</Text>
        <TextInput accessibilityLabel="password" placeholder="********" secureTextEntry />
        <Button title="Continue" onPress={() => navigation.replace('Home')} />
      </View>
      <Pressable onPress={() => navigation.navigate('ForgotPassword')} style={{ marginTop: 12 }}>
        <Text>Forgot password?</Text>
      </Pressable>
    </View>
  )
}

function ForgotPasswordScreen({ navigation }: any) {
  return (
    <View style={{ padding: 16 }}>
      <Text accessibilityRole="header" style={{ fontSize: 20, marginBottom: 12 }}>Reset password</Text>
      <View style={{ gap: 8 }}>
        <Text>Email</Text>
        <TextInput accessibilityLabel="email" placeholder="you@example.com" autoCapitalize="none" />
        <Button title="Send reset link" onPress={() => navigation.goBack()} />
      </View>
    </View>
  )
}

function HomeScreen() {
  return (
    <View style={{ padding: 16 }}>
      <Text accessibilityRole="header" style={{ fontSize: 20, marginBottom: 12 }}>Nexa ERP</Text>
      {modules.map((m) => (
        <View key={m.id} style={{ padding: 8, backgroundColor: '#efefef', borderRadius: 8, marginBottom: 8 }}>
          <Text>{m.title}</Text>
          <Text>Coming soon</Text>
        </View>
      ))}
    </View>
  )
}

export default function App() {
  const [isAuthenticated] = useState(false)
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          <Stack.Screen name="Home" component={HomeScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}



