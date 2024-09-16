import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';

import FontAwesome from 'react-native-vector-icons/FontAwesome';

const SalesCard = ({itemData, onPress,ledgers,deleteItem,transporter,rcm,withoutTax}) => {


  const toNumberString = (number) => {
    return Math.round(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
 };
    
    if(ledgers){
     let gst = 0;
    let transporterCheck = (!transporter || (transporter && rcm == 'No'));
    let taxCalcCheck =  itemData.itemInfo && transporterCheck && (transporter ? ((!itemData.itemInfo.rcm || itemData.itemInfo.rcm == "No")) : true);
     if(!withoutTax && taxCalcCheck){
        const rates = parseFloat(itemData.itemInfo.rates);
        const ar = !itemData.sameState ? rates : rates /2;
        gst = ar * parseFloat(itemData.rate) / 100;
     }
     return (
      <TouchableOpacity onPress={onPress}>
        <View style={styles.card2}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{itemData.itemInfo ? itemData.itemInfo.name : itemData.description}</Text>
            <View style={{flexDirection : 'row'}}>
              <Text style={[styles.cardDetails]}>Amount - ₹ {itemData.rate} {"\n"}Description - {itemData.desc}</Text>
              { !withoutTax && taxCalcCheck ?
                <>
                  { !itemData.sameState ? 
                    <Text style={[styles.cardDetails,{marginLeft : 'auto'}]}>IGST - ₹ {toNumberString(gst)}</Text>
                    : 
                   <Text style={[styles.cardDetails,{marginLeft : 'auto'}]}>CGST - ₹ {toNumberString(gst)} {"\n"}SGST - ₹ {toNumberString(gst)}</Text>
                  }
                </> : null
              }
            </View>
             <TouchableOpacity style={{marginLeft : 'auto',flexDirection : 'row'}} onPress={()=>{deleteItem()}} activeOpacity="0">
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
  }
  else{
    const disc = isNaN(parseFloat(itemData.disc)) ? 0 : parseFloat(itemData.disc);
    const amount = parseFloat(itemData.quantity) * parseFloat(itemData.rate);
    const discAmount = amount - disc / 100 * amount;

    let gst = 0;
    if(!withoutTax && itemData.itemInfo && itemData.itemInfo.et == "Taxable"){
      if(itemData.itemInfo.onRate == "On Taxable Rate"){
        const rates = parseFloat(itemData.itemInfo.rates);
        const ar = !itemData.sameState ? rates : rates /2;
        gst = ar * discAmount / 100;
      }
      else{
        const itemRateObj = JSON.parse(itemData.itemInfo.itemRates);
        const rates = parseFloat(itemData.rate) <= parseFloat(itemRateObj.criticalValue) ? parseFloat(itemRateObj.lessthanRate) : parseFloat(itemRateObj.greaterthanRate);
        const ar = !itemData.sameState ? rates : rates / 2;
        gst = ar * discAmount / 100;
      }
      
    }

    

    return (
      <TouchableOpacity onPress={onPress}>
        <View style={styles.card}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{itemData.itemInfo ? itemData.itemInfo.name : itemData.description}</Text>
            <View style={{flexDirection : 'row'}}>
              <Text style={styles.cardDetails}>Quantity - {itemData.quantity} {itemData.unit}</Text>
              <Text style={[styles.cardDetails,{marginLeft : 'auto'}]}>Rate - ₹ {itemData.rate}</Text>
            </View>
            <View style={{flexDirection : 'row'}}>
              <Text style={styles.cardDetails}>Discount - {disc} %</Text>
              <Text style={[styles.cardFooter,{marginLeft : 'auto'}]}>Amount - ₹ {toNumberString(discAmount)}</Text>
              
            </View>
            { !withoutTax && itemData.itemInfo && itemData.itemInfo.et == "Taxable" ?
              <View style={{flexDirection : 'row'}}>
                { !itemData.sameState ? 
                  <Text style={styles.cardDetails}>IGST - ₹ {toNumberString(gst)}</Text>
                  : 
                 <Text style={styles.cardDetails}>CGST - ₹ {toNumberString(gst)} {"\n"}SGST - ₹ {toNumberString(gst)}</Text>
                }
              </View> : null
            }
             
             <TouchableOpacity style={{marginLeft : 'auto',flexDirection : 'row'}} onPress={()=>{deleteItem()}} activeOpacity="0">
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
  }
  
};

export default SalesCard;

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
   card2: {
    marginVertical: 10,
    flexDirection: 'row',
    shadowColor: '#999',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  cardImgWrapper: {
    flex: 0.9,
  },
  cardImg: {
    height: '100%',
    width: '100%',
    alignSelf: 'center',
    borderColor: '#ccc',
    borderRadius: 8,
    borderWidth: 1,
    paddingLeft : 20,
    paddingTop : 10
  },
  cardInfo: {
    flex: 2,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom : 5,
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
