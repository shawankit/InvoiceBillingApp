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


const PurchaseForm = ({route,navigation}) => {


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
    
    const saveHandle = () => {
        
    }

    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

            <View style={styles.wrapper} >
               
                
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
            

      </ScrollView>
    );
}

export default PurchaseForm;



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
