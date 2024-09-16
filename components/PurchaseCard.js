import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity,PermissionsAndroid,Platform} from 'react-native';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as Print from 'expo-print';

import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DeviceEventEmitter} from "react-native"

const InvoiceCard = ({itemData, onPress,pdfView,deleteItem}) => {


 const toNumberString = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
 };


 const getNumbersInWords = (number) => {
    var a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
    var b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];

    function inWords (num) {
      if ((num = num.toString()).length > 9) return 'overflow';
      var n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!n) return; var str = '';
      str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
      str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
      str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
      str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
      str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : '';
      return str;
    }

    return inWords(number);
 }
  


  return (
    <View>
      <View >
        <View style={styles.card}>
          <TouchableOpacity style={styles.cardImgWrapper} onPress={()=>viewPdf()} activeOpacity="0">
             <View style={styles.cardImg}>
              <FontAwesome 
                  name="file-pdf-o"
                  color="#05375a"
                  size={90}
              />
             <TouchableOpacity style={{paddingTop : 10,flexDirection : 'row'}} onPress={()=>{createPdf()}} activeOpacity="0">
               <FontAwesome               
                   name="share-alt"
                  color="#05375a"
                  size={14}
               />
               <Text style={{fontSize: 14,color: '#444',paddingLeft : 10,marginTop : - 3}}>Share</Text>
              </TouchableOpacity>
           </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cardInfo} onPress={onPress} activeOpacity="0">
            <Text style={styles.cardTitle}>Invoice No.  {itemData.number}</Text>

            <Text style={styles.cardFooter}>Dated - {moment(itemData.date).format("DD/MM/YYYY")}</Text>
            <Text style={styles.cardFooter}>Buyer - {itemData.buyerName}</Text>
            <Text style={styles.cardFooter}>Number of {"Items"} - {itemData.sales.length}</Text>
            {
              !itemData.withoutTax ? ((!itemData.transporter || (itemData.transporter && itemData.rcm == "No" )) ?
              itemData.sameState? 
              <>
              <Text style={styles.cardFooter}>Total CGST - ₹ {toNumberString(Math.round(itemData.igst))}</Text>
              <Text style={styles.cardFooter}>Total SGST - ₹ {toNumberString(Math.round(itemData.igst))}</Text>
              </>
              :
              <Text style={styles.cardFooter}>Total IGST - ₹ {toNumberString(Math.round(itemData.igst))}</Text>
              : null) : null
            }
            
            <Text style={styles.cardFooter}>Total Amount - ₹ {toNumberString(Math.round(itemData.total))}</Text>

            <TouchableOpacity style={{marginLeft : 'auto',flexDirection : 'row'}} onPress={()=>{deleteItem()}} activeOpacity="0">
             <FontAwesome               
                 name="trash"
                color="#05375a"
                size={14}
             />
             <Text style={{fontSize: 14,color: '#444',paddingLeft : 10,marginTop : - 3}}>Delete</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </View>

    
    </View>
  );
};

export default InvoiceCard;

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

const pdfStyle = `body {
          margin: 0;
          font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
          font-size: 1rem;
          font-weight: 400;
          line-height: 1.5;
          color: #212529;
          text-align: left;
          background-color: #fff
      }

      [tabindex="-1"]:focus {
          outline: 0!important
      }

      hr {
          box-sizing: content-box;
          height: 0;
          overflow: visible
      }

      h1,h2,h3,h4,h5,h6 {
          margin-top: 0;
          margin-bottom: .5rem
      }

     .col-12 {
        max-width: 100%;
        position: relative;
        width: 100%;
        min-height: 1px;
    }

     .table {
        width: 100%;
        max-width: 100%;
        margin-bottom: 1rem;
        background-color: transparent
    }

    .table td,.table th {
        padding: 1px;
        vertical-align: top;
        border-top: 1px solid #dee2e6
    }

    .table thead th {
        vertical-align: bottom;
        border-bottom: 2px solid #dee2e6
    }

    .table tbody+tbody {
        border-top: 2px solid #dee2e6
    }

    .table .table {
        background-color: #fff
    }

    .table-sm td,.table-sm th {
        padding: .3rem
    }

    .table-bordered {
        border: 1px solid #dee2e6
    }

    .table-bordered-left {
        border: 1px solid #dee2e6
    }

    .table-bordered td,.table-bordered th {
        border: 1px solid #dee2e6
    }

    .table-bordered-left td,.table-bordered-left th {
        border-left: 1px solid #dee2e6
    }

    .table-bordered thead td,.table-bordered thead th {
        border-bottom-width: 2px
    }

    .table .thead-dark th {
        color: #fff;
        background-color: #212529;
        border-color: #32383e
    }

    .table .thead-light th {
        color: #495057;
        background-color: #e9ecef;
        border-color: #dee2e6
    }

    .table-dark {
        color: #fff;
        background-color: #212529
    }

    .table-dark td,.table-dark th,.table-dark thead th {
        border-color: #32383e
    }

    .table-dark.table-bordered {
        border: 0
    }

    .table-dark.table-striped tbody tr:nth-of-type(odd) {
        background-color: rgba(255,255,255,.05)
    }

    .table-dark.table-hover tbody tr:hover {
        background-color: rgba(255,255,255,.075)
    }
    .main{
      margin: 30px;
      padding: 0px 10px;
      border: 1px solid black;
      width: 1000px;
      height : 1320px;
  }
  .hideTableColums{
    display : none;
  }
  `;
