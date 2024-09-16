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
    Picker,Modal,Alert
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
import SalesComponent from '../components/SalesComponent';
import  MyPicker  from '../components/MyPicker';
import  SalesCard  from '../components/SalesCard';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';

const {height} = Dimensions.get("screen");
const screenHeight = height - 555;


const InvoiceForm = ({route,navigation}) => {


    var dateObj_ = new Date();

    var initialData = {
        invoiceId: '',
        number : "",
        invoicenumber : {},
        date: new Date().getTime(),
        buyer : '',
        sales: [],
        buyerValidate : true,
        salesModalVisible : false,
        optionBothModalVisible : false,
        selectedSale : null,
        saleIndex : null,
        customers : [],
        items : [],
        ledgerList : [],
        companyData : {},
        customerMap : {},
        sameState : false,
        ledgers : false,
        both : false,
        ledgersOnBoth : false,
        invoiceSettings : {},
        inSize : 0,
        ewaybillNo : '',
        vehicleno : '',
        ewaybilldate : '',
        transporter : false,
        rcm : 'No',
        withoutTax : true,
        serviceNature : false
    }
    var myInvoice ;
    let purchase = route.params.purchase == true;
    if(route.params.itemData){
        myInvoice = route.params.itemData;
        initialData = {...initialData,...route.params.itemData};
    }

    const [data, setData] = React.useState(initialData);
    
    const [show, setShow] = React.useState(false);

    const [eshow, seteShow] = React.useState(false);

    const setSelectedValue = (name,val,placeholder) => {
        var mergedData = {...data,[name]:val+""};

        mergedData.sameState = isSameState(mergedData);
        setData(mergedData);
    }

    const getDate = (date) => {
        var dl = new Date(date);
        dl.setHours(0,0,0,0);
        return new Date(date);
    }

    const getTheActualNumber = (invoiceSetting,inSize,settingsMap) => {
        let number,n,selector,prevNumber;

        if(Object.keys(settingsMap).length > 0){

            const initialNumber = invoiceSetting.invoicePattern != "" ? parseInt(invoiceSetting.invoicePattern) - 1  : 0;
            if(invoiceSetting.prefix != "" && invoiceSetting.suffix != ""){
                n = settingsMap[invoiceSetting.prefix+"-"+invoiceSetting.suffix] ? settingsMap[invoiceSetting.prefix+"-"+invoiceSetting.suffix]  : initialNumber;
                number = invoiceSetting.prefix + "/" + ( n + 1) + "/" + invoiceSetting.suffix; 
                selector = invoiceSetting.prefix+"-"+invoiceSetting.suffix;
                prevNumber = invoiceSetting.prefix + "/" + ( n ) + "/" + invoiceSetting.suffix
            }
            else if(invoiceSetting.prefix != ""){
                n = settingsMap[invoiceSetting.prefix] ? settingsMap[invoiceSetting.prefix] : initialNumber;
                number = invoiceSetting.prefix + "/" + (n + 1);
                selector = invoiceSetting.prefix;
                 prevNumber = invoiceSetting.prefix + "/" + (n);
            }
            else if(invoiceSetting.suffix != ""){
                n = settingsMap[invoiceSetting.suffix] ? settingsMap[invoiceSetting.suffix] : initialNumber;
                number = (n + 1) + "/" + invoiceSetting.suffix;
                selector = invoiceSetting.suffix;
                prevNumber = (n) + "/" + invoiceSetting.suffix;
            }
            else{
                n = settingsMap[""] ? settingsMap[""] : initialNumber;
                number =(settingsMap[""] + 1);
                selector = "";
                prevNumber = settingsMap[""]; 
            } 
        }
        else{
            const initialNumber = invoiceSetting.invoicePattern != "" ? parseInt(invoiceSetting.invoicePattern) - 1 + inSize  : inSize;
            n = initialNumber;
            number =  ((invoiceSetting.prefix != "" ? invoiceSetting.prefix + "/" : "") + (initialNumber + 1) + (invoiceSetting.suffix != "" ? "/" + invoiceSetting.suffix : ''));
        }

        const {prefix,suffix} =  invoiceSetting;

        return {number,selector,prevNumber,invoicenumber : {prefix,suffix,n : n + 1}}
    }


    const getInvoicenumber = (invoiceSettings,date,inSize,settingsMap) => {
        let invoiceSetting,selectedDateInvoiceSettings = [];
        for(const [key, value] of Object.entries(invoiceSettings)){ 
            if(getDate(value.startDate) <= getDate(date) && getDate(value.endDate) > getDate(date)){
                if(selectedDateInvoiceSettings.length == 0){
                    invoiceSetting = value;
                }
                selectedDateInvoiceSettings.push(value);
            }
        }
       
        if(!invoiceSetting){
            alert("No Invoice Number Setting exist for current date selected.Please add it to Invoice Settings.")
            return;
        }
        
      
        const {number,selector,prevNumber,invoicenumber} = getTheActualNumber(invoiceSetting,inSize,settingsMap);
        return {number,invoicenumber,selector,prevNumber,selectedDateInvoiceSettings};
    }

    const getSettingsMap = (invoices) => {
        const settingMap = {};
        const settingsLastDate = {};
        for (var i = 0; i < invoices.length; i++) {
            const invoicenumber = invoices[i].invoicenumber;
            const nextnumber =  parseFloat(invoicenumber.n) ;
            //console.log(invoicenumber); 
            let selector = "";
            if(invoicenumber.prefix == "" && invoicenumber.suffix == ""){
               selector = "";
            }
            else if(invoicenumber.prefix != "" && invoicenumber.suffix != ""){
                selector = invoicenumber.prefix+"-"+invoicenumber.suffix;
            }
            else if(invoicenumber.prefix != "" || invoicenumber.suffix != ""){

                let txt = invoicenumber.prefix != "" ?   invoicenumber.prefix  : invoicenumber.suffix;
                selector = txt;
            }

            if(!settingMap[selector]){
                settingMap[selector] = nextnumber;
                settingsLastDate[selector] = invoices[i].date;
            }
            else{
                if( settingMap[selector] <= nextnumber){
                   settingMap[selector] = nextnumber;
                }

                if(settingsLastDate[selector] <  invoices[i].date){
                    settingsLastDate[selector] = invoices[i].date;
                }
           }

        }
        return {settingMap,settingsLastDate}
    }

    let userToken = null;
    useEffect(() => {
      const dataFromStorage = async() => {
            userToken = await AsyncStorage.getItem('userToken');

            const invoiceSettings = JSON.parse(await AsyncStorage.getItem('insetlist'));

            let inString = await AsyncStorage.getItem(purchase ? 'purchases' : "invoices");
            const invoices = inString ? Object.values(JSON.parse(inString)) : [];

            const {settingMap,settingsLastDate} = getSettingsMap(invoices);

            var selectedDateInvoiceSettings;
             if(route.params.itemData){
                var number = route.params.itemData.number;
                 var invoicenumber = route.params.itemData.invoicenumber;
             }
             else{
                 var {number,invoicenumber,selectedDateInvoiceSettings} = getInvoicenumber(invoiceSettings,data.date,invoices.length,settingMap);
             }
            

            let cString = await AsyncStorage.getItem("customers");
            const customers = cString ? Object.values(JSON.parse(cString)) : [];
            const customerMap =  cString ? JSON.parse(cString) : {};

            const cData = await AsyncStorage.getItem("companyData");
            const companyData = cData != null ? JSON.parse(cData) : {};
            
            const ledgers = companyData.nature == "Service" || companyData.nature == "Transporter";
            const both = companyData.nature == "Trading and Service";
            const transporter = companyData.nature == "Transporter";
            const serviceNature = companyData.nature == "Service";

            let iString = await AsyncStorage.getItem(ledgers ? "ledgers" : "items");
            const itemList = iString ? Object.values(JSON.parse(iString)) : [];

            var ledgerList = [],ledgerList = {};
            if(both){
                let leString = await AsyncStorage.getItem("ledgers");
                ledgerList = leString ? Object.values(JSON.parse(leString)) : [];
                ledgerList = ledgerList.reduce((acc,cur)=>{ acc[cur.itemId] = cur; return acc;},{});
            }

            const withoutTax = companyData.registrationType == "Composition" || companyData.registrationType == "Consumer";

            const items = itemList.reduce((acc,cur)=>{ acc[cur.itemId] = cur; return acc;},{});

            let sameState = false;
            if(data.buyer != ""){
                sameState = customerMap[data.buyer].state == companyData.state;
            }

            setData({...data,number,customers,items,customerMap,companyData,sameState,ledgers,invoiceSettings,inSize : invoices.length,settingMap,invoicenumber,settingsLastDate,both,ledgerList,transporter,withoutTax,selectedDateInvoiceSettings,serviceNature});
        };

        dataFromStorage();

        navigation.addListener('focus', async() => {
            dataFromStorage();
        });
    },[]);

    const dateInputChange = (event,date) => {
      setShow(false);
      if(date){
          date = date.getTime();
           const obj  = getInvoicenumber(data.invoiceSettings,date,data.inSize,data.settingMap);
           if(obj && obj.selector && data.settingsLastDate[obj.selector] > date){
               alert("Invoice exist with date " + moment(data.settingsLastDate[obj.selector]).format("DD/MM/YYYY") + " with invoice number " + obj.prevNumber +". " + moment(date).format("DD/MM/YYYY") + " is not valid date.")
           }
           else{ 
               if(obj && obj.number){
                  var {number,invoicenumber,selectedDateInvoiceSettings} = obj;
                  setData({...data,date,number,invoicenumber,selectedDateInvoiceSettings});
               }   
           }
      }
    }


    const buyerPicker = data.customers.map((item,index) => {
        return  {id : index + 1,name : item.name,value : item.customerId };  
    });

     const getRate = (itemDetails,rate) =>{
       if(itemDetails.onRate == "On Item Rate"){
          const itemRateObj = JSON.parse(itemDetails.itemRates);
          const rates = parseFloat(rate) <= parseFloat(itemRateObj.criticalValue) ? parseFloat(itemRateObj.lessthanRate): parseFloat(itemRateObj.greaterthanRate);
          const ar = !data.sameState ? rates : rates / 2;
          return ar;
        }
        else{
          const rates = parseFloat(itemDetails.rates);
          const ar = !data.sameState ? rates : rates / 2;
          return ar;
        }
     }

    const saveHandle = async()=>{
        let stop = false,fullMsg = "Please ";
        var mergedData = {...data,...{}};
            

        if(mergedData.buyer == ""){
            mergedData.buyerValidate = false;
            stop = true;
            fullMsg += "Select Buyer "
        }

        if(mergedData.sales.length == 0){
             fullMsg += (stop ? "and " : "") + "add atleast one sale"
             stop = true;
        }

        if(stop){
            alert(fullMsg);
            setData(mergedData);
        }
        else{
            let {invoiceId,number,sales,buyer,date,sameState,ledgers,invoicenumber,ewaybillNo,vehicleno,ewaybilldate,both,rcm,transporter,withoutTax} = mergedData;

            let {total,igst} = sales.reduce((totalObj,obj_) => {
                let ledgers = data.both ? obj_.unit == undefined : data.ledgers;
                let items = data.both ? (obj_.unit == undefined ? data.ledgerList : data.items) : data.items;

                if(ledgers){
                    let gst = 0;
                    let transporterCheck = (!transporter || (transporter && data.rcm == 'No'));
                    let taxCalcCheck = items[obj_.description] && transporterCheck && (transporter ? (!items[obj_.description].rcm || items[obj_.description].rcm == "No") : true);
                    if(!withoutTax && taxCalcCheck){
                        const rates = getRate(items[obj_.description],obj_.rate);
                        gst = Math.round(rates *  parseFloat(obj_.rate) / 100);
                    }

                    totalObj.igst += gst;
                    totalObj.total += (parseFloat(obj_.rate) + gst * (!sameState ? 1 : 2));
                    return totalObj;
                }
                else{
                    const disc = isNaN(parseFloat(obj_.disc)) ? 0 : parseFloat(obj_.disc);
                    const amount = parseFloat(obj_.quantity) * parseFloat(obj_.rate);
                    const discAmount = amount - disc / 100 * amount;

                    let gst = 0;
                    if(!withoutTax && items[obj_.description] && items[obj_.description].et == "Taxable"){
                        const rates = getRate(items[obj_.description],obj_.rate);
                        gst = Math.round(rates * discAmount / 100);
                    }

                    totalObj.igst += gst;
                    totalObj.total += (discAmount + gst * (!sameState ? 1 : 2));
                    return totalObj;
                }
                
             },{total : 0,igst : 0});


            let sendData = {invoiceId,number,sales,buyer,date,total,igst,sameState,ledgers,invoicenumber,ewaybillNo,vehicleno,ewaybilldate,both,rcm,transporter,withoutTax};


            if(sendData.invoiceId == ''){
                sendData.invoiceId = new Date().getTime();
            }

            const process = purchase ? 'purchases' : 'invoices';

            const jsonString = await AsyncStorage.getItem(process);

            const obj_ = jsonString ? JSON.parse(jsonString) : {};
            
            obj_[sendData.invoiceId] = sendData;
            
            AsyncStorage.setItem(process, JSON.stringify(obj_));

            
            navigation.navigate('ListScreen', {title:  purchase ? "Purchases" : 'Invoices'});
        }

    }

     const openSalesModal = ()=>{
         if(data.both){
              setData({...data,
                 saleIndex : null,
                 selectedSale : null,
                 optionBothModalVisible : true
             })
         }
         else{
             setData({...data,
                 saleIndex : null,
                 selectedSale : null,
                 salesModalVisible : true
             }) 
         }
     }

     const editSalesModal = (item,index)=>{

          if(data.both){
              setData({...data,
                 saleIndex : index,
                 selectedSale : item,
                 salesModalVisible : true,
                 ledgersOnBoth : item.unit == undefined ? true : false
             })
         }
         else{
             setData({...data,
                 saleIndex : index,
                 selectedSale : item,
                 salesModalVisible : true
             }) 
         }
     }

     const closeSalesModal = ()=>{
          setData({...data,salesModalVisible : false})
     }
     

    const addSales = (sales,index)=>{
        var mergedData = {...data,salesModalVisible : false};

        if(index == null || index == undefined){
            sales.number = mergedData.sales.length + 1; 
        
            mergedData.sales.push(sales);
        }
        else{
             mergedData.sales[index]= sales;
        }
        

        setData(mergedData);
    }

    const deleteItem = (index) => {
        Alert.alert(
          "Permanent Delete Alert",
          "Are you sure you want to delete?",
          [
            {
              text: "Cancel",
              onPress: () => {},
              style: "cancel"
            },
            { text: "OK", onPress: async() => {

                var mergedData = {...data,salesModalVisible : false};

                mergedData.sales.splice(index, 1);

                setData(mergedData);
             }}
          ]
        );
    }

    const isSameState = (mData) => {
        if(mData.buyer != ""){
            return data.customerMap[mData.buyer].state == data.companyData.state ? true : false;
        }
        else{
            return false;
        }
    }

    const onSelectType = (type) => {
        setData({...data,
            saleIndex : null,
            selectedSale : null,
            optionBothModalVisible : false,
            salesModalVisible : true,
            ledgersOnBoth : type == "Ledgers" ? true : false
         })
    }

    const numberObjMap = {};
    const dropdwonForInvoiceNumber = data.selectedDateInvoiceSettings ? data.selectedDateInvoiceSettings.map((val,index) => {
        const {number,invoicenumber} = getTheActualNumber(val,data.inSize,data.settingMap);
        numberObjMap[number] = invoicenumber;
        return {id : index , name : number , value : number}
    }) : [{id : 0 , name : data.number , value : data.number}] 

    var salesList;
    if(data.sales.length == 0){
        salesList = (
            <View style={styles.container1}>
                <Text>No {data.ledgers ? "ledgers" : "items"} available</Text>
                <Button
                  title={"Add " + (data.ledgers ? "Ledgers" : "Items")}
                  onPress={() => {openSalesModal()}}
                />
              </View>
        );
    }
    else{
        salesList = data.sales.map((item,index) => {
            let ledgers = false;
            if(data.both && item.unit == undefined){
                item.itemInfo = data.ledgerList[item.description] ? data.ledgerList[item.description] : null;
                ledgers = true;
            }
            else{
                ledgers = data.ledgers;
                item.itemInfo = data.items[item.description] ? data.items[item.description] : null;
            }
            
            item.sameState = data.sameState;
            return (
                  <SalesCard 
                     key={index+1}
                     itemData={item}
                     ledgers={ledgers}
                     onPress={() => {editSalesModal(item,index)}}
                     deleteItem={()=>deleteItem(index)}
                     transporter={data.transporter}
                     rcm={data.rcm}
                     withoutTax={data.withoutTax}
                  />
            );
        });
          
    }


    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

            <View style={styles.wrapper} >
                <View style={styles.iwrapper}>
                    <View style={styles.static_action}>
                        <Text>Invoice No.</Text>
                        <Text style={[{marginLeft: 'auto'}]}>Dated</Text>
                    </View>
                    <View style={styles.static_action}>
                        {route.params.itemData ? <Text style={[styles.textSign]}>{data.number}</Text> : 
                            <>
                                <MyPicker
                                    selectedValue={data.number} 
                                    items={dropdwonForInvoiceNumber}
                                    style={styles.textInput}
                                    placeholder={"Select Invoice Number"}
                                    onValueChange={(number, itemIndex) => setData({...data,number,invoicenumber : numberObjMap[number]})}
                                />
                                <Text style={[styles.textSign]}>                                   </Text>
                            </>
                        }
                        
                        <Text onPress={()=>route.params.itemData ? alert("You can update date in Edit State. Create New One.") : setShow(true)} style={[styles.textSign,{marginLeft: 'auto'}]}>{moment(data.date).format("DD/MM/YYYY")}</Text> 
                        {show && (
                            <DateTimePicker
                              testID="dateTimePicker"
                              value={new Date(data.date)}
                              mode={"date"}
                              is24Hour={true}
                              display="default"
                              onChange={(event, date) => dateInputChange(event,date)}
                            />
                          )}
                    </View>
                </View>
                
                <View style={styles.action}>
                     <FontAwesome 
                            name="user"
                            color="#05375a"
                            size={20}
                        />
                        <MyPicker
                            selectedValue={data.buyer} 
                            style={styles.textInput}
                            items={buyerPicker}
                            placeholder="Select Buyer"
                            addIcon={true}
                            addFun={()=>navigation.navigate("CustomerForm", {title: 'Add Customer',from:'invoice'})}
                            onValueChange={(itemValue, itemIndex) => setSelectedValue("buyer",itemValue)}
                        />
                         
                        { !data.buyerValidate ?  
                            <Animatable.View animation="fadeInLeft" duration={500}>
                                <Text style={styles.errorMsg}>*required</Text>
                            </Animatable.View> : null
                        }
                </View>
                 
                {!data.transporter ? data.serviceNature ? null : <View>
                    <View style={styles.action}>
                        <FontAwesome 
                                name="bolt"
                                color="#05375a"
                                size={20}
                            />
                        <TextInput
                            value={data.ewaybillNo}  
                            placeholder={"EWAY BILL NO"}
                            style={styles.textInput}
                            autoCapitalize="none"
                            keyboardType={"default"}
                            onChangeText={(val) => setData({...data,ewaybillNo:val})}
                        />
                    </View>
                    <View style={styles.action}>
                        <FontAwesome 
                                name="truck"
                                color="#05375a"
                                size={20}
                            />
                        <TextInput
                            value={data.vehicleno}  
                            placeholder={"VEHICLE NO"}
                            style={styles.textInput}
                            autoCapitalize="none"
                            keyboardType={"default"}
                            onChangeText={(val) => setData({...data,vehicleno:val})}
                        />
                    </View> 
                 </View> : <View> 
                 <View style={[styles.action,{borderBottomWidth : 0}]}>
                        <Text style={{fontSize : 15,fontWeight : 'bold'}}> Is Reverse Charge Applicable ?</Text>
                    </View>
                    <View style={[styles.action,{marginTop : 0}]}>
                        <FontAwesome 
                                name="bolt"
                                color="#05375a"
                                size={20}
                        />
                        <MyPicker
                            selectedValue={data.rcm} 
                            style={styles.textInput}
                            items={["Yes","No"].map((item,index) => {return {id : index + 1,name : item,value : item };})}
                            placeholder={"Yes/No"}
                            onValueChange={(rcm) => setData({...data,rcm})}
                        />
                    </View> 
                     </View>}
                 <View style={styles.header}>
                    <Text style={styles.text_header} onPress={() => {openSalesModal()}}>{data.both ? "Items/Services" : data.ledgers ? "Services" : "Items"}</Text>
                    <TouchableOpacity 
                        style={{marginLeft: 'auto',flexDirection:"row"}}
                        onPress={() => {openSalesModal()}}
                    >
                        <MaterialCommunityIcons 
                            name="plus"
                            color="#05375a"
                            size={20}
                        />
                        <Text style={[styles.textSign,{marginLeft: 5}]}>Add</Text>
               
                    </TouchableOpacity>
                </View>
                <View style={{minHeight:screenHeight + (data.serviceNature ? 100 : 0)}}>
                     {salesList}
                </View>
            </View>
             <View style={[styles.wrapper,styles.button]}>
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
            <Modal
                  transparent={true}
                  visible={data.salesModalVisible}
                  onRequestClose={() => { setData({...data,salesModalVisible : false}); } }
            >
               <View style={{backgroundColor : "#000000aa",flex : 1}}>
                    <View style={styles.modal}>
                        <View style={[styles.header,{marginTop : 15}]}>
                            <TouchableOpacity onPress={() => {closeSalesModal()}}>
                                <MaterialCommunityIcons 
                                    name="arrow-left"
                                    color="#05375a"
                                    size={20}
                                />
                            </TouchableOpacity>
                            <Text style={styles.text_header}>Add {data.ledgers ? "Ledger" : "Item"}</Text>
                            <TouchableOpacity 
                                style={{marginLeft: 'auto',flexDirection:"row",paddingHorizontal : 10}}
                                onPress={() => {closeSalesModal()}}
                            >
                                <FontAwesome 
                                    name="times"
                                    color="#05375a"
                                    size={20}
                                />
                       
                            </TouchableOpacity>
                        </View>
                        <View style={styles.wrapper}>
                            <SalesComponent itemData={data.selectedSale} index={data.saleIndex} addSales={addSales} itemList={data.both ? (data.ledgersOnBoth ? data.ledgerList : data.items) : data.items} navigation={navigation} ledgers={data.both ? data.ledgersOnBoth : data.ledgers}/>
                        </View>
                    </View>
               </View>
            </Modal>

            <Modal
                  transparent={true}
                  visible={data.optionBothModalVisible}
                  onRequestClose={() => { setData({...data,optionBothModalVisible : false}); } }
            >
                 <View style={{backgroundColor : "#000000aa",flex : 1}}>
                      <View style={[styles.modal,{marginTop : height - .75 * height , marginHorizontal : 50}]}>
                        <View style={[styles.header,{marginTop : 15}]}>
                            <TouchableOpacity onPress={() => {setData({...data,optionBothModalVisible : false})}}>
                                <MaterialCommunityIcons 
                                    name="arrow-left"
                                    color="#05375a"
                                    size={20}
                                />
                            </TouchableOpacity>
                            <Text style={styles.text_header}>Sales Type</Text>
                            <TouchableOpacity 
                                style={{marginLeft: 'auto',flexDirection:"row",paddingHorizontal : 10}}
                                onPress={() => {setData({...data,optionBothModalVisible : false})}}
                            >
                                <FontAwesome 
                                    name="times"
                                    color="#05375a"
                                    size={20}
                                />
                       
                            </TouchableOpacity>
                        </View>
                       
                            <TouchableOpacity style={[styles.wrapper,{flexDirection : "row"}]} onPress={()=> onSelectType("Items")}>
                                <View style={styles.card}> 
                                    <Text style={styles.cardTitle}>ITEMS</Text>
                                </View>
                            </TouchableOpacity>
                          
                           
                             <TouchableOpacity style={[styles.wrapper,{flexDirection : "row"}]} onPress={()=> onSelectType("Ledgers")}>
                                <View style={styles.card}> 
                                    <Text style={styles.cardTitle}>LEDGERS</Text>
                                </View>
                            </TouchableOpacity>
                   
                    </View>
                    
                 </View>
            </Modal>
      </ScrollView>
    );
}

export default InvoiceForm;



const styles = StyleSheet.create({
     container1: {
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom : 20,
        marginTop : 10
      },
    container: {
      flex: 1,
    },
    wrapper : {
      paddingHorizontal: 20,
      paddingTop : 5
    },
    iwrapper : {
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        paddingBottom: 5,
        marginBottom: 10,

    },
    header: {
        flexDirection: "row",
        justifyContent: 'flex-end',
        paddingHorizontal: 5,
        paddingBottom: 10,
        borderBottomWidth: 3,
        borderBottomColor: '#f2f2f2',
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
        fontSize: 17.5,
        paddingLeft : 10
    },
    text_footer: {
        color: '#05375a',
        fontSize: 18
    },
    static_action : {
       flexDirection: 'row',
       paddingVertical: 2,
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
    dateInput: {
        marginTop: 0,
        color: '#000',
        fontSize: 17,
        fontWeight: 'bold'
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
        fontSize: 17,
        fontWeight: 'bold'
    },
    modal : {
       backgroundColor : "#fff",
       marginTop : 50,
       marginHorizontal : 0,
    },
    card: {
        marginVertical: 10,
        flexDirection: 'row',
        shadowColor: '#999',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    cardTitle: {
        fontWeight: 'bold',
    },
  });
