import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AnimeListScreen from '../screens/AnimeListScreen';
import AnimeDetailsScreen from '../screens/AnimeDetailsScreen';

const Stack = createStackNavigator();

const AnimeNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AnimeList"
        component={AnimeListScreen}
        options={{ title: 'Top Anime' }}
      />
      <Stack.Screen
        name="AnimeDetails"
        component={AnimeDetailsScreen}
        options={{ title: 'Anime Details' }}
      />
    </Stack.Navigator>
  );
};

export default AnimeNavigator; 