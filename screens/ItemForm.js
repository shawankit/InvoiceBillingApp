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
import  OnItemRateComponent  from '../components/OnItemRateComponent';

const ItemForm = ({route,navigation}) => {


    var initialData = {
        itemId: '',
        name: '',
        code: '',
        unit: '',
        et : 'Taxable',
        onRate : "On Taxable Rate",
        nil : '',
        hsn : '',
        head : 'Sales',
        description : '',
        rates : "",
        itemRates : JSON.stringify({}),
        messages : {},
    }
    var myItem ;
    if(route.params.itemData){
        myItem = route.params.itemData;
        initialData = {...initialData,...route.params.itemData};
    }

    for(let prop in  initialData){
        if(prop == "messages" || prop == "itemId"){
            continue;
        }
        initialData.messages[prop] = {message : '', valid : true};
    }

    const [data, setData] = React.useState(initialData);
    const [hsnList, setHsnList] = React.useState([]);
    const [withoutTax, setWithoutTax] = React.useState(false);
    
    const ITEM_ID = '6642bb16-0c9a-49ec-966f-8f5e588d008e';


    const textInputChange = (name,val,placeholder) => {
        var mergedData = {...data,[name]:val+""};

         mergedData.messages[name] = {
            message : "",
            valid : true
        }

        setData(mergedData);
    }

    const setSelectedValue = (name,val,placeholder) => {
        var mergedData = {...data,[name]:val+""};
   
        mergedData.messages[name] = {
            message : "",
            valid : true
        }

        if(name == "et" && mergedData.et == "Exempted"){
            mergedData.onRate = "";
        }

        if(name == "et" && mergedData.et == "Taxable" && mergedData.onRate == ""){
            mergedData.onRate = "On Taxable Rate";
        }

        setData(mergedData);
    }

    let userToken = null;
    useEffect(() => {
        fetch('http://zetaweb.in/fetchcode.php?codeType=HSN')
        .then(response => response.json())
        .then(data => {
            const list = data.map((item,index) => {
                return {id : index + 1,name : item.HSN ,value :  item.HSN};
            });
            setHsnList(list);
        });
        (async()=>{
            const cData = await AsyncStorage.getItem("companyData");
            const companyData = cData != null ? JSON.parse(cData) : {};

            const withoutTax = companyData.registrationType == "Consumer";
            setWithoutTax(withoutTax);
        })();
        
    },[]);
 
     const measurements = [
        "BAG - BAGS",
        "BAL - BALE",
        "BDL - BUNDLES",
        "BKL - BUCKLES",
        "BOU - BILLIONS OF UNITS",
        "BOX - BOX",
        "BTL - BOTTLES",
        "BUN - BUNCHES",
        "CAN - CANS",
        "CBM - CUBIC METER",
        "CCM - CUBIC CENTIMETER",
        "CMS - CENTIMETER",
        "CTN - CARTONS",
        "DOZ - DOZEN",
        "DRM - DRUM",
        "GGR - GREAT GROSS",
        "GMS - GRAMS",
        "GRS - GROSS",
        "GYD - GROSS YARDS",
        "KGS - KILOGRAMS",
        "KLR - KILOLITER",
        "KME - KILOMETRE",
        "MLT - MILLILITRE",
        "MTR - METERS",
        "MTS - METRIC TONS",
        "NOS - NUMBERS",
        "PAC - PACKS",
        "PCS - PIECES",
        "PRS - PAIRS",
        "QTL - QUINTAL",
        "ROL - ROLLS",
        "SET - SETS",
        "SQF - SQUARE FEET",
        "SQM - SQUARE METERS",
        "SQY - SQUARE YARDS",
        "TBS - TABLETS",
        "TGM - TEN GROSS",
        "THD - THOUSANDS",
        "TON - TONNES",
        "TUB - TUBES",
        "UGS - US GALLONS",
        "UNT - UNITS",
        "YDS - YARDS",
        "OTH - OTHERS"
    ].map((item,index) => {
        return {id : index + 1,name : item,value : item };  
    });

    const et = ["Exempted","Taxable"].map((item,index) => {
        return {id : index + 1,name : item,value : item };  
    });

    const nill = ["No Tax","NIL"].map((item,index) => {
        return {id : index + 1,name : item,value : item };  
    });

    const rates = ["0","1","1.5","3","5","7.5","12","18","28"].map((item,index) => {
        return {id : index + 1,name : item + "%",value : item };  
    });

    const rateDependent = ["On Taxable Rate","On Item Rate"].map((item,index) => {
        return {id : index + 1,name : item,value : item };  
    });

    const saveHandle = async()=>{
        let stop = false;
        var mergedData = {...data,...{}};
        for(let prop in  mergedData){
            if(prop == "messages" || prop == "itemId" || prop == "description" || prop == "igst"){
                continue;
            }

            if(withoutTax && (prop == "nil" || prop == "rates" || prop == "itemRates" || prop == "onRate")){
                continue;
            }
            if(mergedData.et == "Taxable" && (prop == "nil")){
                continue;
            }

            if(mergedData.et == "Taxable" && mergedData.onRate == "On Taxable Rate" && prop == "itemRates"){
                continue;
            }

            if(mergedData.et == "Taxable" && mergedData.onRate == "On Item Rate" && prop == "rates"){
                continue;
            }

            if(mergedData.et == "Exempted" && ( prop == "rates" || prop == "itemRates" || prop == "onRate")){
                continue;
            }

            if( prop == "itemRates"){
                let ir = JSON.parse(mergedData.itemRates);
                if(ir.criticalValue == "" || ir.lessthanRate == "" || ir.greaterthanRate == ""){
                    mergedData.messages[prop] = {message : '*Please Fill All Fields of Item Rate Configuration', valid : false};
                    stop = true;
                    continue;
                }

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

        
            if(sendData.itemId == ''){
                sendData.itemId = new Date().getTime();
            }

            const itemsString = await AsyncStorage.getItem('items');

            const items = itemsString ? JSON.parse(itemsString) : {};
            
            items[sendData.itemId] = sendData;
            
            AsyncStorage.setItem('items', JSON.stringify(items));
            
             if(route.params.from == "invoice"){
                 navigation.goBack();
            }
            else{
                navigation.navigate('ListScreen', {title: 'Items'})
            }
        }

    }
    let inputProp = [{
        type : "text",
        icon : "list-ul",
        textPlaceholder : "Item Name",
        prop : "name",
        iconType : "fa"
    },{
        type : "text",
        icon : "qrcode",
        textPlaceholder : "Item Code",
        prop : "code",
        iconType : "fa"
    },{
        type : "text",
        icon : "ellipsis-v",
        textPlaceholder : "A/C Head",
        prop : "head",
        iconType : "fa"
    },{
        type : "picker",
        icon : "tape-measure",
        textPlaceholder : "Unit of Measurement",
        prop : "unit",
        iconType : "mc",
        list : measurements
    },{
        type : "picker",
        icon : "qrcode",
        textPlaceholder : "HSN Code",
        prop : "hsn",
        iconType : "fa",
        list : hsnList
    },{
        type : "text",
        icon : "information",
        textPlaceholder : "Description",
        prop : "description",
        iconType : "mc",
    },{
        type : "header",
        name : "Tax Configuration",
    },{
        type : "picker",
        icon : "source-fork",
        textPlaceholder : "Exempted/Taxable",
        prop : "et",
        iconType : "mc",
        list : et
    },{
        type : "picker",
        icon : "bookmark-minus",
        textPlaceholder : "No Tax/NIL",
        prop : "nil",
        iconType : "mc",
        list : nill,
        cType : "Exempted",
    }
    ,{
        type : "picker",
        icon : "information",
        textPlaceholder : "Rate Type",
        prop : "onRate",
        iconType : "mc",
        list : rateDependent,
        cType : "Taxable",
    }
    ,{
        type : "picker",
        icon : "star",
        textPlaceholder : "Rates",
        prop : "rates",
        iconType : "fa",
        list : rates,
        cType : "Taxable",
        dType : "On Taxable Rate"
    },{
        type : "component",
        icon : "star",
        prop : "itemRates",
        iconType : "not",
        cType : "Taxable",
        dType : "On Item Rate"
    }];

    if(withoutTax){
        inputProp =  inputProp.slice(0,6);
    }
   
    const inputComponents =  inputProp.filter((ele) => (!ele.cType ? true : ele.cType == data.et) && !ele.dType ? true : ele.dType == data.onRate).map((item,index) => {

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
                        /> : <OnItemRateComponent 
                                selectedvalue={data[item.prop]}
                                onValueChange={(itemValue) => setSelectedValue(item.prop,itemValue,item.textPlaceholder)}
                                message ={data.messages[item.prop]}
                             />
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

export default ItemForm;

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
