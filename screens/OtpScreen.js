import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, View ,TouchableOpacity,Button, StyleSheet} from 'react-native';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 
'react-native-confirmation-code-field';


const CELL_COUNT = 6;
const RESEND_OTP_TIME_LIMIT = 90;

const OtpScreen = ({navigation,route}) => {
    let resendOtpTimerInterval;

    const [resendButtonDisabledTime, setResendButtonDisabledTime] = useState(
        RESEND_OTP_TIME_LIMIT,
    );

    //to start resent otp option
    const startResendOtpTimer = () => {
        if (resendOtpTimerInterval) {
            clearInterval(resendOtpTimerInterval);
        }
        resendOtpTimerInterval = setInterval(() => {
            if (resendButtonDisabledTime <= 0) {
                clearInterval(resendOtpTimerInterval);
            } else {
                setResendButtonDisabledTime(resendButtonDisabledTime - 1);
            }
        }, 1000);
    };

    //on click of resend button
    const onResendOtpButtonPress = () => {
        //clear input field
        setValue('')
        setResendButtonDisabledTime(RESEND_OTP_TIME_LIMIT);
        startResendOtpTimer();

        // resend OTP Api call
        // todo
        console.log('todo: Resend OTP');

        fetch('http://zetaweb.in/forgotpassword.php?email='+route.params.email,{
            method: 'POST',
        }).then(response => response.json())
          .then(response => {
              //setData({...data,spinner : false})
               if(response.message == "OTP GENERATED") {
                 navigation.navigate('OtpScreen',{email : route.params.email ,screen : "fp"})
               }
               else{
                 alert(response.message);
               }

           }).
          catch(errorMsg => alert(errorMsg));
    };

    //declarations for input field
    const [value, setValue] = useState('');
    const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });

    //start timer on screen on launch
    useEffect(() => {
        startResendOtpTimer();
        return () => {
            if (resendOtpTimerInterval) {
                clearInterval(resendOtpTimerInterval);
            }
        };
    }, [resendButtonDisabledTime]);


    const postOtp = () => {
        //console.log('http://zetaweb.in/verify.php?email='+route.params.email+'&&otp='+value);
        return new Promise(resolve => {
          fetch('http://zetaweb.in/verify.php?email='+route.params.email+'&&otp='+value,{
            method: 'POST',
        })
          .then(response => response.json())
          .then(response => {
               console.log(response);
               resolve(response)
           }).
          catch(errorMsg => resolve(errorMsg));
        })
    }

     const sendOTP = () => {
        postOtp().then((response)=>{
          if(response.response == "Verified"){
              if(route.params.screen == "signup") {
                alert("Email Verified!");
                navigation.navigate('SignInScreen'); 
              }
              else {
                alert("Email Verified!");
                navigation.navigate('ChangePasswordScreen',{email : route.params.email}); 
              }
           } 
           else{
              alert("Incorrect OTP!"); 
           }
        })
     }

    return (
        <SafeAreaView style={styles.root}>
            <Text style={styles.title}>Verify the Authorisation Code</Text>
            <Text style={styles.subTitle}>Sent to {route.params.email}</Text>
            <CodeField
                ref={ref}
                {...props}
                value={value}
                onChangeText={setValue}
                cellCount={CELL_COUNT}
                rootStyle={styles.codeFieldRoot}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                renderCell={({ index, symbol, isFocused }) => (
                    <View
                        onLayout={getCellOnLayoutHandler(index)}
                        key={index}
                        style={[styles.cellRoot, isFocused && styles.focusCell]}>
                        <Text style={styles.cellText}>
                            {symbol || (isFocused ? <Cursor /> : null)}
                        </Text>
                    </View>
                )}
            />
            {/* View for resend otp  */}
            {resendButtonDisabledTime > 0 ? (
                <Text style={styles.resendCodeText}>Resend Authorisation Code in {resendButtonDisabledTime} sec</Text>
            ) : (
                    <TouchableOpacity
                        onPress={onResendOtpButtonPress}>
                        <View style={styles.resendCodeContainer}>
                            <Text style={styles.resendCode} > Resend Authorisation Code</Text>
                            <Text style={{ marginTop: 40 }}> in {resendButtonDisabledTime} sec</Text>
                        </View>
                    </TouchableOpacity >
                )
            }
            <View style={styles.button}>
                <Button title="Submit"
                    onPress={() =>
                        sendOTP()
                    } />
            </View>
        </SafeAreaView >
    );
}


export default OtpScreen;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        padding: 20,
        alignContent: 'center',
        justifyContent: 'center'
    },
    title: {
        textAlign: 'left',
        fontSize: 20,
        marginStart: 20,
        fontWeight:'bold'
    },
    subTitle: {
        textAlign: 'left',
        fontSize: 16,
        marginStart: 20,
        marginTop: 10
    },
    codeFieldRoot: {
        marginTop: 40,
        width: '90%',
        marginLeft: 20,
        marginRight: 20,
    },
    cellRoot: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
     },
     cellText: {
        color: '#000',
        fontSize: 28,
        textAlign: 'center',
    },
    focusCell: {
        borderBottomColor: '#007AFF',
        borderBottomWidth: 2,
    },

    button: {
        marginTop: 20
    },
    resendCode: {
        color: "blue",
        marginStart: 20,
        marginTop: 40,
    },
    resendCodeText: {
        marginStart: 20,
        marginTop: 40,
    },
    resendCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    }
})