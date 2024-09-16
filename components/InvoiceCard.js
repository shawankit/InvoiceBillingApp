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

const InvoiceCard = ({itemData, onPress,pdfView,deleteItem,purchase}) => {


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

 
 const getRate = (itemDetails,rate) =>{
       if(itemDetails.onRate == "On Item Rate"){
          const itemRateObj = JSON.parse(itemDetails.itemRates);
          const rates = parseFloat(rate) <= parseFloat(itemRateObj.criticalValue) ? parseFloat(itemRateObj.lessthanRate): parseFloat(itemRateObj.greaterthanRate);
          const ar = !itemData.sameState ? rates : rates / 2;
          return ar;
        }
        else{
          const rates = parseFloat(itemDetails.rates);
          const ar = !itemData.sameState ? rates : rates / 2;
          return ar;
        }
     }
 
  const getHtml = async() => {
     

     const cData = await AsyncStorage.getItem("companyData");

     const companyData = JSON.parse(cData);


     const customers = await AsyncStorage.getItem("customers");

     const both = itemData.both;
     const items = JSON.parse(await AsyncStorage.getItem(both ?"items" :  itemData.ledgers ? "ledgers" : "items"));

     const ledgersObj = both ? JSON.parse(await AsyncStorage.getItem("ledgers")) : {};

     const buyer = JSON.parse(customers)[itemData.buyer];

     const ledgerClass = both ? "" : itemData.ledgers ? "hideTableColums" : "";

    const signature = await AsyncStorage.getItem("signatures");
    
     let totalAmount = 0;
     const salesrows = itemData.sales.map((ele) => {

      const isLedgers = both ? ele.unit == undefined : itemData.ledgers;

      var discAmount =  parseFloat(ele.rate);
      if(!isLedgers){
        const disc = isNaN(parseFloat(ele.disc)) ? 0 : parseFloat(ele.disc);
        const amount = parseFloat(ele.quantity) * parseFloat(ele.rate);
        discAmount = amount - disc / 100 * amount; 
      }
      
     
     totalAmount += discAmount;

     const aitems = both ? ele.unit == undefined ? ledgersObj : items : items;
      return `
       <tr>
         <td>${aitems[ele.description].name + (isLedgers ? ( ele.desc.trim() != ""? "("+ ele.desc.trim() +")" : "" ): ""  )}</td>
         <td>${aitems[ele.description].hsn}</td>
         <td class="${ledgerClass}" style="text-align:right;">${ isLedgers? "" : ele.quantity}</td>
         <td class="${ledgerClass}" style="text-align:right;">${isLedgers? "" : ele.rate}</td>
         <td class="${ledgerClass}" >${isLedgers ? "" : aitems[ele.description].unit.split(" - ")[0]}</td>
         <td class="${ledgerClass}" style="text-align:right;">${isLedgers? "" : ele.disc}</td>
         <td style="text-align:right;">${toNumberString(Math.round(discAmount))}</td>
       </tr>` 
     }).join("");


     const hsnMap = {};
     itemData.sales.forEach((ele)=>{

        const isLedgers = both ? ele.unit == undefined : itemData.ledgers;
       const aitems = both ? ele.unit == undefined ? ledgersObj : items : items;
      const hsn = aitems[ele.description].hsn;
      var discAmount =  parseFloat(ele.rate);
      if(!isLedgers){
        const disc = isNaN(parseFloat(ele.disc)) ? 0 : parseFloat(ele.disc);
        const amount = parseFloat(ele.quantity) * parseFloat(ele.rate);
        discAmount = amount - disc / 100 * amount; 
      }


      const grate =  getRate(aitems[ele.description],ele.rate);

      if(!hsnMap[aitems[ele.description].hsn]){
          if((!isLedgers && aitems[ele.description].et == "Taxable") || (isLedgers && (itemData.transporter ? aitems[ele.description].rcm == "No" : true))){
             hsnMap[hsn] = {
               cgstRate : grate,
               sgstRate : grate,
               cgstAmt : discAmount * grate / 100,
               sgstAmt : discAmount * grate / 100,
               taxableValue :  discAmount, 
             }
           }
           else{
             hsnMap[hsn] = {
               nil : true,
               taxableValue :  discAmount,
             }
           }
       }
       else {
         hsnMap[hsn].taxableValue += discAmount; 
         if((!isLedgers && aitems[ele.description].et == "Taxable") || (isLedgers && aitems[ele.description].rcm == "No")){
           hsnMap[hsn].cgstAmt += discAmount * grate / 100;
           hsnMap[hsn].sgstAmt += discAmount * grate / 100;
         }
       } 

     });

     const taxableRows = itemData.transporter && itemData.rcm == "Yes" ? "" : (Object.keys(hsnMap).map((ele) => {

       return  !hsnMap[ele].nil ? `
       <tr>
         <td>${ele}</td>
         <td style="text-align:right;">${toNumberString(Math.round(hsnMap[ele].taxableValue))}</td>
         <td style="text-align:right;">${hsnMap[ele].cgstRate} %</td>
         <td style="text-align:right;">${toNumberString(Math.round(hsnMap[ele].cgstAmt))}</td>
          ${itemData.sameState ? "<td style='text-align:right;'>"+ hsnMap[ele].sgstRate + " %</td><td style='text-align:right;'>" + toNumberString(Math.round(hsnMap[ele].sgstAmt))+"</td>" : ""}
         <td style="text-align:right;">${toNumberString(Math.round(hsnMap[ele].cgstAmt + (itemData.sameState ? hsnMap[ele].sgstAmt : 0)))}</td>
       </tr>` : `
       <tr>
         <td>${ele}</td>
         <td style="text-align:right;">${toNumberString(Math.round(hsnMap[ele].taxableValue))}</td>
         <td style="text-align:right;">NIL</td>
         <td style="text-align:right;">NIL</td>
         <td style="text-align:right;">NIL</td>
         <td style="text-align:right;">NIL</td>
         <td style="text-align:right;">0</td>
       </tr>`
     }).join(""));

      const totalRow = ` <tr>
         <td style="text-align:right;font-weight:bold;">Taxable Value</td>
         <td></td>
         <td class="${ledgerClass}" style="text-align:right;"></td>
         <td class="${ledgerClass}"style="text-align:right;"></td>
         <td class="${ledgerClass}"></td>
         <td class="${ledgerClass}" style="text-align:right;"></td>
         <td style="text-align:right;font-weight:bold;">${toNumberString(Math.round(totalAmount))}</td>
       </tr>`

     const cgstRow = ` <tr>
         <td style="text-align:right;font-weight:bold;">Total ${itemData.sameState ? "CGST" : "IGST"}</td>
         <td></td>
         <td class="${ledgerClass}" style="text-align:right;"></td>
         <td class="${ledgerClass}" style="text-align:right;"></td>
         <td class="${ledgerClass}" ></td>
         <td class="${ledgerClass}" style="text-align:right;"></td>
         <td style="text-align:right;font-weight:bold;">${toNumberString(Math.round(itemData.igst))}</td>
       </tr>`

      const sgstRow = ` <tr>
         <td style="text-align:right;font-weight:bold;">Total SGST</td>
         <td></td>
         <td class="${ledgerClass}" style="text-align:right;"></td>
         <td class="${ledgerClass}" style="text-align:right;"></td>
         <td class="${ledgerClass}" ></td>
         <td class="${ledgerClass}" style="text-align:right;"></td>
         <td style="text-align:right;font-weight:bold;">${toNumberString(Math.round(itemData.igst))}</td>
       </tr>`

     const totalChargeableRow = ` <tr>
         <td style="text-align:right;font-weight:bold;">Total Invoice Amount</td>
         <td></td>
         <td class="${ledgerClass}" style="text-align:right;"></td>
         <td class="${ledgerClass}" style="text-align:right;"></td>
         <td class="${ledgerClass}" ></td>
         <td class="${ledgerClass}" style="text-align:right;"></td>
         <td style="text-align:right;font-weight:bold;">${toNumberString(Math.round(itemData.total))}</td>
       </tr>`

     return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pdf Content</title>
          <style>
            ${pdfStyle}
          </style>
      </head>
      <body>
         <div class="main container">
          <div style="position:absolute;top:-10px;left:47% ;">
            <h1 style="text-align:right;">${companyData.registrationType == "Composition" ? "Bill of Supply" 
            : companyData.registrationType == "Consumer" ? (purchase ? "Purchase" : "Invoice") : "Tax " + (purchase ? "Purchase" : "Invoice")}</h1>
          </div>
          <div class="col-12">
              <div class="companyInfo"  style="width:50%;">
                  <h1>${companyData.name}</h1>
                  <h4>${companyData.address}</h4>
                  <h4>${companyData.city}:-${companyData.pincode}</h4>
                  <h4> State : ${companyData.state.split(" - ")[0]}, Code : ${companyData.state.split(" - ")[1]}</h4>
                  <h4 ${itemData.withoutTax ? "style='display:none;'" : ""}> GSTIN/UIN: ${companyData.gstin}</h4>
                  <h4> E-Mail : ${companyData.email}</h4>
                  <h4> Phone : ${companyData.phone}</h4>
              </div>
              <div class="invoicenumber" style="position:absolute;right : 0px; top : 0px;">
                  <h2>${(purchase ? "Purchase" : "Invoice")} No.  ${itemData.number}</h2>
                </div>

              <div class="dated" style="position:absolute;right : 0px;top : 40px;">
                <h2>Dated ${moment(itemData.date).format("DD/MM/YYYY")}</h2>
              </div>
         </div>

         <hr style="height : 10px;margin : 0px -10px;">

         
         <div class="col-12">
            <h2>CUSTOMER</h2>
            <h3>${buyer.name}</h3>
            <h4>${buyer.address}</h4>
            <h4>${buyer.city}:-${companyData.pincode}</h4>
            <h4> State : ${companyData.state.split(" - ")[0]}, Code : ${companyData.state.split(" - ")[1]}</h4>
            <h4 ${itemData.withoutTax ? "style='display:none;'" : ""} > GSTIN : ${buyer.gstin == "" ? "URP" : buyer.gstin}</h4>
            <h4>${buyer.phone}</h4>
         </div>

         <div style="position:absolute;right : 40px; top : 300px;">
              ${itemData.ewaybillNo ? "<h4>Eway Bill No. : "+itemData.ewaybillNo+"</h4>" : ""}
              ${itemData.vehicleno ? "<h4>Vehicle No. : "+itemData.vehicleno+"</h4>" : ""}
              ${itemData.transporter ? "<h4>RCM Applicable : "+itemData.rcm+"</h4>" : ""}
              ${itemData.transporter ? "<h4>Tax Paid by Service "+(itemData.rcm == "Yes" ? "Recipient" : "Provider")+"</h4>" : ""}
          </div>


       
          
         <hr style="height : 10px;margin : 0px -10px;">

         <div class="col-12">
           <table class="table table-bordered-left">
             <thead>
               <tr>
                 <th>Description of ${"Items"}</th>
                 <th>HSN/SAC</th>
                 <th class="${ledgerClass}" style="text-align:right;">Quantity</th>
                 <th class="${ledgerClass}" style="text-align:right;">Rate( ₹ )</th>
                 <th class="${ledgerClass}" >Per</th>
                 <th class="${ledgerClass}" style="text-align:right;">Disc. %</th>
                 <th style="text-align:right;">Amount( ₹ )</th>
               </tr>
             </thead>
             <tbody>
               ${ salesrows }
               ${ itemData.withoutTax ? "" : itemData.transporter && itemData.rcm == "Yes" ?  "" : totalRow  }
               ${ itemData.withoutTax ? "" : itemData.transporter && itemData.rcm == "Yes" ?  "" : cgstRow }
               ${  itemData.withoutTax ? "" : itemData.transporter && itemData.rcm == "Yes" ?  "" : (itemData.sameState ? sgstRow : "") }
                ${  totalChargeableRow }
             </tbody>
           </table>
         </div>

         <div class="col-12">
           <h4> Total Invoice Amount (in Words)  </h4>
           <h3> ${getNumbersInWords(Math.round(itemData.total))}</h3>
         </div>

         <div class="col-12" ${itemData.withoutTax ? "style='display:none'" : itemData.transporter && itemData.rcm == "Yes" ? "style='display:none'" : "" }>
           <table class="table table-bordered-left">
             <thead>
               <tr>
                 <th rowspan="2">HSN/SAC</th>
                 <th rowspan="2">Taxable Value</th>
                 <th colspan="2">${itemData.sameState ? "Central Tax" : "IGST"}</th>
                 ${itemData.sameState ? "<th colspan='2'>State Tax</th>" : ""}
                 <th rowspan="2">Total Tax Amount (₹)</th>
               </tr>
                <tr>
                 <th>Rate</th>
                 <th>Amount</th>
                  ${itemData.sameState ? "<th>Rate</th><th>Amount</th>" : ""}
               </tr>
             </thead>
             <tbody>
               ${ taxableRows }
             </tbody>
           </table>
         </div>

         <div>
         <div class="col-12" style="margin-top:25px;position:relative">
           <h3> Company PAN  : ${companyData.pan}</h3>

           <div style="font-size : 14px;">${companyData.bank}   A/C no.  ${companyData.account}</div>
           <div style="font-size : 14px;">Branch : ${companyData.branch.split(" - ")[0]}     IFSC Code : ${companyData.branch.split(" - ")[1]}</div>
           <div style="font-size : 14px;">UPI : ${companyData.upi}</div>


           <div style="position:absolute;right : 0px;top : 30px;">
              <h3> For ${companyData.name}</h3>
           </div>
             
          <div style="position:absolute;right : 0px;top : 40px;">
              <div style="width:100px;height:100px;">
                ${signature ? '<img src="'+signature+'" style="width:100%;"/>' : ''}
              </div>
              <div style="font-size : 16px;margin-top:10px;margin-left:-40px;">Authorized Signatory</div>
           </div>

           
         </div>
         </div>
        </div>


         
      </body>
      </html>
     `;
  }

  const createPdf = async () => {
    try {

        const html = await getHtml();
        const { uri  } = await Print.printToFileAsync({ html });

        const toUri = FileSystem.documentDirectory + 'invoice'+itemData.number.replace(/\//g,"")+'.pdf';
        await FileSystem.copyAsync({ from : uri , to : toUri  })
        await Sharing.shareAsync(toUri)
        .catch((err) => console.log('Sharing::error', err))
         
        
     } catch (err) {
         console.error(err);
     }
 };

  const viewPdf = async () => {
     try {

         const html = await getHtml();
         const {  base64  } = await Print.printToFileAsync({ html ,base64 : true });

         DeviceEventEmitter.addListener("event.sharePdfEvent", () => createPdf());

        pdfView(base64,createPdf);
         
      } catch (err) {
          console.error(err);
      }
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
            <Text style={styles.cardTitle}>{purchase ? "Purcahse" : "Invoice"} No.  {itemData.number}</Text>

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
