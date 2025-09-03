import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import ConnectorsScreen from '../screens/ConnectorsScreen'
import EnterpriseScreen from '../screens/EnterpriseScreen'
import MarketplaceScreen from '../screens/MarketplaceScreen'
import NotificationsScreen from '../screens/NotificationsScreen'
import PayrollScreen from '../screens/PayrollScreen'
import WmsScreen from '../screens/WmsScreen'
import MfgScreen from '../screens/MfgScreen'
import CrmScreen from '../screens/CrmScreen'
import { View, Text } from 'react-native'

function Placeholder({ title }: { title: string }) {
  return <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}><Text>{title}</Text></View>
}

const Tab = createBottomTabNavigator()

export default function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" children={()=><Placeholder title="Home" />} />
      <Tab.Screen name="Payroll" component={PayrollScreen} />
      <Tab.Screen name="WMS" component={WmsScreen} />
      <Tab.Screen name="MFG" component={MfgScreen} />
      <Tab.Screen name="CRM" component={CrmScreen} />
      <Tab.Screen name="Modules" component={ConnectorsScreen} />
      <Tab.Screen name="Enterprise" component={EnterpriseScreen} />
      <Tab.Screen name="Marketplace" component={MarketplaceScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Scan" children={()=><Placeholder title="Scan" />} />
      <Tab.Screen name="Settings" children={()=><Placeholder title="Settings" />} />
    </Tab.Navigator>
  )
}


