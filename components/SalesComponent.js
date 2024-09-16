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
    Picker,Modal
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

const SalesComponent = (props) => {



    if(props.ledgers){
         var initialSale = {
            number : '',
            description : '',
            rate : '',
            desc : '',
            messages : {},
            items : props.itemList,
        }
    }
    else{
       var initialSale = {
            number : '',
            description : '',
            quantity : '',
            rate : '',
            unit : '',
            disc : '',
            messages : {},
            items : props.itemList,
        } 
    }
	

    if(props.itemData){
    	initialSale = {...initialSale,...props.itemData}
    }

    for(let prop in  initialSale){
        if(prop == "messages" || prop == "number" || prop == "items"){
            continue;
        }
        initialSale.messages[prop] = {message : '', valid : true};
    }


    const [sale, setSale] = React.useState(initialSale);

	const validate = (name,val) => {
        let validator;
        switch (name) {
            case "quantity":
                return /\d+/g.test(val);
            case "rate":
                return /\d+/g.test(val);
            case "disc":
                if(val == "") return true;
                return /(^100(\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\.[0-9]{1,2})?$)/g.test(val);
            default:0
                return true; 
        }
        
    }

	const textInputChange = (name,val,placeholder) => {
	    var mergedData = {...sale,[name]:val+""};

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

	    setSale(mergedData);
	}

    const setSelectedValue = (name,val,placeholder) => {
        var mergedData = {...sale,[name]:val+""};
        mergedData.messages[name] = {
            message : "",
            valid : true
        }

        if(name == "description" && !props.ledgers){
            mergedData.unit = itemMap[val].unit.split(" - ")[0];
        }

        setSale(mergedData);
    }

    

    let userToken = null;
    useEffect(() => {
       
    },[]);
   
    const itemMap = {};
    const goodsPicker = Object.values(sale.items).map((item,index) => {
        itemMap[item.itemId] = item;
        return  {id : index + 1,name : item.name,value : item.itemId };  
    });

    const saveHandle = ()=>{
        let stop = false;
        var mergedData = {...sale,...{}};
        for(let prop in  mergedData){
            if(prop == "messages" || prop == "disc" || prop == "number" || prop == "items" || prop == "desc"){
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
            setSale(mergedData);
        }
        else{
            let sendData = {};
            for(let prop in  mergedData){
                if(prop == "messages"){
                    continue;
                }
                sendData[prop] = mergedData[prop];
            }

            props.addSales(sendData,props.index);
        }

    }

    if(props.ledgers){
         var inputProp = [{
            type : "picker",
            icon : "sort-desc",
            textPlaceholder : "Ledger",
            prop : "description",
            iconType : "fa",
            list : goodsPicker,
            addIcon : true,
            addFun : () => props.navigation.navigate("LedgerForm", {title: 'Add Ledger',from:'invoice'}),

        },{
            type : "text",
            icon : "rupee",
            textPlaceholder : "Amount",
            prop : "rate",
            iconType : "fa",
            number : true
        },{
            type : "text",
            icon : "info",
            textPlaceholder : "Description",
            prop : "desc",
            iconType : "fa"
        }];
    }
    else{
         var inputProp = [{
            type : "picker",
            icon : "sort-desc",
            textPlaceholder : "Goods",
            prop : "description",
            iconType : "fa",
            list : goodsPicker,
            addIcon : true,
            addFun : () => props.navigation.navigate("ItemForm", {title: 'Add Item',from:'invoice'}),

        },{
            type : "text",
            icon : "epsilon",
            textPlaceholder : "Quantity",
            prop : "quantity",
            iconType : "mc",
            number :true
        },{
            type : "text",
            icon : "rupee",
            textPlaceholder : "Rate",
            prop : "rate",
            iconType : "fa",
            number :true
        },{
            type : "text",
            icon : "weight",
            textPlaceholder : "Per(unit)",
            prop : "unit",
            iconType : "mc"
        },{
            type : "text",
            icon : "percent",
            textPlaceholder : "Discount",
            prop : "disc",
            iconType : "fe",
            number :true
        }];
    }
   
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
                            value={sale[item.prop]}  
                            placeholder={item.textPlaceholder}
                            style={styles.textInput}
                            keyboardType={item.number ? "number-pad":  "default"}
                            autoCapitalize="none"
                            keyboardType={item.number ? "number-pad":  "default"}
                            onChangeText={(val) => textInputChange(item.prop,val,item.textPlaceholder)}
                        /> : 
                        <MyPicker
                            selectedValue={sale[item.prop]} 
                            style={styles.textInput}
                            items={item.list}
                            placeholder={item.textPlaceholder}
                            addIcon ={item.addIcon}
                            addFun ={item.addFun}
                            onValueChange={(itemValue) => setSelectedValue(item.prop,itemValue,item.textPlaceholder)}
                        />
                    }
                     { !sale.messages[item.prop].validate ?  
                    <Animatable.View animation="fadeInLeft" duration={500}>
                        <Text style={styles.errorMsg}>{sale.messages[item.prop].message}</Text>
                        </Animatable.View> : null
                    }
                </View>
               
            </View>
        );
    });

    
    return (
        <ScrollView  showsVerticalScrollIndicator={false}>

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
	                }]}>Add</Text>
	                </LinearGradient>
	       
	            </TouchableOpacity>
        	</View>
        </ScrollView>
    );
}

export default SalesComponent;

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
