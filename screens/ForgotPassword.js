import React from 'react';
import {  View, 
    Text, 
    Button, 
    TouchableOpacity, 
    Dimensions,
    TextInput,
    Platform,
    StyleSheet,
    ScrollView,
    StatusBar,
    Picker,
    Alert } from 'react-native';

import * as Animatable from 'react-native-animatable';
import {LinearGradient} from 'expo-linear-gradient';
import { useTheme } from 'react-native-paper';

import Spinner from 'react-native-loading-spinner-overlay';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ForgotPassword = ({navigation}) => {

    const [data, setData] = React.useState({
      email : "",
      valid : true,
      spinner : false
    });

     const { colors } = useTheme();


    const textInputChange = (email) => {
      setData({...data,email});
    }

    const sendRequest = () => {
      setData({...data,spinner : true})
      fetch('http://zetaweb.in/forgotpassword.php?email='+data.email,{
            method: 'POST',
        }).then(response => response.json())
          .then(response => {
              setData({...data,spinner : false})
               if(response.message == "OTP GENERATED") {
                 navigation.navigate('OtpScreen',{email : data.email ,screen : "fp"})
               }
               else{
                 alert(response.message);
               }

           }).
          catch(errorMsg => alert(errorMsg));
    }

    return (
      <View style={styles.container}>
       <Spinner
              visible={data.spinner}
              textContent={'Loading...'}
              textStyle={{color: '#FFF'}}
            />
      <StatusBar backgroundColor='#009387' barStyle="light-content"/>
       <View style={styles.header}>
            <Text style={styles.text_header}>Forgot Password ?</Text>
        </View>
        <Animatable.View 
            animation="fadeInUpBig"
            style={[styles.footer, {
                backgroundColor: colors.background
            }]}
        >
          <Text style={[styles.text_footer, {
              color: colors.text
          }]}>Registered Email</Text>
          <View style={{...styles.action,paddingVertical : 25}}>
              <FontAwesome 
                  name="user-o"
                  color={colors.text}
                  size={20}
              />
              <TextInput 
                  placeholder="Your Email"
                  placeholderTextColor="#666666"
                  style={[styles.textInput, {
                      color: colors.text
                  }]}
                  autoCapitalize="none"
                  onChangeText={(val) => textInputChange(val)}
              />
          </View>
          { data.valid ? null : 
          <Animatable.View animation="fadeInLeft" duration={500}>
          <Text style={styles.errorMsg}>Email is mandatory.</Text>
          </Animatable.View>
          }

          <View style={styles.button}>
              <TouchableOpacity
                  style={styles.signIn}
                  onPress={() => {sendRequest()}}
                  activeOpacity={.7}
              >
              
                 <LinearGradient
                  colors={['#08d4c4', '#01ab9d']}
                  style={styles.signIn}
              >
                  <Text style={[styles.textSign, {
                      color:'#fff'
                  }]}>Reset Password</Text>
              </LinearGradient>
             
              </TouchableOpacity>
          </View>
        </Animatable.View>
      </View>
    );
};

export default ForgotPassword;

const styles = StyleSheet.create({
   container: {
    flex: 1, 
    backgroundColor: '#009387'
  },
  header: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 50
    },
    footer: {
        flex: 3,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 30
    },
    text_header: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 30
    },
    text_footer: {
        color: '#05375a',
        fontSize: 18
    },
    action: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        paddingBottom: 5
    },
    actionError: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#FF0000',
        paddingBottom: 5
    },
    textInput: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 0 : -12,
        paddingLeft: 10,
        color: '#05375a',
    },
    errorMsg: {
        color: '#FF0000',
        fontSize: 14,
    },
    button: {
        alignItems: 'center',
        marginTop: 50
    },
    signIn: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10
    },
    textSign: {
        fontSize: 18,
        fontWeight: 'bold'
    }
});
