import React from 'react';
import {View, Text, Image, StyleSheet,TextInput, TouchableOpacity,PermissionsAndroid,Platform} from 'react-native';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import AsyncStorage from '@react-native-async-storage/async-storage';
import  MyPicker  from '../components/MyPicker';
import * as Animatable from 'react-native-animatable';

const OnItemRateComponent = ({selectedvalue, onValueChange,message}) => {


	const initialData = {
		criticalValue : "1000",
		lessthanRate : "",
		greaterthanRate : "",
		message : message
	}

	const providedValue = JSON.parse(selectedvalue)

	const [data, setData] = React.useState({...initialData,...providedValue});

	const textInputChange = (val,name) => {
        var mergedData = {...data,[name]:val+""};


        setData(mergedData);
        onValueChange(JSON.stringify(mergedData));
    }

    const setSelectedValue = (val,name) => {
        var mergedData = {...data,[name]:val+""};

        setData(mergedData);
        onValueChange(JSON.stringify(mergedData)) 
    }

    const rates = ["3","5","12","18","28"].map((item,index) => {
        return {id : index + 1,name : item + "%",value : item };  
    });

    React.useEffect(() => {
      setData({...initialData,...providedValue});
    },[message]);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
                        <Text style={styles.text_header}>Item Rate Configuration</Text>
            </View>
			 <View style={styles.action}>
			    <FontAwesome5 
                    name="less-than-equal"
                    color="#05375a"
                    size={20}
                />
                <Text style={{marginLeft : 10}}>₹</Text>
			 	<TextInput
	                value={data.criticalValue}
	                style={styles.textInput}
	                autoCapitalize="none"
	                onChangeText={(val) => textInputChange(val,"criticalValue")}
            	/>
            	<MyPicker
                    selectedValue={data.lessthanRate} 
                    items={rates}
                    style={styles.textInput}
                    placeholder="Select Rate"
                    onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue,"lessthanRate")}
                />
			 </View>

			  <View style={styles.action}>
			    <FontAwesome5 
                    name="greater-than"
                    color="#05375a"
                    size={20}
                />
                <Text style={{marginLeft : 10}}>₹</Text>
			 	<TextInput
	                value={data.criticalValue}
	                style={styles.textInput}
	                autoCapitalize="none"
	                onChangeText={(val) => textInputChange(val,"criticalValue")}
            	/>
            	<MyPicker
                    selectedValue={data.greaterthanRate} 
                    items={rates}
                    style={styles.textInput}
                    placeholder="Select Rate"
                    onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue,"greaterthanRate")}
                />
			 </View>
			 <View>
			  { !data.message.validate ? 
			  	<Animatable.View animation="fadeInLeft" duration={500}>
                        <Text style={styles.errorMsg}>{data.message.message}</Text>
                </Animatable.View> : null
               }
			 </View>
		</View>
	);
}

export default OnItemRateComponent;

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    wrapper : {
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    iwrapper : {
      paddingHorizontal: 20,
      paddingVertical: 10
    },
    header: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 10,
        paddingBottom: 10
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
        color: '#05375a',
        fontWeight: 'bold',
        fontSize: 17.5
    },
    text_footer: {
        color: '#05375a',
        fontSize: 18
    },
    action: {
        flexDirection: 'row',
        marginTop: 10,
       
        paddingBottom: 5,
        marginBottom: 25,
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
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        marginHorizontal : 10
    },
    errorMsg: {
        color: '#FF0000',
        fontSize: 14,
    },
    button: {
        alignItems: 'center',
        paddingTop: 10,
        marginBottom : 20
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