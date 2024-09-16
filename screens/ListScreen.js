import React, { useEffect } from 'react';
import { View, Text, Button,FlatList, StyleSheet ,Alert } from 'react-native';

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

import CustomerCard from '../components/CustomerCard';
import InvoiceCard from '../components/InvoiceCard';
import ItemCard from '../components/ItemCard';
import LedgerCard from '../components/LedgerCard';
import InvoiceSettingCard from '../components/InvoiceSettingCard';
import ReceiptCard from '../components/ReceiptCard';

import NetInfo from '@react-native-community/netinfo';

const ListScreen = ({navigation,route}) => {


	const listObj = {
		"Customers" : {
			process : "Company Customer",
			name : "Customer",
			form : "CustomerForm",
			idName : "customerId",
			list : "customers",
		},
		"Suppliers" : {
			process : "Suppliers",
			name : "Supplier",
			form : "CustomerForm",
			idName : "customerId",
			list : "suppliers",
		},
		"Invoices" : {
			process : "Invoice",
			name : "Invoice",
			form : "InvoiceForm",
			idName : "invoiceId",
			list : "invoices",
		},
		"Items" : {
			process : "Items",
			name : "Item",
			form : "ItemForm",
			idName : "itemId",
			list : "items",
		},
		"Ledgers" : {
			process : "Ledgers",
			name : "Ledger",
			form : "LedgerForm",
			idName : "itemId",
			list : "ledgers",
		},
		"Invoice Settings" : {
			process : "Invoice Settings",
			name : "Invoice Setting",
			form : "InvoiceSettings",
			idName : "insetId",
			list : "insetlist",
		},
		"Receipts" : {
			process : "Receipts",
			name : "Receipt",
			form : "ReceiptScreen",
			idName : "receiptId",
			list : "receipts",
		},
		"Purchases" : {
			process : "Purchase",
			name : "Purchase",
			form : "InvoiceForm",
			idName : "invoiceId",
			list : "purchases"
		}
	}

	const screenObj_ = listObj[route.params.title];

    const [list, setList] = React.useState([]);

	const [utilityMap, setUtilityMap] = React.useState({});    

    let userToken = null;
  

    useEffect(() => {
        (async() => {
        	userToken = await AsyncStorage.getItem('userToken');


        	if(screenObj_.process == "Invoice" || screenObj_.process == "Receipts" || screenObj_.process == "Purchase"){
        		const customersString = await AsyncStorage.getItem("customers");
        		const customers = customersString ? Object.values(JSON.parse(customersString)) : [];
        		const cuMap = customers.reduce((acc,cur)=>{ acc[cur.customerId] = cur.name; return acc;},{});
        		setUtilityMap(cuMap);
        	}

        	

        	const listString = await AsyncStorage.getItem(screenObj_.list);
            const list = listString ? Object.values(JSON.parse(listString)) : [];

            setList(list);

            const willFocusSubscription = navigation.addListener('focus', async() => {
		        const listString = await AsyncStorage.getItem(screenObj_.list);
            	const list = listString ? Object.values(JSON.parse(listString)) : [];

            	setList(list);
		    });
        })();
    },[]);

    const deleteItem = async(id) => {
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

	        	const listString = await AsyncStorage.getItem(screenObj_.list);

		        const obj_ = JSON.parse(listString);

		        delete obj_[id];

		        AsyncStorage.setItem(screenObj_.list,JSON.stringify(obj_));
		        const list = Object.values(obj_);
		        setList(list);
	         }}
	      ]
	    );
    }
    const validationMessage = (message)=>{
    	alert(message.join(", ") + "\n \n" + "Invoice can not be created as above mentioned information are missing.");
  	}

    if(list.length == 0){
    	 return (
	      <View style={styles.container1}>
	        <Text>No {screenObj_.name} available</Text>
	        <Button
	          title={"Add " + screenObj_.name}
	          onPress={screenObj_.process == "Invoice" && route.params.validation ? () => validationMessage(route.params.messages) : () => navigation.navigate(screenObj_.form, {title: 'Add '+screenObj_.name , purchase : screenObj_.name == "Purchase"})}
	        />
	      </View>
	    );
    }
    else{

    	const renderItem = ({item}) => {
    		if(screenObj_.name == "Customer"){
    			return (
		            <CustomerCard 
		                itemData={item}
		                onPress={()=> navigation.navigate(screenObj_.form, {itemData: item,title : "Edit " + screenObj_.name})}
		                deleteItem={()=>deleteItem(item.customerId)}
		            />
		        );
    		}
    		else if(screenObj_.name == "Invoice" || screenObj_.name == "Purchase"){
    			item.buyerName = utilityMap[item.buyer];
    			return (
		            <InvoiceCard 
		                itemData={item}
		                onPress={()=> navigation.navigate(screenObj_.form, {itemData: item,title : "Edit " + screenObj_.name , purchase : screenObj_.name == "Purchase"})}
		                pdfView = {(base64,createPdf)=>navigation.navigate('PdfScreen', {title: 'Pdf Viewer',base64})}
		                deleteItem={()=>deleteItem(item.invoiceId)}
						purchase = {screenObj_.name == "Purchase"}
		            />
		        );
    		}
    		else if(screenObj_.name == "Ledger"){
    			return (
		            <LedgerCard 
		                itemData={item}
		                onPress={()=> navigation.navigate(screenObj_.form, {itemData: item,title : "Edit " + screenObj_.name})}
		                 deleteItem={()=>deleteItem(item.itemId)}
		            />
		        );
    		}
    		else if(screenObj_.name == "Invoice Setting"){
    			return (
		            <InvoiceSettingCard 
		                itemData={item}
		                onPress={()=> navigation.navigate(screenObj_.form, {itemData: item,title : "Edit " + screenObj_.name})}
		                deleteItem={()=>deleteItem(item.insetId)}
		            />
		        );
    		}
			else if(screenObj_.name == "Receipt"){
				item.buyerName = utilityMap[item.buyer];
				return (
					<ReceiptCard 
						itemData={item}
						onPress={()=> navigation.navigate(screenObj_.form, {itemData: item,title : "Edit " + screenObj_.name})}
						deleteItem={()=>deleteItem(item.itemId)}
					/>
				)

			}
	        else if(screenObj_.name == "Item"){
	        	return (
		            <ItemCard 
		                itemData={item}
		                onPress={()=> navigation.navigate(screenObj_.form, {itemData: item,title : "Edit " + screenObj_.name})}
		                deleteItem={()=>deleteItem(item.itemId)}
		            />
		        );
	        }
			else{
				return (
					<View>
						<Text>Default</Text>
					</View>
				)
			}
	    };

    	 return (
	      <View style={styles.container}>
	       	<FlatList 
	            data={list}
	            renderItem={renderItem}
	            keyExtractor={item => item[screenObj_.idName].toString()}
	            showsVerticalScrollIndicator={false}
	        />
	      </View>
	    );
    }
   
};

export default ListScreen;

const styles = StyleSheet.create({
  container1: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  container: {
    flex: 1, 
    width: '90%',
    alignSelf: 'center'
  },
});
