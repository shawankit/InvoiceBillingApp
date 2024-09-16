import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as IntentLauncher from 'expo-intent-launcher';
import moment from 'moment';

const ExportSalesPDF = async(from,to,action) => {

  const toNumberString = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
 };

   const cData = await AsyncStorage.getItem("companyData");

   const companyData = JSON.parse(cData);

   if(!cData){
       alert("No Company Exists");
       return;
    }


   const customers = JSON.parse(await AsyncStorage.getItem("customers"));

    let isLedgers = false,isBoth = false;
   const nature = companyData.nature;
   if(nature == "Service" || nature == "Transporter"){
      isLedgers = true;
    }
    if(nature == "Trading and Service"){
      isBoth = true;
    }


    
    const items = JSON.parse(await AsyncStorage.getItem(isBoth ?"items" :  isLedgers ? "ledgers" : "items"));

    const ledgersObj = isBoth ? JSON.parse(await AsyncStorage.getItem("ledgers")) : {};

    const invoices = JSON.parse(await AsyncStorage.getItem("invoices"));


    const getDate = (date) => {
        var dl = new Date(date);
        dl.setHours(0,0,0,0);
        return new Date(date);
    }

    const getEachInvoiceRow = (invoice,index) => {
      
      const customer = customers[invoice.buyer];
      var igst = 0, cgst = 0, sgst = 0;
      if(!invoice.withoutTax && (!invoice.transporter || (invoice.transporter && invoice.rcm == "No" ))){
        if(invoice.sameState){
          cgst = sgst = toNumberString(Math.round(invoice.igst));
        }
        else{
          igst = toNumberString(Math.round(invoice.igst));
        }
      }

      const totalAmount = invoice.sales.reduce((totalAmount,ele) => {

        const isLedgers = invoice.both ? ele.unit == undefined : invoice.ledgers;
  
        var discAmount =  parseFloat(ele.rate);
        if(!isLedgers){
          const disc = isNaN(parseFloat(ele.disc)) ? 0 : parseFloat(ele.disc);
          const amount = parseFloat(ele.quantity) * parseFloat(ele.rate);
          discAmount = amount - disc / 100 * amount; 
        }
       totalAmount += discAmount;
       return totalAmount;
      },0);

       return `<tr>
          <td>${customer.name}</td>
          <td>${customer.gstin == "" ? "URP" : customer.gstin}</td>
          <td>${invoice.number}</td>
          <td>${moment(invoice.date).format("DD-MM-YYYY")}</td>
          <td  style="text-align:right;">${toNumberString(Math.round(totalAmount))}</td>
          <td style="text-align:right;">${igst}</td>
          <td style="text-align:right;">${cgst}</td>
          <td style="text-align:right;">${sgst}</td>
          <td style="text-align:right;">0</td>
          <td style="text-align:right;">${toNumberString(Math.round(invoice.total))}</td>
       </tr>`;
    }

    var filterdedInvoices = [];
    Object.values(invoices).forEach((ele) => {
      if(getDate(from) <= getDate(ele.date) && getDate(to) > getDate(ele.date)){
          filterdedInvoices.push(ele);
      }
    });

    if(filterdedInvoices.length == 0){
      alert("No Invoice Exist For Selected Date Range")
      return;
    }
   var invoiceRows = filterdedInvoices.map((ele,index) =>{
     return getEachInvoiceRow(ele,index);
   }).join(""); 


   const getHtml = () => `
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
         <div class="col-12">
            <h1 style="text-align:center;"> ${companyData.name}  </h1>
            <h2 style="text-align:center;"> Report : Sales Register </h2>
            <h3 style="text-align:center;"> Dated - ${moment().format("DD-MM-YYYY")} </h3>
            <h3 style="text-align:center;"> Period - ${moment(from).format("DD-MM-YYYY")} to  ${moment(to).format("DD-MM-YYYY")}</h3>
          </div>
            <div class="col-12">
              <table class="table table-bordered-left">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>GSTIN</th>
                    <th>Invoice No.</th>
                    <th>Date</th>
                    <th style="text-align:right;">Taxable Value</th>
                    <th style="text-align:right;">IGST</th>
                    <th style="text-align:right;">CGST</th>
                    <th style="text-align:right;">SGST</th>
                    <th style="text-align:right;">Round off</th>
                    <th style="text-align:right;">Total( ₹ )</th>
                  </tr>
                </thead>
                <tbody>
                  ${ invoiceRows }
                </tbody>
            </table>
          </div>
         
        </div>
      </body>
      </html>
     `;

     const saveFile = async () => {

      const html = await getHtml();

      const { uri ,base64 } = await Print.printToFileAsync({ html,base64 : true  });

      if(action == "download"){
       const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
 
       if (permissions.granted) {
        const duri = permissions.directoryUri;
         const newFile = await FileSystem.StorageAccessFramework.createFileAsync(
            duri,
            "salesinvoice.pdf",
            "pdf"
        );
          
        await FileSystem.writeAsStringAsync(newFile, base64, { encoding: FileSystem.EncodingType.Base64 })
        ;
         alert(`Files Downloaded Successfully`);
       }
     }
     else{
       const toUri = FileSystem.documentDirectory + 'salesinvoice.pdf';
       await FileSystem.copyAsync({ from : uri , to : toUri  })
       await Sharing.shareAsync(toUri)
       .catch((err) => console.log('Sharing::error', err))
     }
       
   }
 
   await saveFile();

}

export default ExportSalesPDF;


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