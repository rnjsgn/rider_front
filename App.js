import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { Home } from './src/views/Home';
import { OwnerSignUp } from './src/views/OwnerSignUp';
import { RiderSignUp } from './src/views/RiderSignUp';
import { Login } from './src/views/Login';
import { Gps } from './src/views/Gps';
import { Video } from './src/views/Video';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={Home}
          
        />
        <Stack.Screen name="OwnerSignUp" component={OwnerSignUp} />
        <Stack.Screen name="RiderSignUp" component={RiderSignUp} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Gps" component={Gps} />
        <Stack.Screen name="Video" component={Video} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;