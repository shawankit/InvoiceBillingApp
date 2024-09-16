import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';

import FontAwesome from 'react-native-vector-icons/FontAwesome';

const ItemCard = ({itemData, onPress,deleteItem}) => {


 
  const moreheight = itemData.et == "Taxable" && itemData.onRate == "On Item Rate" ? {height : 120, marginVertical: 10,} : { marginVertical: 10};

  const content = itemData.et == "Exempted" ? 
  				<View>
                <Text style={styles.cardDetails}>HSN Code - {itemData.hsn}</Text>
	            	<Text style={styles.cardFooter}>{itemData.nil}</Text>
	              
              </View> : itemData.onRate == "On Taxable Rate" ?  ( itemData.rates != "" ?
	            <View >
	            	<Text style={styles.cardDetails}>HSN Code - {itemData.hsn}</Text>
	            	<Text style={[styles.cardDetails]}>IGST - {itemData.rates} %</Text>
	            </View> : <Text style={styles.cardDetails}>HSN Code - {itemData.hsn}</Text>): 
               <View >
                <Text style={styles.cardDetails}>HSN Code - {itemData.hsn}</Text>
                <Text style={[styles.cardDetails]}>IGST - {JSON.parse(itemData.itemRates).lessthanRate} % (0 - {JSON.parse(itemData.itemRates).criticalValue})</Text>
                <Text style={[styles.cardDetails]}>IGST - {JSON.parse(itemData.itemRates).greaterthanRate} % ( {">"} {JSON.parse(itemData.itemRates).criticalValue})</Text>
              </View>


  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.card}>
        
        <View style={styles.cardInfo}>
         <View style={{flexDirection : 'row'}}>
            <View>
            	<Text style={styles.cardTitle}>{itemData.name}</Text>
            	<Text style={styles.cardFooter}>{itemData.et + (itemData.onRate != ""? "("+ itemData.onRate +")" : "")}</Text>
		        {content}
            </View>
            <View  style={[{marginLeft : 'auto'}]}>
            	<View style={{flexDirection : 'row'}}>
            		<Text style={[styles.cardDetails,{marginLeft : 'auto'}]}>Code</Text>
            		<Text style={[styles.cardFooter,{marginLeft : 'auto'}]}>{itemData.code}</Text>
             	</View>
            	<View style={{flexDirection : 'row'}}>
	          		<Text style={[styles.cardFooter,{marginLeft : 'auto'}]}>{itemData.unit}</Text>
            	</View>
            	{
            		itemData.et != "Exempted" ? ( itemData.onRate == "On Taxable Rate" ? ( itemData.rates != "" ?
            		<View style={{marginTop : 16}}>
		            	<Text style={[styles.cardDetails,{marginLeft : 'auto'}]}>CGST - {parseFloat(itemData.rates) / 2} %</Text>
	            		<Text style={[styles.cardDetails,{marginLeft : 'auto'}]}>SGST - {parseFloat(itemData.rates) / 2} %</Text>
	            	</View> : null): 
                  <View style={{marginTop : 5}}>
                    <Text style={[styles.cardDetails,{marginLeft : 'auto'}]}>CGST - {parseFloat(JSON.parse(itemData.itemRates).lessthanRate) / 2} %  (0 - {JSON.parse(itemData.itemRates).criticalValue})</Text>
                    <Text style={[styles.cardDetails,{marginLeft : 'auto'}]}>SGST - {parseFloat(JSON.parse(itemData.itemRates).lessthanRate) / 2} % (0 - {JSON.parse(itemData.itemRates).criticalValue})</Text>

                    <Text style={[styles.cardDetails,{marginLeft : 'auto'}]}>CGST - {parseFloat(JSON.parse(itemData.itemRates).greaterthanRate) / 2} % ( {">"} {JSON.parse(itemData.itemRates).criticalValue}) </Text>
                    <Text style={[styles.cardDetails,{marginLeft : 'auto'}]}>SGST - {parseFloat(JSON.parse(itemData.itemRates).greaterthanRate) / 2} % (   {">"} {JSON.parse(itemData.itemRates).criticalValue}) </Text>
                  </View>

                )
            		: null
            	}
            </View>

          </View>
            <TouchableOpacity style={{marginLeft : 'auto',flexDirection : 'row',marginTop:10}} onPress={()=>{deleteItem()}} activeOpacity="0">
             <FontAwesome               
                 name="trash"
                color="#05375a"
                size={14}
             />
             <Text style={{fontSize: 14,color: '#444',paddingLeft : 10,marginTop : - 3}}>Delete</Text>
            </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ItemCard;

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    flexDirection: 'row',
    shadowColor: '#999',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  cardImgWrapper: {
    flex: 0.68,
  },
  cardImg: {
    height: '100%',
    width: '100%',
    alignSelf: 'center',
    borderColor: '#ccc',
    borderRadius: 8,
    borderWidth: 1,
    borderBottomRightRadius: 0,
    borderTopRightRadius: 0,
    paddingLeft : 10,
    paddingTop : 10
  },
  cardInfo: {
    flex: 2,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderLeftWidth: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom : 10,
    fontSize: 17,
  },
  cardDetails: {
    fontSize: 12,
    color: '#444',
  },
  cardFooter: {
    fontSize: 12,
    color: '#444',
    fontWeight: 'bold',
  },
});
