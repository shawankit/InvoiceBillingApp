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


import AsyncStorage from '@react-native-async-storage/async-storage';


import  MyPicker  from '../components/MyPicker';

const LedgerForm = ({route,navigation}) => {


    var initialData = {
        itemId: '',
        name: '',
        code: '',
        hsn : '',
        head : '',
        description : '',
        rates : "",
        rcm : "",
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
    const [rcmneeded, setRcmneeded] = React.useState(false);
    const [withoutTax, setWithoutTax] = React.useState(false);

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

        setData(mergedData);
    }

    let userToken = null;
    useEffect(() => {
       fetch('http://zetaweb.in/fetchcode.php?codeType=SAC')
        .then(response => response.json())
        .then(data => {
            const list = data.map((item,index) => {
                return {id : index + 1,name : item.SAC ,value :  item.SAC};
            });
            setHsnList(list);
        });

        (async ()=>{
            const cData = await AsyncStorage.getItem("companyData");

            if(cData != null){
                const companyData = JSON.parse(cData);
                if(companyData.nature == "Transporter"){
                    setRcmneeded(true);
                }
                const withoutTax = companyData.registrationType == "Consumer";
                setWithoutTax(withoutTax);
            }
        })();

    },[]);

    const et = ["Exempted","Taxable"].map((item,index) => {
        return {id : index + 1,name : item,value : item };  
    });

    const nill = ["No Tax","NIL"].map((item,index) => {
        return {id : index + 1,name : item,value : item };  
    });

    const rates = (rcmneeded ? (data.rcm == "Yes" ? ["5"] : ["5","12"]) : ["0","1","1.5","3","5","7.5","12","18","28"]).map((item,index) => {
        return {id : index + 1,name : item + "%",value : item };  
    });

    const rcmlist = ["Yes","No"].map((item,index) => {
        return {id : index + 1,name : item,value : item };  
    });


    const saveHandle = async()=>{
        let stop = false;
        var mergedData = {...data,...{}};
        for(let prop in  initialData){
            if(prop == "messages" || prop == "itemId" || prop == "description" || prop == "igst"){
                continue;
            }

            if(!rcmneeded && prop == "rcm"){
                continue;
            }

            if(withoutTax && (prop == "rates")){
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

        
            if(sendData.itemId == ''){
                sendData.itemId = new Date().getTime();
            }

            const itemsString = await AsyncStorage.getItem('ledgers');

            const items = itemsString ? JSON.parse(itemsString) : {};
            
            items[sendData.itemId] = sendData;
            
            AsyncStorage.setItem('ledgers', JSON.stringify(items));
            
             if(route.params.from == "invoice"){
                 navigation.goBack();
            }
            else{
                navigation.navigate('ListScreen', {title: 'Ledgers'})
            }
        }

    }
    let inputProp = [{
        type : "text",
        icon : "list-ul",
        textPlaceholder : "Ledger Name",
        prop : "name",
        iconType : "fa"
    },{
        type : "text",
        icon : "qrcode",
        textPlaceholder : "Ledger Code",
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
        icon : "qrcode",
        textPlaceholder : "SAC Code",
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
        name : "Is Reverse Charge Applicable",
        rcm : true
    }
    ,{
        type : "picker",
        icon : "bullseye",
        textPlaceholder : "Yes/No",
        prop : "rcm",
        iconType : "fa",
        list : rcmlist,
        cType : "Taxable",
        rcm : true
    }
    ,{
        type : "picker",
        icon : "star",
        textPlaceholder : "Rates",
        prop : "rates",
        iconType : "fa",
        list : rates,
        cType : "Taxable",
    }];

    if(withoutTax){
        inputProp =  inputProp.slice(0,7);
    }
    const inputComponents =  inputProp.filter((ele) => (!ele.rcm ? true : rcmneeded)).map((item,index) => {

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

export default LedgerForm;

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
