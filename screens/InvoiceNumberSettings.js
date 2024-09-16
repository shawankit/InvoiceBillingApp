import React, { useEffect } from 'react';
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
    StatusBar,
    Picker,
    SafeAreaView
} from 'react-native';


import * as Animatable from 'react-native-animatable';
import {LinearGradient} from 'expo-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from 'react-native-paper';

import { AuthContext } from '../components/context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Users from '../model/users';
import Services from '../model/dataAccess';

import  MyPicker  from '../components/MyPicker';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';

const InvoiceSettings = ({route,navigation}) => {

    var dateObj_ = new Date();
    
    var initialData = {
        insetId : '',
        invoicePattern : "",
        prefix : "",
        suffix : "",
        startDate :  new Date().getTime(),
        endDate : new Date().getTime() + 365*24*60*60*1000,
        valid : true,
    }

    if(route.params.itemData){
        initialData = {...initialData,...route.params.itemData};
    }

    const [data, setData] = React.useState(initialData);
    const [show, setShow] = React.useState(false);
    const [eshow, seteShow] = React.useState(false);
 
  
    const validate = (val) => {
        return /\d+/g.test(val);
    }

    const textInputChange = (val,name) => {
    	let mergedData = {...data,[name]:val+""}

    	if(name == "invoicePattern"){
    		mergedData.valid = validate(val);
    	}

        setData(mergedData);
    }


    const dateInputChange = (date,name) => {

      if(name == "startDate"){
          setShow(false);
      }
      else{
          seteShow(false);
      }
      if(date){
          setData({...data,[name] : date.getTime()})
      }
    }

    
    useEffect(() => {
       
    },[]);


    const saveHandle = async()=>{
        let stop = false;

        
        if(data.invoicePattern == ""){
        	alert("Please provide Invoice Number");
        	return;
        }

        if(data.startDate == ""){
            alert("Please provide Invoice Number");
            return;
        }
        if(!data.valid){
        	alert("Please provide valid Invoice Number");
            setData({
	        	...data,
	        	valid : false,
	       	});
        }
        else{

            if(data.insetId == ""){
                data.insetId = new Date().getTime();
            }

            const jsonString = await AsyncStorage.getItem('insetlist');

            const obj_ = jsonString ? JSON.parse(jsonString) : {};
            
            obj_[data.insetId] = data;
     
            AsyncStorage.setItem('insetlist', JSON.stringify(obj_));

            navigation.navigate('ListScreen', {title: 'Invoice Settings'}) 
        }

    }

    
    return (
      <View style={styles.container}>

            <ScrollView style={styles.wrapper} showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <Text style={styles.text_header}>Prefix</Text>
                </View>
            	<View style={styles.action}>
                	<TextInput
                        value={data.prefix}  
                        placeholder="Prefix"
                        style={styles.textInput}
                        autoCapitalize="none"
                        onChangeText={(val) => textInputChange(val,"prefix")}
                    />
                 </View>
                    <View style={styles.header}>
                    <Text style={styles.text_header}>Invoice Initial Number</Text>
                </View>
                <View style={styles.action}>
                	<TextInput
                        value={data.invoicePattern}
                        keyboardType="number-pad"  
                        placeholder="Invoice Inital Number"
                        style={styles.textInput}
                        autoCapitalize="none"
                        onChangeText={(val) => textInputChange(val,"invoicePattern")}
                    />
                    { !data.valid ?  
                    <Animatable.View animation="fadeInLeft" duration={500}>
                        <Text style={styles.errorMsg}>Not Valid Number</Text>
                        </Animatable.View> : null
                    }
                 </View>
            
                 <View style={styles.header}>
                    <Text style={styles.text_header}>Suffix</Text>
                </View>
                  <View style={styles.action}>
                	<TextInput
                        value={data.suffix}  
                        placeholder="Suffix"
                        style={styles.textInput}
                        autoCapitalize="none"
                        onChangeText={(val) => textInputChange(val,"suffix")}
                    />
                 </View>
                 <TouchableOpacity onPress={()=>setShow(true)} activeOpacity="0">
                 <View style={styles.header}>
                    <Text style={styles.text_header}>Start Date</Text>
                </View>
                 <View style={styles.action} >
                    <Text  style={[styles.textInput]}>{moment(data.startDate).format("DD/MM/YYYY")}</Text> 
                    {show && (
                        <DateTimePicker
                          testID="dateTimePicker"
                          value={new Date(data.startDate)}
                          mode={"date"}
                          is24Hour={true}
                          display="default"
                          onChange={(event, date) => dateInputChange(date,"startDate")}
                        />
                      )}
                   </View>
                 </TouchableOpacity>
                  <TouchableOpacity onPress={()=>seteShow(true)}  activeOpacity="0">
                  <View style={styles.header}>
                    <Text style={styles.text_header}>End Date</Text>
                </View>
                 <View style={styles.action}   >
                   <Text style={[styles.textInput]}>{moment(data.endDate).format("DD/MM/YYYY")}</Text> 
                    {eshow && (
                        <DateTimePicker
                          testID="dateTimePicker"
                          value={new Date(data.endDate)}
                          mode={"date"}
                          is24Hour={true}
                          display="default"
                          onChange={(event, date) => dateInputChange(date,"endDate")}
                        />
                      )}
                   </View>
                 </TouchableOpacity>
                 

                 <View style={[styles.action,{borderBottomWidth : 0}]}>
                    {
                    	data.invoicePattern != "" ?
                    	<Text>{data.prefix != "" ? data.prefix + " /" : ""} {data.invoicePattern} {data.suffix != "" ? "/ " + data.suffix  : ""} [Invoice No.] </Text>
                    	: null
                    }
                 	
                 </View>
                <View style={styles.button}>
	                <TouchableOpacity
	                    style={styles.signIn}
	                    onPress={() => {saveHandle()}}
                         activeOpacity="0"
	                >
                   	<LinearGradient
                        colors={['#08d4c4', '#01ab9d']}
                        style={styles.signIn}
                    >
                    <Text style={[styles.textSign, {
                        color:'#fff'
                    }]}>Save</Text>
                    </LinearGradient>
           
                </TouchableOpacity>
            </View>
            </ScrollView>

             
      </View>
    );
}

export default InvoiceSettings;

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
        fontSize: 15
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
    },
    errorMsg: {
        color: '#FF0000',
        fontSize: 14,
    },
    button: {
        alignItems: 'center',
        marginTop: 20,
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