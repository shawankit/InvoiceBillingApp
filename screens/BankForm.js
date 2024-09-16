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
import bankNames from '../model/banksName';

import AsyncStorage from '@react-native-async-storage/async-storage';


import  MyPicker  from '../components/MyPicker';

const BankForm = ({route,navigation}) => {


    var initialData = {
        bankId: '',
        bank: '',
        branch: '',
        account : '',
        state : '',
        messages : {},
    }
    var myItem ;
    if(route.params.itemData){
        myItem = route.params.itemData;
        initialData = {...initialData,...route.params.itemData};
    }

    for(let prop in  initialData){
        if(prop == "messages" || prop == "bankId"){
            continue;
        }
        initialData.messages[prop] = {message : '', valid : true};
    }

    const [data, setData] = React.useState(initialData);
    const [banks, setBanks] = React.useState([]);
    const [branches, setBranches] = React.useState([]);

    const getBanks = () => {
        return new Promise(resolve => {
           const list = bankNames.map((item,index) => {
                return {id : index + 1,name : item.bank,value : item.bank};
           });
            resolve(list);
        })
    }


    const getBranch = (b,s) => {
        return new Promise(resolve => {
          fetch('http://zetaweb.in/api.php?bank='+b+'&&state='+s.split(" - ")[0])
          .then(response => response.json())
          .then(data => {
            const list = data.map((item,index) => {
                return {id : index + 1,name : item.branch + " - " + item.ifsc ,value : item.branch + " - " + item.ifsc};
           });
           resolve(list)});
        })
     }

    const textInputChange = (name,val,placeholder) => {
        var mergedData = {...data,[name]:val+""};

         mergedData.messages[name] = {
            message : "",
            valid : true
        }
        if(name == "name"){
            mergedData.head = val;
        }
        setData(mergedData);
    }

    const setSelectedValue = (name,val,placeholder) => {
        var mergedData = {...data,[name]:val+""};
   
        mergedData.messages[name] = {
            message : "",
            valid : true
        }

        if(name == "bank" || name == "state"){
            let b = mergedData.bank;
            let s = mergedData.state;
            if(b != "" && s != ""){
               getBranch(b,s).then((result)=>{
                   setBranches(result);  
               });
            }
        }
        setData(mergedData); 
    }

    let userToken = null;
    useEffect(() => {

        (async ()=>{
            const cData = await AsyncStorage.getItem("companyData");
            const banks = await getBanks();
           
            if(cData != null){
                const companyData = JSON.parse(cData);
            }

            setBanks(banks);
        })();

    },[]);

    const stateCodeMap = {
		"JAMMU AND KASHMIR" :1,
		"HIMACHAL PRADESH" :2,
		"PUNJAB" :3,
		"CHANDIGARH" :4,
		"UTTARAKHAND" :5,
		"HARYANA" :6,
		"DELHI" :7,
		"RAJASTHAN" :8,
		"UTTAR PRADESH" :9,
		"BIHAR" :10,
		"SIKKIM" :11,
		"ARUNACHAL PRADESH" :12,
		"NAGALAND" :13,
		"MANIPUR" :14,
		"MIZORAM" :15,
		"TRIPURA" :16,
		"MEGHALAYA" :17,
		"ASSAM" :18,
		"WEST BENGAL" :19,
		"JHARKHAND" :20,
		"ODISHA" :21,
		"CHHATTISGARH" :22,
		"MADHYA PRADESH" :23,
		"GUJARAT" :24,
		"DAMAN AND DIU" : 26,
		"DADAR AND NAGAR HAVELI" :26,
		"MAHARASHTRA" :27,
		"KARNATAKA" :29,
		"GOA" :30,
		"LAKSHADWEEP" :31,
		"KERALA" :32,
		"TAMIL NADU" :33,
		"PUDUCHERRY" :34,
		"ANDAMAN AND NICOBAR ISLANDS" :35,
		"TELANGANA" :36,
		"ANDHRA PRADESH" :37,
		"LADAKH" :38,
	}

    const statesPicker = Object.keys(stateCodeMap).sort().map((item,index) => {
        return {id : index + 1,name : item + " - " + stateCodeMap[item],value : item + " - " + stateCodeMap[item]};
    });

    const saveHandle = async()=>{
        let stop = false;
        var mergedData = {...data,...{}};
        for(let prop in  initialData){
            if(prop == "messages" || prop == "bankId"){
                continue;
            }

            
            if(mergedData[prop] == ""){
                mergedData.messages[prop] = {message : '*required', valid : false};
                stop = true;    
            }
            else{
                mergedData.messages[prop] = {message : '', valid : true};    
            }
        }

        if(stop){
            alert("Please provide requied fields");
            setData(mergedData);
        }
        else{
            let sendData = {};
            for(let prop in  mergedData){
                if(prop == "messages"){
                    continue;
                }
                sendData[prop] = mergedData[prop];
            }

        
            if(sendData.bankId == ''){
                sendData.bankId = sendData.account;
            }

            const itemsString = await AsyncStorage.getItem('banks');

            const items = itemsString ? JSON.parse(itemsString) : {};
            
            items[sendData.bankId] = sendData;
            
            AsyncStorage.setItem('banks', JSON.stringify(items));
            
            navigation.goBack();
            /*if(route.params.from == "invoice"){
                
            }
            else{
                navigation.navigate('ListScreen', {title: 'Ledgers'})
            }*/
        }

    }
    let inputProp = [{
        type : "picker",
        icon : "bank",
        textPlaceholder : "Select Bank",
        prop : "bank",
        iconType : "mc",
        list : banks,
    },{
        type : "picker",
        icon : "state-machine",
        textPlaceholder : "Select State",
        prop : "state",
        iconType : "mc",
        list : statesPicker,
        api : null
    },{
        type : "picker",
        icon : "source-branch",
        textPlaceholder : "Select Branch",
        prop : "branch",
        iconType : "mc",
        list : branches,
    },{
        type : "text",
        icon : "account-details",
        textPlaceholder : "Account Number",
        prop : "account",
        iconType : "mc"
    }];

   

    const inputComponents =  inputProp.map((item,index) => {

        if(item.type == "header"){
            return (
                <View key={index}>
                    <View style={styles.header}>
                        <Text style={styles.text_header}>{item.name}</Text>
                    </View>
                </View>
            )
        }
        return (
            <View key={index} >
                <View style={styles.action}>
                    { item.iconType == "fa" ?
                         <FontAwesome 
                            name={item.icon}
                            color="#05375a"
                            size={20}
                        /> : item.iconType == "mc" ? 
                         <MaterialCommunityIcons 
                            name={item.icon}
                            color="#05375a"
                            size={20}
                        /> : item.iconType == "fe" ? 
                        <Feather 
                            name={item.icon}
                            color="#05375a"
                            size={20}
                        />  : null
                    }
                    { item.type == "text" ? 
                        <TextInput
                            value={data[item.prop]}  
                            placeholder={item.textPlaceholder}
                            style={styles.textInput}
                            autoCapitalize="none"
                            keyboardType={item.number ? "number-pad":  "default"}
                            onChangeText={(val) => textInputChange(item.prop,val,item.textPlaceholder)}
                        /> : (item.type == "picker" ? 
                        <MyPicker
                            selectedValue={data[item.prop]} 
                            style={styles.textInput}
                            items={item.list}
                            placeholder={item.textPlaceholder}
                            onValueChange={(itemValue) => setSelectedValue(item.prop,itemValue,item.textPlaceholder)}
                        /> : null
                        )
                    }
                    { item.prop != "itemRates" && !data.messages[item.prop].validate ?  
                    <Animatable.View animation="fadeInLeft" duration={500}>
                        <Text style={styles.errorMsg}>{data.messages[item.prop].message}</Text>
                        </Animatable.View> : null
                    }
                </View>
               
            </View>
        );
    });

    
    return (
      <View style={styles.container}>

            <ScrollView style={styles.wrapper} showsVerticalScrollIndicator={false}>

                {inputComponents}
                 
                 <View style={styles.button}>
                <TouchableOpacity
                    style={styles.signIn}
                    onPress={() => {saveHandle()}}
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

export default BankForm;

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
