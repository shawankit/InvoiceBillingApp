import React, { useEffect } from 'react';
import {  View, 
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';

import  MyPicker  from '../components/MyPicker';
import DateTimePicker from '@react-native-community/datetimepicker';
import ExportData from '../components/ExportData';
import ExportItemMaster from '../components/ExportItemMaster';
import ExportLedgerMaster from '../components/ExportLedgerMaster'

const ExportScreen = ({navigation,route}) =>{


	 var initialData = {
      
        from :  new Date().getTime() - 24*60*60*1000,
        to : new Date().getTime() ,
        valid : true,
    }

    const [data, setData] = React.useState(initialData);
	const [show, setShow] = React.useState(false);
    const [eshow, seteShow] = React.useState(false);


    const dateInputChange = (date,name) => {

      if(name == "from"){
          setShow(false);
      }
      else{
          seteShow(false);
      }
      if(date){
          setData({...data,[name] : date.getTime()})
      }
    }

    const exportInvoice = (action) => {
        ExportData(data.from,data.to,action)
    }

    const exportItems = (action) => {
    	ExportItemMaster(action)
    }

    const exportLedgers = (action) => {
    	ExportLedgerMaster(action)
    }

	return (

	  <View style={styles.container}>
	    <ScrollView style={styles.wrapper} showsVerticalScrollIndicator={false}>
	     <View style={styles.box}>
			<View style={styles.header}>
                <Text style={styles.text_header}>Export Invoice Data For Tally</Text>
            </View>
             <TouchableOpacity onPress={()=>setShow(true)} activeOpacity="0">
                 <View style={styles.header}>
                    <Text style={styles.text_header}>From</Text>
                </View>
                 <View style={styles.action} >
                    <Text  style={[styles.textInput]}>{moment(data.from).format("DD/MM/YYYY")}</Text> 
                    {show && (
                        <DateTimePicker
                          testID="dateTimePicker"
                          value={new Date(data.from)}
                          mode={"date"}
                          is24Hour={true}
                          display="default"
                          onChange={(event, date) => dateInputChange(date,"from")}
                        />
                      )}
                   </View>
                 </TouchableOpacity>
                  <TouchableOpacity onPress={()=>seteShow(true)}  activeOpacity="0">
                  <View style={styles.header}>
                    <Text style={styles.text_header}>To</Text>
                </View>
                 <View style={styles.action}   >
                   <Text style={[styles.textInput]}>{moment(data.to).format("DD/MM/YYYY")}</Text> 
                    {eshow && (
                        <DateTimePicker
                          testID="dateTimePicker"
                          value={new Date(data.to)}
                          mode={"date"}
                          is24Hour={true}
                          display="default"
                          onChange={(event, date) => dateInputChange(date,"to")}
                        />
                      )}
                   </View>
                 </TouchableOpacity>

             <View style={{flexDirection : 'row'}}>
               <View style={styles.buttonWrapper}>
		         	<TouchableOpacity style={{paddingTop : 10,flexDirection : 'row'}} onPress={()=>{exportInvoice("share")}} activeOpacity="0">
		               <FontAwesome               
		                   name="share-alt"
		                  color="#05375a"
		                  size={18}
		               />
		               <Text style={{fontSize: 18,color: '#444',paddingLeft : 10,marginTop : - 3}}>Share</Text>
              		</TouchableOpacity>
		       </View>
		       <View style={styles.buttonWrapper}>
	            	<TouchableOpacity style={{paddingTop : 10,flexDirection : 'row'}} onPress={()=>{exportInvoice("download")}} activeOpacity="0">
		               <FontAwesome               
		                   name="floppy-o"
		                  color="#05375a"
		                  size={18}
		               />
		               <Text style={{fontSize: 18,color: '#444',paddingLeft : 10,marginTop : - 3}}>Save</Text>
	              	</TouchableOpacity>
		       </View>
            </View>
        </View>
        <View style={styles.box}>
            <View style={styles.header}>
                <Text style={styles.text_header}>Export Legder Data for Tally</Text>
            </View>
             <View style={{flexDirection : 'row'}}>
               <View style={styles.buttonWrapper}>
		         	<TouchableOpacity style={{paddingTop : 10,flexDirection : 'row'}} onPress={()=>{exportLedgers("share")}} activeOpacity="0">
		               <FontAwesome               
		                   name="share-alt"
		                  color="#05375a"
		                  size={18}
		               />
		               <Text style={{fontSize: 18,color: '#444',paddingLeft : 10,marginTop : - 3}}>Share</Text>
              		</TouchableOpacity>
		       </View>
		       <View style={styles.buttonWrapper}>
	            	<TouchableOpacity style={{paddingTop : 10,flexDirection : 'row'}} onPress={()=>{exportLedgers("download")}} activeOpacity="0">
		               <FontAwesome               
		                   name="floppy-o"
		                  color="#05375a"
		                  size={18}
		               />
		               <Text style={{fontSize: 18,color: '#444',paddingLeft : 10,marginTop : - 3}}>Save</Text>
	              	</TouchableOpacity>
		       </View>
            </View>
        </View>
        <View style={styles.box}>
            <View style={styles.header}>
                <Text style={styles.text_header}>Export Items Data for Tally</Text>
            </View>
             <View style={{flexDirection : 'row'}}>
               <View style={styles.buttonWrapper}>
		         	<TouchableOpacity style={{paddingTop : 10,flexDirection : 'row'}} onPress={()=>{exportItems("share")}} activeOpacity="0">
		               <FontAwesome               
		                   name="share-alt"
		                  color="#05375a"
		                  size={18}
		               />
		               <Text style={{fontSize: 18,color: '#444',paddingLeft : 10,marginTop : - 3}}>Share</Text>
              		</TouchableOpacity>
		       </View>
		       <View style={styles.buttonWrapper}>
	            	<TouchableOpacity style={{paddingTop : 10,flexDirection : 'row'}} onPress={()=>{exportItems("download")}} activeOpacity="0">
		               <FontAwesome               
		                   name="floppy-o"
		                  color="#05375a"
		                  size={18}
		               />
		               <Text style={{fontSize: 18,color: '#444',paddingLeft : 10,marginTop : - 3}}>Save</Text>
	              	</TouchableOpacity>
		       </View>
            </View>
            </View>
           </ScrollView>
      </View>
	)
}

export default ExportScreen;

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
        fontSize: 20
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
    },
    box : { 
    	borderWidth: 1,
    	borderColor : "#ccc",
    	marginTop:10,
    	borderRadius : 8
    },
    buttonWrapper : {
    	margin : 10
    }
});
