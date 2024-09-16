import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import SplashScreen from './SplashScreen';
import SignInScreen from './SignInScreen';
import SignUpScreen from './SignUpScreen';
import OtpScreen from './OtpScreen';
import ForgotPassword from './ForgotPassword';
import ChangePassword from './ChangePassword';

const RootStack = createStackNavigator();

const RootStackScreen = ({navigation}) => (
    <RootStack.Navigator headerMode='none'>
        <RootStack.Screen name="SplashScreen" component={SplashScreen}/>
        <RootStack.Screen name="SignInScreen" component={SignInScreen}/>
        <RootStack.Screen name="SignUpScreen" component={SignUpScreen}/>
        <RootStack.Screen name="OtpScreen" component={OtpScreen}/>
        <RootStack.Screen name="ForgetPasswordScreen" component={ForgotPassword}/>
        <RootStack.Screen name="ChangePasswordScreen" component={ChangePassword}/>
    </RootStack.Navigator>
);

export default RootStackScreen;