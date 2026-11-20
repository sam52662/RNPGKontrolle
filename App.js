import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import KontrolleFormScreen from './src/screens/KontrolleFormScreen';
import KontrolleDetailScreen from './src/screens/KontrolleDetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <NavigationContainer theme={{ colors: { background: 'transparent' } }}>
        <Stack.Navigator
          screenOptions={{ headerShown: false, cardStyle: { backgroundColor: 'transparent' } }}
          initialRouteName="Home"
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="KontrolleForm" component={KontrolleFormScreen} />
          <Stack.Screen name="KontrolleDetail" component={KontrolleDetailScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
