import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';

import FontAwesome from 'react-native-vector-icons/FontAwesome';

const CustomerCard = ({itemData, onPress,deleteItem}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.card}>
        <View style={styles.cardImgWrapper}>
           <FontAwesome style={styles.cardImg}
              name="user"
              color="#05375a"
              size={120}
          />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{itemData.name}</Text>

          <Text style={styles.cardFooter}>Supplier Type - {itemData.supplier}</Text>
          <Text style={[styles.cardFooter,{marginBottom : 5}]}>GSTIN - {itemData.gstin == "" ? "URP" : itemData.gstin}</Text>

          <Text style={styles.cardDetails}>{itemData.city + " , " + itemData.state.split(" - ")[0] + " - " + itemData.pincode }</Text>
          <Text style={styles.cardDetails}>{itemData.phone}</Text>
          <Text style={styles.cardDetails}>{itemData.email}</Text>
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
};

export default CustomerCard;

const styles = StyleSheet.create({
  card: {
    height: "auto",
    marginVertical: 10,
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
  },
  cardImgWrapper: {
    flex: 1,
  },
  cardImg: {
    alignSelf: 'center',
    padding : 15,
    borderRightWidth : 1,
    borderColor: '#ccc',
  },
  cardInfo: {
    flex: 2,
    padding: 10,
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
