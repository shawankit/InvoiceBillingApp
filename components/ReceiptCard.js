import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import moment from 'moment';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const ReceiptCard = ({itemData, onPress,deleteItem}) => {

    const toNumberString = (number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
     };

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.card}>
        
        <View style={styles.cardInfo}>
         <View style={{flexDirection : 'row'}}>
            <View>
            	<Text style={styles.cardTitle}>Party Name : {itemData.buyerName}</Text>
            	<Text style={styles.cardFooter}>Dated : {itemData.date != "" ? moment(itemData.date).format("DD/MM/YYYY") : ""}</Text>
              <Text style={styles.cardFooter}>Mode Of Payment : {itemData.mode}</Text>
              {itemData.mode != "Cash" ? <Text style={styles.cardFooter}>Bank Acount : {itemData.bankAccount}</Text> : null}
                <Text style={styles.cardFooter}>Amount Received : {toNumberString(itemData.amountpaid)}</Text>
                <Text style={styles.cardFooter}>{itemData.due >= 0 ? "Total Due" : "Advance"} : {toNumberString(Math.abs(itemData.due))}</Text>
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

export default ReceiptCard;

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
