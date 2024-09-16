import React from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    TextInput,
    Platform,
    StyleSheet ,
    StatusBar,
    Alert
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {LinearGradient} from 'expo-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import * as GoogleSignIn from 'expo-google-sign-in';

import { useTheme } from 'react-native-paper';

import { AuthContext } from '../components/context';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';

import Users from '../model/users';
import Services from '../model/dataAccess';
import * as Google from 'expo-google-app-auth';
//import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
const isInExpo = Constants.appOwnership === 'expo';

const SignInScreen = ({navigation}) => {

    const [data, setData] = React.useState({
        username: '',
        password: '',
        check_textInputChange: false,
        secureTextEntry: true,
        isValidUser: true,
        isValidPassword: true,
        spinner : false
    });

    const { colors } = useTheme();

    const { signIn,loader,unloader } = React.useContext(AuthContext);

    const textInputChange = (val) => {
        if( val.trim().length >= 4 ) {
            setData({
                ...data,
                username: val,
                check_textInputChange: true,
                isValidUser: true
            });
        } else {
            setData({
                ...data,
                username: val,
                check_textInputChange: false,
                isValidUser: false
            });
        }
    }

    const handlePasswordChange = (val) => {
        setData({
            ...data,
            password: val,
            isValidPassword: true
        });
    }

    const updateSecureTextEntry = () => {
        setData({
            ...data,
            secureTextEntry: !data.secureTextEntry
        });
    }

    const handleValidUser = (val) => {
        if( val.trim().length >= 4 ) {
            setData({
                ...data,
                isValidUser: true
            });
        } else {
            setData({
                ...data,
                isValidUser: false
            });
        }
    }

     const postSigninData = () => {
        const updateRequest = new FormData();
        updateRequest.append('email', data.username);
        updateRequest.append('password', data.password);
        return new Promise(resolve => {
          fetch('http://zetaweb.in/signin.php?email='+data.username+'&&password='+data.password,{
            method: 'POST',
        }).then(response => response.json())
          .then(response => {
               
               resolve(response); 
           }).
          catch(errorMsg => alert(errorMsg));
        })
     }

    const loginHandle = (userName, password) => {

        /*const foundUser = Users.filter( item => {
            return userName == item.username && password == item.password;
        } );*/

        if ( data.username.length == 0 || data.password.length == 0 ) {
            Alert.alert('Wrong Input!', 'Username or password field cannot be empty.', [
                {text: 'Okay'}
            ]);
            return;
        }
        setData({...data,spinner : true})
        postSigninData().then((rdata)=>{
             setData({...data,spinner : false})
            if(rdata.response == "Success"){
                console.log(rdata.user_info[0].NAME);
                const foundUser = [{
                     userToken : rdata.token,
                     userName : rdata.user_info[0].NAME,
                     email : data.username
                }];
                signIn(foundUser);
            }
            else{
                if(rdata.response == "Not Verified"){
                     navigation.navigate('OtpScreen',{email : data.username})
                }
                else{
                    alert(rdata.response);
                }
            }
        });
        
    }


      const signInWithGoogle = async() => {
        let authUser;
        if(isInExpo){
            authUser = await Google.logInAsync({
              androidClientId: `588319098877-fldb1g4id65a8q8pj755h7ij0000tqvf.apps.googleusercontent.com`,
            });
        }
        else{
             authUser = await Google.logInAsync({
              androidClientId: `588319098877-ivr0kg1ufk2dpiqoseqddtifplveu8iv.apps.googleusercontent.com`,
              androidStandaloneAppClientId : `588319098877-ivr0kg1ufk2dpiqoseqddtifplveu8iv.apps.googleusercontent.com`,
              redirectUrl : "com.digitalkhata.digitalkhata:/oauth2redirect/google",
            });
        }

         
         if(authUser.type == "success"){
             AsyncStorage.setItem('googleUserData', JSON.stringify(authUser));
              const foundUser = [{
                 userToken : authUser.accessToken,
                 userName : authUser.user.name,
                 email : authUser.user.email
            }];
           
             fetch('http://zetaweb.in/signinwithgoogle.php?email='+authUser.user.email+'&password='+new Date().getTime()+'&name='+authUser.user.name+'&token='+authUser.accessToken,{
                method: 'POST',
            })
              .then(response => response.json())
              .then(data => {
                   console.log(data);

               }).
              catch(errorMsg => {console.log(errorMsg);});
              signIn(foundUser);
         }
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
            <Text style={styles.text_header}>Welcome!</Text>
        </View>
        <Animatable.View 
            animation="fadeInUpBig"
            style={[styles.footer, {
                backgroundColor: colors.background
            }]}
        >
            <Text style={[styles.text_footer, {
                color: colors.text
            }]}>Email</Text>
            <View style={styles.action}>
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
                    onEndEditing={(e)=>handleValidUser(e.nativeEvent.text)}
                />
                {data.check_textInputChange ? 
                <Animatable.View
                    animation="bounceIn"
                >
                    <Feather 
                        name="check-circle"
                        color="green"
                        size={20}
                    />
                </Animatable.View>
                : null}
            </View>
            { data.isValidUser ? null : 
            <Animatable.View animation="fadeInLeft" duration={500}>
            <Text style={styles.errorMsg}>Username must be 4 characters long.</Text>
            </Animatable.View>
            }
            

            <Text style={[styles.text_footer, {
                color: colors.text,
                marginTop: 35
            }]}>Password</Text>
            <View style={styles.action}>
                <Feather 
                    name="lock"
                    color={colors.text}
                    size={20}
                />
                <TextInput 
                    placeholder="Your Password"
                    placeholderTextColor="#666666"
                    secureTextEntry={data.secureTextEntry ? true : false}
                    style={[styles.textInput, {
                        color: colors.text
                    }]}
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
            { data.isValidPassword ? null : 
            <Animatable.View animation="fadeInLeft" duration={500}>
            <Text style={styles.errorMsg}>Password must be 8 characters long.</Text>
            </Animatable.View>
            }
            

            <TouchableOpacity onPress={() => navigation.navigate('ForgetPasswordScreen')}>
                <Text style={{color: '#009387', marginTop:15}}>Forgot password?</Text>
            </TouchableOpacity>
            <View style={styles.button}>
                <TouchableOpacity
                    style={styles.signIn}
                    onPress={() => {loginHandle( data.username, data.password )}}
                    activeOpacity={.7}
                >
                
                   <LinearGradient
                    colors={['#08d4c4', '#01ab9d']}
                    style={styles.signIn}
                >
                    <Text style={[styles.textSign, {
                        color:'#fff'
                    }]}>Sign In</Text>
                </LinearGradient>
               
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => signInWithGoogle()}
                    style={[styles.signIn, {
                        borderColor: '#009387',
                        borderWidth: 1,
                        marginTop: 15
                    }]}
                >
                    
                    <Text style={[styles.textSign, {
                        color: '#009387'
                    }]}> <FontAwesome 
                        name="google"
                        color="#009387"
                        size={20}
                    />  Sign In With Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.navigate('SignUpScreen')}
                    style={[styles.signIn, {
                        borderColor: '#009387',
                        borderWidth: 1,
                        marginTop: 15
                    }]}
                >
                    <Text style={[styles.textSign, {
                        color: '#009387'
                    }]}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </Animatable.View>
      </View>
    );
};

export default SignInScreen;

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
