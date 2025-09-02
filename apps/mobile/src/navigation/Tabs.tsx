import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import ConnectorsScreen from '../screens/ConnectorsScreen'
import { View, Text } from 'react-native'

function Placeholder({ title }: { title: string }) {
  return <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}><Text>{title}</Text></View>
}

const Tab = createBottomTabNavigator()

export default function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" children={()=><Placeholder title="Home" />} />
      <Tab.Screen name="Modules" component={ConnectorsScreen} />
      <Tab.Screen name="Scan" children={()=><Placeholder title="Scan" />} />
      <Tab.Screen name="Settings" children={()=><Placeholder title="Settings" />} />
    </Tab.Navigator>
  )
}


