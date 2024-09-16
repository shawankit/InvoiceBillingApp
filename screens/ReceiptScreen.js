import React, { useState , useEffect } from 'react';
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
    SafeAreaView,
    TouchableHighlight
} from 'react-native';


import * as Animatable from 'react-native-animatable';
import {LinearGradient} from 'expo-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';


import  MyPicker  from '../components/MyPicker';
import moment from 'moment';
const {height} = Dimensions.get("screen");
const screenHeight = height - 275;

const ReceiptScreen = ({route,navigation}) => {


    var initialData = {
        receiptId: '',
        date: new Date().getTime(),
        buyer : "",
        mode : "",
        amountpaid : "",
        customers : [],
        customerMap : {},
        bankAccount : "",
        bankAccounts : [],
        customerInvoiceMap : {},
        buyerValidate : true,
        modeValidate : true,
        receiptBuyerMap : {}
    }

    var myItem ;
    if(route.params.itemData){
        myItem = route.params.itemData;
        initialData = {...initialData,...route.params.itemData};
    }

    const [data, setData] = useState(initialData);
    const [show, setShow] = React.useState(false);

    const toNumberString = (number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    };

    useEffect(() => {
        const dataFromStorage = async() => {
            let cString = await AsyncStorage.getItem("customers");
            const customers = cString ? Object.values(JSON.parse(cString)) : [];
            const customerMap =  cString ? JSON.parse(cString) : {};

            let inString = await AsyncStorage.getItem("invoices");
            const invoices = inString ? Object.values(JSON.parse(inString)) : [];

            const customerInvoiceMap = invoices.reduce((acc,curr) => {
                if(!acc[curr.buyer]){
                    acc[curr.buyer] = []; 
                }
                acc[curr.buyer].push(curr);

                return acc;
            },{});

            let bString = await AsyncStorage.getItem("banks");
            const bankAccounts = bString ? Object.values(JSON.parse(bString)) : [];

            const cData = await AsyncStorage.getItem("companyData");
            const companyData = cData != null ? JSON.parse(cData) : {};

            const {bank,branch,account,state} = companyData;

            if(account && account != ""){
                bankAccounts.push({bankId : account, bank,branch, account, state});
            }

            let reString = await AsyncStorage.getItem("receipts");
            const receipts = reString ? Object.values(JSON.parse(reString)) : [];
            const receiptBuyerMap = receipts.reduce((acc,curr) => {
                if(!acc[curr.buyer]){
                    acc[curr.buyer] = []; 
                }
                acc[curr.buyer].push(curr);

                return acc;
            },{});
            


            setData({...data,customers,customerMap,customerInvoiceMap,bankAccounts,receiptBuyerMap})
        }

        dataFromStorage();

        navigation.addListener('focus', async() => {
            dataFromStorage();
        });
    },[]);

    const dateInputChange = (event,date) => {
        setShow(false);
        date = date.getTime();
        setData({...data,date})
    }
    const setSelectedValue = (name,val,placeholder) => {
        var mergedData = {...data,[name]:val+""};

        setData(mergedData);
    }

    const buyerPicker = data.customers.map((item,index) => {
        return  {id : index + 1,name : item.name,value : item.customerId };  
    });

    const modPicker = ["Cash","NEFT","RTGS","IMPS","Cheque"].map((item,index) => {
        return  {id : index + 1,name : item,value : item };  
    });

    const banksPicker = data.bankAccounts.map((item,index) => {
        return  {id : index + 1,name : item.account + " - " + item.bank ,value : item.bankId };  
    });

    const saveHandle = async() => {
        let {receiptId,buyer,mode,amountpaid,bankAccount,date} = data;

        if(buyer == ""){
            alert("Please Select Customer")
            return;
        }

        if(mode == ""){
            alert("Please Select Mode of Payment");
            return;
        }

        if(mode != "Cash" &&  bankAccount == ""){
            alert("Please Select Bank Account");
            return;
        }

        let sendData = {receiptId,buyer,mode,amountpaid,bankAccount,date,due : totalAmount - amountpaid}
        if(sendData.receiptId == ''){
            sendData.receiptId = new Date().getTime();
        }

        const itemsString = await AsyncStorage.getItem('receipts');

        const items = itemsString ? JSON.parse(itemsString) : {};
        
        items[sendData.receiptId] = sendData;
        
        AsyncStorage.setItem('receipts', JSON.stringify(items));

        navigation.navigate('ListScreen', {title: 'Receipts'})
    };
    
    let totalAmount = 0;
    const invoicelistTemplate =  data.buyer != "" && data.customerInvoiceMap[data.buyer] ? 
    (
        data.customerInvoiceMap[data.buyer].map((ele,index) => {
            totalAmount += ele.total;
            return  (
                <View style={styles.static_action} key={index + 1}>
                    <Text >{ele.number}</Text>
                    <Text style={[{marginLeft: 'auto'}]}>{moment(ele.date).format("DD-MM-YYYY")}</Text>
                    <Text style={[{marginLeft: 'auto'}]}>{toNumberString(ele.total)}</Text>
                </View>
            )
        })

    ) :  
    <View style={[styles.static_action,{paddingVertical:30}]}>

        <Text style={{fontWeight : "bold",marginLeft:"auto"}}>{data.buyer != "" &&  data.customerMap[data.buyer] ? "No Invoices exists for " + data.customerMap[data.buyer].name  + "!!" : "No Customer Selected !!"}</Text>
        <Text style={{fontWeight : "bold",marginLeft:"auto"}}>{""}</Text>
    </View>;

    const amountAlreadyPaid =  data.buyer != "" && data.receiptBuyerMap[data.buyer] ?  data.receiptBuyerMap[data.buyer].reduce((acc,cur) => {
        return cur.receiptId == data.receiptId ? acc : acc + parseFloat(cur.amountpaid);
    },0): 0;

    const totalDue = totalAmount - (data.amountpaid == "" ? 0 : parseFloat(data.amountpaid)) - amountAlreadyPaid;
    return (
        <View style={styles.container}>
  
              <ScrollView style={styles.wrapper} showsVerticalScrollIndicator={false}>
                <View style={{minHeight:screenHeight}}>
                    <View style={styles.iwrapper}>
                        <View style={styles.static_action}>
                                <Text style={{fontWeight : "bold"}}>Dated</Text>
                                <Text onPress={()=>setShow(true)} style={[{marginLeft: 'auto'}]}>{moment(data.date).format("DD/MM/YYYY")}</Text> 
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
                                placeholder="Select Customer"
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

                    <View style={styles.action}>
                        <MaterialIcons 
                                name="payments"
                                color="#05375a"
                                size={20}
                            />
                            <MyPicker
                                selectedValue={data.mode} 
                                style={styles.textInput}
                                items={modPicker}
                                placeholder="Select Mode of Payment"
                                onValueChange={(itemValue, itemIndex) => setSelectedValue("mode",itemValue)}
                            />
                            
                            { !data.modeValidate ?  
                                <Animatable.View animation="fadeInLeft" duration={500}>
                                    <Text style={styles.errorMsg}>*required</Text>
                                </Animatable.View> : null
                            }
                    </View>
                    { 
                        data.mode != "Cash" ? (
                            <View style={styles.action}>
                                <MaterialCommunityIcons 
                                    name="account-details"
                                    color="#05375a"
                                    size={20}
                                />
                                <MyPicker
                                    selectedValue={data.bankAccount} 
                                    style={styles.textInput}
                                    items={banksPicker}
                                    placeholder="Select Your Account"
                                    addIcon ={true}
                                    addFun={()=>navigation.navigate("BankForm", {title: 'Add Bank',from:'receipt'})}
                                    onValueChange={(itemValue, itemIndex) => setSelectedValue("bankAccount",itemValue)}
                                />
                                
                            </View>
                        ) : null
                    }

                    {/*<View style={styles.action}>
                        <MaterialCommunityIcons 
                                name="cash-multiple"
                                color="#05375a"
                                size={20}
                            />
                        <TextInput
                            value={data.amountpaid}  
                            placeholder={"Amount Received"}
                            style={styles.textInput}
                            autoCapitalize="none"
                            keyboardType={"number-pad"}
                            onChangeText={(amountpaid) => setData({...data,amountpaid})}
                        />
                </View>*/}
                    <View style={styles.iwrapper}>
                        <View style={styles.static_action}>
                            <Text style={{fontWeight : "bold"}}>Invoice No.</Text>
                            <Text style={[{fontWeight : "bold",marginLeft: 'auto'}]}>Dated</Text>
                            <Text style={[{fontWeight : "bold",marginLeft: 'auto'}]}>Amount</Text>
                        </View>
                        {
                           invoicelistTemplate
                        }
                        
                    </View>
                    <View style={styles.iwrapper}>
                     <View style={styles.static_action}>
                            <Text style={{fontWeight : "bold"}}>Total Amount To Be Received</Text>
                            <Text style={[{fontWeight : "bold",marginLeft: 'auto'}]}>{toNumberString(totalAmount)}</Text>
                        </View>
                    </View>
                    <View style={styles.iwrapper}>
                     <View style={styles.static_action}>
                            <Text style={{fontWeight : "bold"}}>Total Amount Already Received</Text>
                            <Text style={[{fontWeight : "bold",marginLeft: 'auto'}]}>{toNumberString(amountAlreadyPaid)}</Text>
                        </View>
                    </View>
                    <View style={styles.iwrapper}>
                     <View style={styles.static_action}>
                            <Text style={{fontWeight : "bold"}}>Amount Received</Text>
                            <TextInput
                                value={data.amountpaid}  
                                placeholder={"Enter Amount"}
                                style={[styles.textInput,{textAlign:"right",marginLeft: 'auto'}]}
                                autoCapitalize="none"
                                keyboardType={"number-pad"}
                                onChangeText={(amountpaid) => setData({...data,amountpaid})}
                            />
                        </View>
                    </View>
                    
                    <View style={styles.iwrapper}>
                     <View style={styles.static_action}>
                            <Text style={{fontWeight : "bold"}}>{totalDue >= 0 ? "Total Due" : "Advance"}</Text>
                            <Text style={[{fontWeight : "bold",marginLeft: 'auto'}]}>{toNumberString(Math.abs(totalDue))}</Text>
                        </View>
                    </View>
                </View>
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

export default ReceiptScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    wrapper : {
      paddingHorizontal: 20,
      paddingVertical: 10,
      
    },
    iwrapper : {
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        padding : 10
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
    static_action : {
        flexDirection: 'row',
        paddingVertical: 5,
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