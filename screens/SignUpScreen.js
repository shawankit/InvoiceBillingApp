import React from 'react';
import { 
    View, 
    Text, 
    Button, 
    TouchableOpacity, 
    Dimensions,
    TextInput,
    Platform,
    StyleSheet,
    ScrollView,
    StatusBar
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {LinearGradient} from 'expo-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import Spinner from 'react-native-loading-spinner-overlay';
import { useTheme } from 'react-native-paper';

const SignInScreen = ({navigation}) => {

    const [data, setData] = React.useState({
        username: '',
        email : '',
        password: '',
        confirm_password: '',
        secureTextEntry: true,
        confirm_secureTextEntry: true,
        spinner : false,
        messages : {
            username : {
                message : "",
                valid : false
            },
            email : {
                message : "",
                valid : false
            }
        }
    });

     const { colors } = useTheme();


    const validate = (name,val) => {
        let validator;
        switch (name) {
            case "email" :
                validator = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return validator.test(val);
            case "phone" :
                validator = /^([0|\+[0-9]{1,5})?([7-9][0-9]{9})$/g;
                return validator.test(val);
            /*case "username" :
                validator = /^[a-zA-Z0-9]([._-](?![._-])|[a-zA-Z0-9]){3,18}[a-zA-Z0-9]$/g;
                return validator.test(val);*/
         
            default:0
                return true; 
        }
        
    }

    const textInputChange = (val,name,placeholder) => {
        var mergedData = {...data,[name]:val+""};

        if(!validate(name,val)){
            mergedData.messages[name] = {
                message : "Not valid " + placeholder,
                valid : false
            }
        }
        else{
             mergedData.messages[name] = {
                message : "",
                valid : true
            }
        }

        setData(mergedData);
    }

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

    const sendMail = (info) => {
         console.log('http://zetaweb.in/sendmail.php?email='+info[2]+'&name='+info[3]+'&otp='+info[4]);
         fetch('http://zetaweb.in/sendmail.php?email='+info[2]+'&name='+info[3]+'&otp='+info[4],{
            method: 'POST',
        })
          .then(response => console.log(response.json()))
          .catch(errorMsg => {console.log(errorMsg);});
    }
    const postSignupData = () => {
        return new Promise(resolve => {
          //console.log('http://zetaweb.in/signup.php?email='+data.email+'&&password='+data.password+'&&name='+data.username);
          fetch('http://zetaweb.in/signup.php?email='+data.email+'&password='+data.password+'&name='+data.username,{
            method: 'POST',
        })
          .then(response => response.json())
          .then(data => {
               console.log(data);
               if(data[0] == "New record created successfully"){
                   resolve("Registered Successfully");
               } 
               else{
                  resolve(data[0]); 
               }

           }).
          catch(errorMsg => {console.log(errorMsg);resolve(errorMsg)});
        })
     }

    const signUp = () => {
         let stop = false;
         if(data.username == ""){
             data.messages.username.message = "*required" 
             data.messages.username.valid = false;
             stop = true;
         }

         if(data.email == ""){
             data.messages.email.message = "*required" 
             data.messages.email.valid = false;
             stop = true;
         }

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
         postSignupData().then(msg => {
             alert(msg);
             if(msg == "Registered Successfully"){
                  setData({...data,spinner : false})
                 navigation.navigate('OtpScreen',{email : data.email,screen:"signup"});
             }
         });
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
            <Text style={styles.text_header}>Register Now!</Text>
        </View>
        <Animatable.View 
            animation="fadeInUpBig"
            style={styles.footer}
        >
            <ScrollView>
               <Text style={[styles.text_footer, {
                color: colors.text
            }]}>Name</Text>
            <View style={styles.action}>
                <FontAwesome 
                    name="user"
                    color="#05375a"
                    size={20}
                />
                <TextInput 
                    placeholder="Your Name"
                    style={styles.textInput}
                    autoCapitalize="none"
                    onChangeText={(val) => textInputChange(val,"username","Username")}
                />
                {!data.messages.username.valid ? 
                 <Animatable.View animation="fadeInLeft" duration={500}>
                        <Text style={styles.errorMsg}>{data.messages.username.message}</Text>
                </Animatable.View>
                : null}
            </View>
             <Text style={[styles.text_footer, {
                color: colors.text
            }]}>Email</Text>
             <View style={styles.action}>
                <FontAwesome 
                    name="envelope"
                    color="#05375a"
                    size={20}
                />
                <TextInput 
                    placeholder="Your Email"
                    style={styles.textInput}
                    autoCapitalize="none"
                    onChangeText={(val) => textInputChange(val,"email","Email")}
                />
                {!data.messages.email.valid ? 
                <Animatable.View animation="fadeInLeft" duration={500}>
                        <Text style={styles.errorMsg}>{data.messages.email.message}</Text>
                </Animatable.View>
                : null}
            </View>

            <Text style={[styles.text_footer, {
                color: colors.text
            }]}>Password</Text>
            <View style={styles.action}>
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
 <Text style={[styles.text_footer, {
                color: colors.text
            }]}>Confirm Password</Text>
           
            <View style={styles.action}>
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
            <View style={styles.textPrivate}>
                <Text style={styles.color_textPrivate}>
                    By signing up you agree to our
                </Text>
                <Text style={[styles.color_textPrivate, {fontWeight: 'bold'}]}>{" "}Terms of service</Text>
                <Text style={styles.color_textPrivate}>{" "}and</Text>
                <Text style={[styles.color_textPrivate, {fontWeight: 'bold'}]}>{" "}Privacy policy</Text>
            </View>
            <View style={styles.button}>
                <TouchableOpacity
                    style={styles.signIn}
                    onPress={() => {signUp()}}
                >
                 <LinearGradient
                    colors={['#08d4c4', '#01ab9d']}
                    style={styles.signIn}
                >
                    <Text style={[styles.textSign, {
                        color:'#fff'
                    }]}>Sign Up</Text>
                 </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.signIn, {
                        borderColor: '#009387',
                        borderWidth: 1,
                        marginTop: 15
                    }]}
                >
                    <Text style={[styles.textSign, {
                        color: '#009387'
                    }]}>Sign In</Text>
                </TouchableOpacity>
            </View>
            </ScrollView>
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
    spinnerTextStyle: {
       color: '#FFF'
    },
    header: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 50
    },
    footer: {
        flex: Platform.OS === 'ios' ? 3 : 5,
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
        paddingTop: 10,
        color: '#05375a',
        fontSize: 16
    },
    action: {
        flexDirection: 'row',
        marginVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        paddingBottom: 5
    },
    textInput: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 0 : -12,
        paddingLeft: 10,
        color: '#05375a',
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
    },
    textPrivate: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 20,
        fontSize: 20,
    },
    color_textPrivate: {
        color: 'grey',

    },
     errorMsg: {
        color: '#FF0000',
        fontSize: 12,
    },
  });
