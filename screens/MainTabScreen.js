import React from 'react';
import {  Text,TouchableHighlight } from 'react-native';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';

import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeScreen from './HomeScreen';
import NotificationScreen from './NotificationScreen';
import ExploreScreen from './ExploreScreen';
import ProfileScreen from './ProfileScreen';
import EditProfileScreen from './EditProfileScreen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {useTheme, Avatar} from 'react-native-paper';
import {View} from 'react-native-animatable';
import {TouchableOpacity} from 'react-native-gesture-handler';
import ListScreen from './ListScreen';
import CompanyScreen from './CompanyScreen';
import CustomerForm from './CustomerForm';
import InvoiceForm from './InvoiceForm';
import ItemForm from './ItemForm';
import LedgerForm from './LedgerForm';
import InvoiceSettings from './InvoiceNumberSettings';
import OtpScreen from './OtpScreen';
import PurchaseForm from './PurchaseForm';

import PDFScreen from './pdfView';
import SignatureScreen1 from './SignatureScreen';
import {DeviceEventEmitter} from "react-native"

import ExportScreen from './ExportScreen';
import ReportScreen from './ReportScreen';
import ReceiptScreen from './ReceiptScreen';
import BackupScreen from './BackupScreen';

import SearchScreen from './SearchScreen';
import BankForm from './BankForm';

const HomeStack = createStackNavigator();
const ComapanyStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const Tab = createMaterialBottomTabNavigator();

const MainTabScreen = () => (
  <Tab.Navigator initialRouteName="Home" activeColor="#fff" barStyle={{ backgroundColor: '#009387' }}>
    <Tab.Screen
      name="Home"
      component={HomeStackScreen}
      options={{
        tabBarLabel: 'Home',
        tabBarColor: '#009387',
        tabBarIcon: ({color}) => (
          <Icon name="ios-home" color={color} size={26} />
        ),
      }}
    />
    <Tab.Screen 
        name="CompanyScreen"
        component={ComapnyStackScreen}
        options={({route}) => ({
          title: "Company Details",
          headerBackTitleVisible: false,
          tabBarLabel: 'Company',
          tabBarColor: '#009387',
          tabBarIcon: ({color}) => (
            <FontAwesome name="building" color={color} size={26}  />
          ),
        })}
      />
  </Tab.Navigator>
);

export default MainTabScreen;

const HomeStackScreen = ({navigation}) => {
  const {colors} = useTheme();
  
   const validationMessage = (message)=>{
    alert( message.join(", ") + "\n \n" + "Invoice cannot be created as above mentioned information are missing.")
  }
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          shadowColor: colors.background, // iOS
          elevation: 0, // Android
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Financial Khata',
          headerLeft: () => (
            <View style={{marginLeft: 10}}>
              <Icon.Button
                name="ios-menu"
                size={25}
                color={colors.text}
                backgroundColor={colors.background}
                onPress={() => navigation.openDrawer()}
              />
            </View>
          ),
          headerRight: () => (
            <View style={{flexDirection: 'row', marginRight: 10}}>
              <TouchableOpacity
                style={{paddingHorizontal: 10, marginTop: 5}}
                onPress={() => {
                  navigation.navigate('Profile');
                }}>
                <FontAwesome style={{marginTop : 0}}
                    name="user-circle-o"
                    color="#05375a"
                    size={30}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <HomeStack.Screen 
        name="CompanyScreen"
        component={CompanyScreen}
        options={({route}) => ({
          title: route.params.title,
          headerBackTitleVisible: false,
        })}
      />
      
      <HomeStack.Screen 
        name="ListScreen"
        component={ListScreen}
        options={({route}) => ({
          title: route.params.title,
          headerBackTitleVisible: false,
          headerRight: () => (
            <View style={{flexDirection: 'row', marginRight: 10}}
                  >
               <TouchableOpacity  style={{flexDirection: 'row', marginRight: 10}} 
                   onPress={() => {
                    route.params.title == "Customers"? navigation.navigate('CustomerForm', {title: 'Add Customer'})
                    : route.params.title == "Invoices"? (route.params.validation? validationMessage(route.params.messages) : navigation.navigate('InvoiceForm', {title: 'Add Invoice'})) 
                    :  route.params.title == "Items" ? navigation.navigate('ItemForm', {title: 'Add Item'}) 
                    :   route.params.title == "Ledgers" ? navigation.navigate('LedgerForm', {title: 'Add Ledger'})
                    : route.params.title == "Purchases" ? (route.params.validation? validationMessage(route.params.messages) : navigation.navigate('InvoiceForm', {title: 'Add Purchase' , purchase : true}))
                    : route.params.title == "Receipts" ? navigation.navigate('ReceiptScreen', {title: 'Add Receipt'})
                    :  navigation.navigate('InvoiceSettings', {title: 'Add Invoice Setting'})
                  }}>
                <MaterialCommunityIcons
                  name="plus"
                  size={30}
                  color={colors.text}
                  backgroundColor={colors.background}
                  onPress={() => {}}
                />
                <Text style={{fontSize : 20,paddingHorizontal : 5,fontWeight: 'bold'}}>Add</Text>
              </TouchableOpacity>
            </View>
          ),
        })}
      />
      <HomeStack.Screen 
        name="CustomerForm"
        component={CustomerForm}
        options={({route}) => ({
          title: route.params.title,
          headerBackTitleVisible: false,
        })}
      />

      <HomeStack.Screen 
        name="InvoiceForm"
        component={InvoiceForm}
        options={({route}) => ({
          title: route.params.title,
          headerBackTitleVisible: false,
        })}
      />

      <HomeStack.Screen 
        name="PurchaseForm"
        component={PurchaseForm}
        options={({route}) => ({
          title: route.params.title,
          headerBackTitleVisible: false,
        })}
      />

       <HomeStack.Screen 
        name="ItemForm"
        component={ItemForm}
        options={({route}) => ({
          title: route.params.title,
          headerBackTitleVisible: false,
        })}


      />

      <HomeStack.Screen 
        name="LedgerForm"
        component={LedgerForm}
        options={({route}) => ({
          title: route.params.title,
          headerBackTitleVisible: false,
        })}


      />

    <HomeStack.Screen 
        name="BankForm"
        component={BankForm}
        options={({route}) => ({
          title: route.params.title,
          headerBackTitleVisible: false,
        })}
      />


       <HomeStack.Screen 
        name="InvoiceSettings"
        component={InvoiceSettings}
        options={({route}) => ({
          title: route.params.title,
          headerBackTitleVisible: false,
        })}
      />

       <HomeStack.Screen 
        name="ExportScreen"
        component={ExportScreen}
        options={({route}) => ({
          title: "Export Data",
          headerBackTitleVisible: false,
        })}
      />

      <HomeStack.Screen 
        name="ReportScreen"
        component={ReportScreen}
        options={({route}) => ({
          title: "Sales Report",
          headerBackTitleVisible: false,
        })}
      />

      <HomeStack.Screen 
        name="ReceiptScreen"
        component={ReceiptScreen}
        options={({route}) => ({
          title: route.params.title,
          headerBackTitleVisible: false,
        })}
      />
      <HomeStack.Screen 
        name="OtpScreen"
        component={OtpScreen}
        options={({route}) => ({
          title: route.params.title,
          headerBackTitleVisible: false,
        })}
      />

      <HomeStack.Screen 
        name="PdfScreen"
        component={PDFScreen}
        options={({route}) => ({
          title: route.params.title,
          headerBackTitleVisible: false,
          headerRight: () => (
            <View style={{flexDirection: 'row', marginRight: 10}}
                  >
               <TouchableOpacity  style={{flexDirection: 'row', marginRight: 10}} 
                   onPress={() => {DeviceEventEmitter.emit("event.sharePdfEvent", {});}}>
                <MaterialCommunityIcons
                  name="share"
                  size={30}
                  color={colors.text}
                  backgroundColor={colors.background}
                  onPress={() => {}}
                />
                <Text style={{fontSize : 20,paddingHorizontal : 5,fontWeight: 'bold'}}>Share</Text>
              </TouchableOpacity>
            </View>
          ),
        })}
      />

      <HomeStack.Screen 
        name="SignatureScreen"
        component={SignatureScreen1}
        options={({route}) => ({
          title: route.params.title,
          headerBackTitleVisible: false,
        })}
      />

      <HomeStack.Screen 
        name="SearchScreen"
        component={SearchScreen}
         options={({route}) => ({
          title: "Search",
          headerBackTitleVisible: false,
        })}
      />

      <HomeStack.Screen 
        name="BackupScreen"
        component={BackupScreen}
         options={({route}) => ({
          title: route.params.title,
          headerBackTitleVisible: false,
        })}
      />
    </HomeStack.Navigator>
  );
};

const ComapnyStackScreen = ({navigation}) => {
  const {colors} = useTheme();
  return (

  <ComapanyStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: colors.background,
        shadowColor: colors.background, // iOS
        elevation: 0, // Android
      },
      headerTintColor: colors.text,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
    <ComapanyStack.Screen
      name="Company Details"
      component={CompanyScreen}
      options={{
         headerLeft: () => (
            <View style={{marginLeft: 10}}>
              <Icon.Button
                name="ios-menu"
                size={25}
                color={colors.text}
                backgroundColor={colors.background}
                onPress={() => navigation.openDrawer()}
              />
            </View>
          ),
      }}
    />
  </ComapanyStack.Navigator>
)};

const ProfileStackScreen = ({navigation}) => {
  const {colors} = useTheme();

  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          shadowColor: colors.background, // iOS
          elevation: 0, // Android
        },
        headerTintColor: colors.text,
      }}>
      <ProfileStack.Screen
        name="Profile"
        component={EditProfileScreen}
        options={{
          title: '',
          headerLeft: () => (
            <View style={{marginLeft: 10}}>
              <Icon.Button
                name="ios-menu"
                size={25}
                backgroundColor={colors.background}
                color={colors.text}
                onPress={() => navigation.openDrawer()}
              />
            </View>
          ),
          headerRight: () => (
            <View style={{marginRight: 10}}>
              <MaterialCommunityIcons.Button
                name="account-edit"
                size={25}
                backgroundColor={colors.background}
                color={colors.text}
                onPress={() => navigation.navigate('EditProfile')}
              />
            </View>
          ),
        }}
      />
      
    </ProfileStack.Navigator>
  );
};
