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
    Alert
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {LinearGradient} from 'expo-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from 'react-native-paper';

import { AuthContext } from '../components/context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import bankNames from '../model/banksName';

import Services from '../model/dataAccess';
import  MyPicker  from '../components/MyPicker';

const CompanyScreen = ({navigation}) => {


    var initialData = {
        companyId: '',
        name: '',
        nature : '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        email: '',
        phone: '',
        pan: '',
        registrationType : '',
        gstin: '',
        bank: '',
        branch: '',
        account: '',
        upi : '',
        messages : {},
        list : {
            banks : [],
            branches : [],
        }
    } 

    for(let prop in  initialData){
        if(prop == "messages" || prop == "companyId" || prop == "list"){
            continue;
        }
        initialData.messages[prop] = {message : '', valid : true};
    }

    const [data, setData] = React.useState(initialData);

    const { getUserToken } = React.useContext(AuthContext);

    const COMPANY_ID = '8fd8ccd9-d005-434b-834e-539daa9f5434';

 
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

    const validate = (name,val) => {
        let validator;
        switch (name) {
            case "pincode":
                return /^[1-9][0-9]{5}/g.test(val);
            case "email" :
                validator = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return validator.test(val);
            case "phone" :
                validator = /^([0|\+[0-9]{1,5})?([1-9][0-9]{9})$/g;
                return validator.test(val);
            case "pan" :
                validator = /^[A-Z]{5}\d{4}[A-Z]$/g;
                return validator.test(val);
            case "gstin" :
                validator = /^([0][1-9]|[1-2][0-9]|[3][0-7])([a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[zZ]{1}[0-9a-zA-Z]{1})+$/g;
                return validator.test(val);
            default:0
                return true; 
        }
        
    }

    let alphaNumberMap,numberAlphaMap;
    (() => {
        var map = {};
        var omap = {};
        for(var i = 0 ; i < 36 ; i++){
            if(i > 9){
                map[String.fromCharCode(65 + (i - 10))] = i;
                omap[i] = String.fromCharCode(65 + (i - 10));
            }
            else {
                map[i] = i;
                omap[i] = i;
            }
        }
        alphaNumberMap = map;
        numberAlphaMap = omap;
    })()

    const getChecksumLetter = (numberString) => {
        var products = [],q = [],r = [],hash = [],m;
        for(var i = 0 ; i < 14 ; i++){
            m = i % 2 == 0 ? 1 : 2;
            products[i] = alphaNumberMap[numberString[i]] * m;
            q[i] = Math.floor(products[i] / 36);
            r[i] = products[i] % 36;
            hash[i] = q[i] + r[i];
        }
        var sum = hash.reduce((acc,cv) => acc + cv);
        var result = sum % 36;
        var checksumLettrr = numberAlphaMap[36 - result];
        return checksumLettrr;
    }

     const populateGSTIN = (mergedData,name) => {
        if((name == "pan" || name == "state" || name == "registrationType") && mergedData.state != "" && mergedData.pan != "" && mergedData.messages["pan"].valid == true && (mergedData.registrationType == "Regular" || mergedData.registrationType == "Composition")){
            let stateCode = mergedData.state.split(" - ")[1];
            if(stateCode.length == 1){
                stateCode = "0"+stateCode;
            }
            mergedData.gstin = stateCode + mergedData.pan + "1Z";
            mergedData.gstin += getChecksumLetter(mergedData.gstin);
            mergedData.messages["gstin"] = {
                message : "",
                valid : true
            }
        }
    }
    const textInputChange = (name,val,placeholder) => {
        var mergedData = {...data,[name]:val+""};

       

        if(name == "gstin" && mergedData.gstin.length >= 14){
            const cs =  getChecksumLetter(mergedData.gstin);
            if( mergedData.gstin.length == 14){
                mergedData.gstin += cs;
            }
            else{
                mergedData.gstin = mergedData.gstin.substr(0,14) + cs;
            }
            val = mergedData.gstin;
        }

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

       
        populateGSTIN(mergedData,name)
        

        setData(mergedData);
    }

    const setSelectedValue = (name,val,placeholder) => {
        var mergedData = {...data,[name]:val+""};
        mergedData.messages[name] = {
            message : "",
            valid : true
        }

        populateGSTIN(mergedData,name);

        if(name == "bank" || name == "state"){
            let b = mergedData.bank;
            let s = mergedData.state;
            if(b != "" && s != ""){
               getBranch(b,s).then((result)=>{
                   mergedData.list.branches = result;
                   setData(mergedData);  
               });
            }
            else{
              setData(mergedData);  
            }
        }
        else{
           setData(mergedData); 
       }
    }

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

    const natureList  =  ["Trading","Service","Manufacturing","Trading and Service","Transporter"].map((item,index) => {
        return {id : index + 1,name : item,value : item};
    });

    const rtList  =  ["Regular","Composition","Consumer"].map((item,index) => {
        return {id : index + 1,name : item,value : item};
    }); 

    
    

    let userToken = null,companyData = null;
    useEffect(() => {
        (async() => {
            
            userToken = await AsyncStorage.getItem('userToken');

           

            const banks = await getBanks();
            data.list.banks = banks;
            const cData = await AsyncStorage.getItem("companyData");


            if(cData != null){
                companyData = JSON.parse(cData);
                setData({...data,...companyData});
                if(companyData.bank != "" && companyData.state != ""){
                   const branches = await getBranch(companyData.bank,companyData.state);
                   data.list.branches = branches;
                   setData({...data,...companyData});
                }
            }
            else{
                setData(data);
            }
            
        })();
          
    },[]);


    const statesPicker = Object.keys(stateCodeMap).sort().map((item,index) => {
        return {id : index + 1,name : item + " - " + stateCodeMap[item],value : item + " - " + stateCodeMap[item]};
    });

    const saveHandle = async()=>{
        let stop = false;
        var mergedData = {...data,...{}};
        for(let prop in  mergedData){
            if(prop == "messages" || prop == "companyId" || prop == "pan" || prop == "gstin" || prop == "bank" || prop == "branch" || prop == "account" || prop == "upi" || prop == "list"){
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

            const saveDataCall = () => {
                let sendData = {};
                for(let prop in  mergedData){
                    if(prop == "messages" || prop == "list"){
                        continue;
                    }
                    sendData[prop] = mergedData[prop];
                }

                AsyncStorage.setItem('companyData', JSON.stringify(sendData));
                setData(mergedData);
                alert("Company Details Saved Successfully");
                navigation.navigate('Home')
            }
            const cData = await AsyncStorage.getItem("companyData");
            if(cData != null){
                const companyData = JSON.parse(cData);
                //&& (companyData.nature == "Service" || mergedData.nature == "Service" || companyData.nature == "Trading and Service" || mergedData.nature == "Trading and Service")
                if(companyData && companyData.nature != mergedData.nature){
                    let inString = await AsyncStorage.getItem("invoices");
                    const invoices = inString ? Object.values(JSON.parse(inString)) : [];
                    if(invoices.length > 0){
                         Alert.alert(
                          `Nature of Business Changed To  ${mergedData.nature}`,
                          `All Existing Invoices  are of ${companyData.nature} Nature.\n \n If you click OK all invoices would be deleted. \n \n Do you want to proceed ?`,
                          [
                            {
                              text: "Cancel",
                              onPress: () => {},
                              style: "cancel"
                            },
                            { text: "OK", onPress: () => {
                                AsyncStorage.setItem("invoices",JSON.stringify({}));
                                saveDataCall();
                            } }
                          ]
                        );
                        return;
                    }
                }
            }
            saveDataCall();
        }

    }
    const inputProp = [{
        type : "text",
        icon : "building",
        textPlaceholder : "Company Name",
        prop : "name",
        iconType : "fa"
    },{
        type : "picker",
        icon : "google-my-business",
        textPlaceholder : "Nature of Business",
        prop : "nature",
        iconType : "mc",
        list : natureList,
    },{
        type : "text",
        icon : "address-book-o",
        textPlaceholder : "Address",
        prop : "address",
        iconType : "fa"
    },{
        type : "text",
        icon : "city",
        textPlaceholder : "City",
        prop : "city",
        iconType : "mc"
    },{
        type : "picker",
        icon : "state-machine",
        textPlaceholder : "Select State",
        prop : "state",
        iconType : "mc",
        list : statesPicker,
        api : null
    },{
        type : "text",
        icon : "map-pin",
        textPlaceholder : "Pincode",
        prop : "pincode",
        iconType : "fe",
        number : true,
    },{
        type : "text",
        icon : "email",
        textPlaceholder : "Email",
        prop : "email",
        iconType : "mc"
    },{
        type : "text",
        icon : "phone",
        textPlaceholder : "Mobile Number",
        prop : "phone",
        iconType : "fe",
        number : true,
    },{
        type : "text",
        icon : "pan",
        textPlaceholder : "PAN",
        prop : "pan",
        iconType : "mc"
    },{
        type : "header",
        name : "GST Details",
    }
    ,{
        type : "picker",
        icon : "google-my-business",
        textPlaceholder : "Registration Type",
        prop : "registrationType",
        iconType : "mc",
        list : rtList,
    },{
        type : "text",
        icon : "file-document",
        textPlaceholder : "GSTIN",
        prop : "gstin",
        iconType : "mc",
    },{
        type : "header",
        name : "Bank Details",
    },{
        type : "picker",
        icon : "bank",
        textPlaceholder : "Select Bank",
        prop : "bank",
        iconType : "mc",
        list : data.list.banks,
    },{
        type : "picker",
        icon : "source-branch",
        textPlaceholder : "Select Branch",
        prop : "branch",
        iconType : "mc",
        list : data.list.branches,
    },{
        type : "text",
        icon : "account-details",
        textPlaceholder : "Account Number",
        prop : "account",
        iconType : "mc"
    },{
        type : "text",
        icon : "approximately-equal-box",
        textPlaceholder : "UPI ID",
        prop : "upi",
        iconType : "mc"
    }];

    data.registrationType == "Consumer" ? inputProp.splice(11,1) : null;

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
                        /> : 
                        <Feather 
                            name={item.icon}
                            color="#05375a"
                            size={20}
                        /> 
                    }
                    { item.type == "text" ? 
                        <TextInput
                            value={data[item.prop]}  
                            placeholder={item.textPlaceholder}
                            style={styles.textInput}
                            autoCapitalize="none"
                            keyboardType={item.number ? "number-pad":  "default"}
                            onChangeText={(val) => textInputChange(item.prop,val,item.textPlaceholder)}
                        /> : 
                        <MyPicker
                            selectedValue={data[item.prop]} 
                            items={item.list}
                            style={styles.textInput}
                            placeholder={item.textPlaceholder}
                            api={item.api}
                            onValueChange={(itemValue, itemIndex) => setSelectedValue(item.prop,itemValue,item.textPlaceholder)}
                        />
                    }
                    { !data.messages[item.prop].validate ?  
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

export default CompanyScreen;

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
