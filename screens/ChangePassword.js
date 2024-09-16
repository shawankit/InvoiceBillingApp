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

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Feather from 'react-native-vector-icons/Feather';
import Spinner from 'react-native-loading-spinner-overlay';

const ChangePassword = ({navigation,route}) => {

    const [data, setData] = React.useState({
      email : "",
      secureTextEntry : true,
      confirm_secureTextEntry : true,
      password: '',
      confirm_password: '',
    });

     const { colors } = useTheme();

     const handlePasswordChange = (val) => {
        setData({
            ...data,
            password: val
        });
    }

    const handleConfirmPasswordChange = (val) => {
        setData({
            ...data,
            confirm_password: val
        });
    }

    const updateSecureTextEntry = () => {
        setData({
            ...data,
            secureTextEntry: !data.secureTextEntry
        });
    }

    const updateConfirmSecureTextEntry = () => {
        setData({
            ...data,
            confirm_secureTextEntry: !data.confirm_secureTextEntry
        });
    }
    const textInputChange = (val) => {
      setData({...data,email});
    }

    const sendRequest = () => {
    	let stop = false;
		if(data.password == ""){
		 alert("Password is required.")
		 stop = true;
		}

		if(data.password != data.confirm_password){
		 alert("Confirm Password does not match.")
		 stop = true;
		}

		if(stop){
		 return;
		}
			setData({...data,spinner : true})
      fetch('http://zetaweb.in/changepassword.php?email='+route.params.email+'&password='+data.password,{
            method: 'POST',
        }).then(response => response.json())
          .then(response => {
          	setData({...data,spinner : false})
          		alert(response.message);
               if(response.message == "Password Changed Successfully") {
                 navigation.navigate('SignInScreen'); 
               }
           }).
          catch(errorMsg => alert(errorMsg));
    }

    return (
      <View style={styles.container}>
       <View style={styles.header}>
            <Text style={styles.text_header}>Change Password</Text>
        </View>
        <Animatable.View 
            animation="fadeInUpBig"
            style={[styles.footer, {
                backgroundColor: colors.background
            }]}
        >
          <Text style={[styles.text_footer, {
              color: colors.text
          }]}>Registered Email - {route.params.email}</Text>
          <View style={{...styles.action,paddingVertical : 25}}>
                <FontAwesome 
                    name="lock"
                    color="#05375a"
                    size={20}
                />
                <TextInput 
                    placeholder="Your Password"
                    secureTextEntry={data.secureTextEntry ? true : false}
                    style={styles.textInput}
                    autoCapitalize="none"
                    onChangeText={(val) => handlePasswordChange(val)}
                />
                <TouchableOpacity
                    onPress={updateSecureTextEntry}
                >
                    {data.secureTextEntry ? 
                    <Feather 
                        name="eye-off"
                        color="grey"
                        size={20}
                    />
                    :
                    <Feather 
                        name="eye"
                        color="grey"
                        size={20}
                    />
                    }
                </TouchableOpacity>

            </View>

           
            <View style={{...styles.action,paddingVertical : 25}}>
                <FontAwesome 
                    name="lock"
                    color="#05375a"
                    size={20}
                />
                <TextInput 
                    placeholder="Confirm Your Password"
                    secureTextEntry={data.confirm_secureTextEntry ? true : false}
                    style={styles.textInput}
                    autoCapitalize="none"
                    onChangeText={(val) => handleConfirmPasswordChange(val)}
                />
                <TouchableOpacity
                    onPress={updateConfirmSecureTextEntry}
                >
                    {data.secureTextEntry ? 
                    <Feather 
                        name="eye-off"
                        color="grey"
                        size={20}
                    />
                    :
                    <Feather 
                        name="eye"
                        color="grey"
                        size={20}
                    />
                    }
                </TouchableOpacity>
            </View>

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

export default ChangePassword;

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
