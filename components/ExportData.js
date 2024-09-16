import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import moment from 'moment';

const ExportData = async(from,to,action) => {

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


   const getItemTemplate = (item) => {
         var discAmount =  parseFloat(item.rate);
         const isLedger = isBoth ? item.unit == undefined : isLedgers;
          if(!isLedger){
            var disc = isNaN(parseFloat(item.disc)) ? 0 : parseFloat(item.disc);
            const amount = parseFloat(item.quantity) * parseFloat(item.rate);
            discAmount = amount - disc / 100 * amount; 
          }
          discAmount = discAmount.toFixed(2)
          const aitems = isBoth ? item.unit == undefined ? ledgersObj : items : items;
         return   `<ALLINVENTORYENTRIES.LIST>
           <STOCKITEMNAME>${aitems[item.description].name}</STOCKITEMNAME>
           <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
           <ISLASTDEEMEDPOSITIVE>No</ISLASTDEEMEDPOSITIVE>
           <ISAUTONEGATE>No</ISAUTONEGATE>
           <ISCUSTOMSCLEARANCE>No</ISCUSTOMSCLEARANCE>
           <ISTRACKCOMPONENT>No</ISTRACKCOMPONENT>
           <ISTRACKPRODUCTION>No</ISTRACKPRODUCTION>
           <ISPRIMARYITEM>No</ISPRIMARYITEM>
           <ISSCRAP>No</ISSCRAP>
           <RATE>${item.rate}/${item.unit}</RATE>
           ${!isLedger && disc ? "<DISCOUNT>"+ disc + "</DISCOUNT>" : ""}
           <AMOUNT>${discAmount}</AMOUNT>
           <ACTUALQTY> ${item.quantity} ${item.unit}</ACTUALQTY>
           <BILLEDQTY> ${item.quantity} ${item.unit}</BILLEDQTY>
           <BATCHALLOCATIONS.LIST>
            <GODOWNNAME>Main Location</GODOWNNAME>
            <BATCHNAME>Primary Batch</BATCHNAME>
            <INDENTNO/>
            <ORDERNO/>
            <TRACKINGNUMBER/>
            <DYNAMICCSTISCLEARED>No</DYNAMICCSTISCLEARED>
            <AMOUNT>${discAmount}</AMOUNT>
            <ACTUALQTY> ${item.quantity} ${item.unit}</ACTUALQTY>
            <BILLEDQTY> ${item.quantity} ${item.unit}</BILLEDQTY>
            <ADDITIONALDETAILS.LIST>        </ADDITIONALDETAILS.LIST>
            <VOUCHERCOMPONENTLIST.LIST>        </VOUCHERCOMPONENTLIST.LIST>
           </BATCHALLOCATIONS.LIST>
           <ACCOUNTINGALLOCATIONS.LIST>
            <OLDAUDITENTRYIDS.LIST TYPE="Number">
             <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
            </OLDAUDITENTRYIDS.LIST>
            <LEDGERNAME>Sales</LEDGERNAME>
            <GSTCLASS/>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <LEDGERFROMITEM>No</LEDGERFROMITEM>
            <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
            <ISPARTYLEDGER>No</ISPARTYLEDGER>
            <ISLASTDEEMEDPOSITIVE>No</ISLASTDEEMEDPOSITIVE>
            <ISCAPVATTAXALTERED>No</ISCAPVATTAXALTERED>
            <ISCAPVATNOTCLAIMED>No</ISCAPVATNOTCLAIMED>
            <AMOUNT>${discAmount}</AMOUNT>
            <SERVICETAXDETAILS.LIST>        </SERVICETAXDETAILS.LIST>
            <BANKALLOCATIONS.LIST>        </BANKALLOCATIONS.LIST>
            <BILLALLOCATIONS.LIST>        </BILLALLOCATIONS.LIST>
            <INTERESTCOLLECTION.LIST>        </INTERESTCOLLECTION.LIST>
            <OLDAUDITENTRIES.LIST>        </OLDAUDITENTRIES.LIST>
            <ACCOUNTAUDITENTRIES.LIST>        </ACCOUNTAUDITENTRIES.LIST>
            <AUDITENTRIES.LIST>        </AUDITENTRIES.LIST>
            <INPUTCRALLOCS.LIST>        </INPUTCRALLOCS.LIST>
            <DUTYHEADDETAILS.LIST>        </DUTYHEADDETAILS.LIST>
            <EXCISEDUTYHEADDETAILS.LIST>        </EXCISEDUTYHEADDETAILS.LIST>
            <RATEDETAILS.LIST>        </RATEDETAILS.LIST>
            <SUMMARYALLOCS.LIST>        </SUMMARYALLOCS.LIST>
            <STPYMTDETAILS.LIST>        </STPYMTDETAILS.LIST>
            <EXCISEPAYMENTALLOCATIONS.LIST>        </EXCISEPAYMENTALLOCATIONS.LIST>
            <TAXBILLALLOCATIONS.LIST>        </TAXBILLALLOCATIONS.LIST>
            <TAXOBJECTALLOCATIONS.LIST>        </TAXOBJECTALLOCATIONS.LIST>
            <TDSEXPENSEALLOCATIONS.LIST>        </TDSEXPENSEALLOCATIONS.LIST>
            <VATSTATUTORYDETAILS.LIST>        </VATSTATUTORYDETAILS.LIST>
            <COSTTRACKALLOCATIONS.LIST>        </COSTTRACKALLOCATIONS.LIST>
            <REFVOUCHERDETAILS.LIST>        </REFVOUCHERDETAILS.LIST>
            <INVOICEWISEDETAILS.LIST>        </INVOICEWISEDETAILS.LIST>
            <VATITCDETAILS.LIST>        </VATITCDETAILS.LIST>
            <ADVANCETAXDETAILS.LIST>        </ADVANCETAXDETAILS.LIST>
           </ACCOUNTINGALLOCATIONS.LIST>
           <DUTYHEADDETAILS.LIST>       </DUTYHEADDETAILS.LIST>
           <SUPPLEMENTARYDUTYHEADDETAILS.LIST>       </SUPPLEMENTARYDUTYHEADDETAILS.LIST>
           <TAXOBJECTALLOCATIONS.LIST>       </TAXOBJECTALLOCATIONS.LIST>
           <REFVOUCHERDETAILS.LIST>       </REFVOUCHERDETAILS.LIST>
           <EXCISEALLOCATIONS.LIST>       </EXCISEALLOCATIONS.LIST>
           <EXPENSEALLOCATIONS.LIST>       </EXPENSEALLOCATIONS.LIST>
          </ALLINVENTORYENTRIES.LIST>`
   }

   const getTaxEntries = (gstname,gst) => {
      return `<LEDGERENTRIES.LIST>
           <OLDAUDITENTRYIDS.LIST TYPE="Number">
            <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
           </OLDAUDITENTRYIDS.LIST>
           <ROUNDTYPE/>
           <LEDGERNAME>Output ${gstname}</LEDGERNAME>
           <GSTCLASS/>
           <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
           <LEDGERFROMITEM>No</LEDGERFROMITEM>
           <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
           <ISPARTYLEDGER>No</ISPARTYLEDGER>
           <ISLASTDEEMEDPOSITIVE>No</ISLASTDEEMEDPOSITIVE>
           <ISCAPVATTAXALTERED>No</ISCAPVATTAXALTERED>
           <ISCAPVATNOTCLAIMED>No</ISCAPVATNOTCLAIMED>
           <AMOUNT>${gst}</AMOUNT>
           <VATEXPAMOUNT>${gst}</VATEXPAMOUNT>
           <SERVICETAXDETAILS.LIST>       </SERVICETAXDETAILS.LIST>
           <BANKALLOCATIONS.LIST>       </BANKALLOCATIONS.LIST>
           <BILLALLOCATIONS.LIST>       </BILLALLOCATIONS.LIST>
           <INTERESTCOLLECTION.LIST>       </INTERESTCOLLECTION.LIST>
           <OLDAUDITENTRIES.LIST>       </OLDAUDITENTRIES.LIST>
           <ACCOUNTAUDITENTRIES.LIST>       </ACCOUNTAUDITENTRIES.LIST>
           <AUDITENTRIES.LIST>       </AUDITENTRIES.LIST>
           <INPUTCRALLOCS.LIST>       </INPUTCRALLOCS.LIST>
           <DUTYHEADDETAILS.LIST>       </DUTYHEADDETAILS.LIST>
           <EXCISEDUTYHEADDETAILS.LIST>       </EXCISEDUTYHEADDETAILS.LIST>
           <RATEDETAILS.LIST>       </RATEDETAILS.LIST>
           <SUMMARYALLOCS.LIST>       </SUMMARYALLOCS.LIST>
           <STPYMTDETAILS.LIST>       </STPYMTDETAILS.LIST>
           <EXCISEPAYMENTALLOCATIONS.LIST>       </EXCISEPAYMENTALLOCATIONS.LIST>
           <TAXBILLALLOCATIONS.LIST>       </TAXBILLALLOCATIONS.LIST>
           <TAXOBJECTALLOCATIONS.LIST>       </TAXOBJECTALLOCATIONS.LIST>
           <TDSEXPENSEALLOCATIONS.LIST>       </TDSEXPENSEALLOCATIONS.LIST>
           <VATSTATUTORYDETAILS.LIST>       </VATSTATUTORYDETAILS.LIST>
           <COSTTRACKALLOCATIONS.LIST>       </COSTTRACKALLOCATIONS.LIST>
           <REFVOUCHERDETAILS.LIST>       </REFVOUCHERDETAILS.LIST>
           <INVOICEWISEDETAILS.LIST>       </INVOICEWISEDETAILS.LIST>
           <VATITCDETAILS.LIST>       </VATITCDETAILS.LIST>
           <ADVANCETAXDETAILS.LIST>       </ADVANCETAXDETAILS.LIST>
          </LEDGERENTRIES.LIST>`;
   }
   
   const getEachInvoiceTemplate = (invoice,index) => {

     const itemsTemplete = invoice.sales.map((element) => {
       return getItemTemplate(element);
     }).join("");

     const customer = customers[invoice.buyer];

     let taxTemplate;

     if(invoice.sameState){
         taxTemplate = getTaxEntries("CGST",Math.round(invoice.igst)) +  getTaxEntries("SGST",Math.round(invoice.igst));
     }
     else {
        taxTemplate = getTaxEntries("IGST",Math.round(invoice.igst));
     }
     return `<TALLYMESSAGE xmlns:UDF="TallyUDF">
         <VOUCHER VCHTYPE="Sales" ACTION="Create">
          <ADDRESS.LIST TYPE="String">
           <ADDRESS>${customer.address}</ADDRESS>
           <ADDRESS>${customer.city}-711101</ADDRESS>
          </ADDRESS.LIST>
          <BASICBUYERADDRESS.LIST TYPE="String">
           <BASICBUYERADDRESS>${customer.address}</BASICBUYERADDRESS>
           <BASICBUYERADDRESS>${customer.city}-${customer.pincode}</BASICBUYERADDRESS>
          </BASICBUYERADDRESS.LIST>
          <OLDAUDITENTRYIDS.LIST TYPE="Number">
          <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
          </OLDAUDITENTRYIDS.LIST>
          <DATE>${moment(invoice.date).format("YYYYMMDD")}</DATE>
          <GSTREGISTRATIONTYPE>${customer.supplier}</GSTREGISTRATIONTYPE>
          <VATDEALERTYPE>${customer.supplier}</VATDEALERTYPE>
          <STATENAME>${customer.state.split(" - ")[0]}</STATENAME>
          <COUNTRYOFRESIDENCE>India</COUNTRYOFRESIDENCE>
          <PARTYGSTIN>${customer.gstin}</PARTYGSTIN>
          <PLACEOFSUPPLY>${customer.state.split(" - ")[0]}</PLACEOFSUPPLY>
          <PARTYNAME>${customer.name}</PARTYNAME>
          <PARTYLEDGERNAME>${customer.name}</PARTYLEDGERNAME>
          <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
          <PARTYMAILINGNAME>${customer.name}</PARTYMAILINGNAME>
          <PARTYPINCODE>${customer.pincode}</PARTYPINCODE>
          <CONSIGNEEGSTIN>${customer.gstin}</CONSIGNEEGSTIN>
          <CONSIGNEEMAILINGNAME>${customer.name}</CONSIGNEEMAILINGNAME>
          <CONSIGNEEPINCODE>${customer.pincode}</CONSIGNEEPINCODE>
          <CONSIGNEESTATENAME>${customer.state.split(" - ")[0]}</CONSIGNEESTATENAME>
          <VOUCHERNUMBER>${invoice.number}</VOUCHERNUMBER>
          <BASICBASEPARTYNAME>${customer.name}</BASICBASEPARTYNAME>
          <CSTFORMISSUETYPE/>
          <CSTFORMRECVTYPE/>
          <FBTPAYMENTTYPE>Default</FBTPAYMENTTYPE>
          <PERSISTEDVIEW>Invoice Voucher View</PERSISTEDVIEW>
          <BASICBUYERNAME>${customer.name}</BASICBUYERNAME>
          <CONSIGNEECOUNTRYNAME>India</CONSIGNEECOUNTRYNAME>
          <VCHGSTCLASS/>
          <BUYERPINNUMBER>${customer.pan}</BUYERPINNUMBER>
          <CONSIGNEEPINNUMBER>${customer.pan}</CONSIGNEEPINNUMBER>
          <VCHENTRYMODE>Item Invoice</VCHENTRYMODE>
          <DIFFACTUALQTY>No</DIFFACTUALQTY>
          <ISMSTFROMSYNC>No</ISMSTFROMSYNC>
          <ASORIGINAL>No</ASORIGINAL>
          <AUDITED>No</AUDITED>
          <FORJOBCOSTING>No</FORJOBCOSTING>
          <ISOPTIONAL>No</ISOPTIONAL>
          <EFFECTIVEDATE>20210402</EFFECTIVEDATE>
          <USEFOREXCISE>No</USEFOREXCISE>
          <ISFORJOBWORKIN>No</ISFORJOBWORKIN>
          <ALLOWCONSUMPTION>No</ALLOWCONSUMPTION>
          <USEFORINTEREST>No</USEFORINTEREST>
          <USEFORGAINLOSS>No</USEFORGAINLOSS>
          <USEFORGODOWNTRANSFER>No</USEFORGODOWNTRANSFER>
          <USEFORCOMPOUND>No</USEFORCOMPOUND>
          <USEFORSERVICETAX>No</USEFORSERVICETAX>
          <ISDELETED>No</ISDELETED>
          <ISONHOLD>No</ISONHOLD>
          <ISBOENOTAPPLICABLE>No</ISBOENOTAPPLICABLE>
          <ISGSTSECSEVENAPPLICABLE>No</ISGSTSECSEVENAPPLICABLE>
          <ISEXCISEVOUCHER>No</ISEXCISEVOUCHER>
          <EXCISETAXOVERRIDE>No</EXCISETAXOVERRIDE>
          <USEFORTAXUNITTRANSFER>No</USEFORTAXUNITTRANSFER>
          <IGNOREPOSVALIDATION>No</IGNOREPOSVALIDATION>
          <EXCISEOPENING>No</EXCISEOPENING>
          <USEFORFINALPRODUCTION>No</USEFORFINALPRODUCTION>
          <ISTDSOVERRIDDEN>No</ISTDSOVERRIDDEN>
          <ISTCSOVERRIDDEN>No</ISTCSOVERRIDDEN>
          <ISTDSTCSCASHVCH>No</ISTDSTCSCASHVCH>
          <INCLUDEADVPYMTVCH>No</INCLUDEADVPYMTVCH>
          <ISSUBWORKSCONTRACT>No</ISSUBWORKSCONTRACT>
          <ISVATOVERRIDDEN>No</ISVATOVERRIDDEN>
          <IGNOREORIGVCHDATE>No</IGNOREORIGVCHDATE>
          <ISVATPAIDATCUSTOMS>No</ISVATPAIDATCUSTOMS>
          <ISDECLAREDTOCUSTOMS>No</ISDECLAREDTOCUSTOMS>
          <ISSERVICETAXOVERRIDDEN>No</ISSERVICETAXOVERRIDDEN>
          <ISISDVOUCHER>No</ISISDVOUCHER>
          <ISEXCISEOVERRIDDEN>No</ISEXCISEOVERRIDDEN>
          <ISEXCISESUPPLYVCH>No</ISEXCISESUPPLYVCH>
          <ISGSTOVERRIDDEN>No</ISGSTOVERRIDDEN>
          <GSTNOTEXPORTED>No</GSTNOTEXPORTED>
          <IGNOREGSTINVALIDATION>No</IGNOREGSTINVALIDATION>
          <ISGSTREFUND>No</ISGSTREFUND>
          <OVRDNEWAYBILLAPPLICABILITY>No</OVRDNEWAYBILLAPPLICABILITY>
          <ISVATPRINCIPALACCOUNT>No</ISVATPRINCIPALACCOUNT>
          <IGNOREEINVVALIDATION>No</IGNOREEINVVALIDATION>
          <IRNJSONEXPORTED>No</IRNJSONEXPORTED>
          <IRNCANCELLED>No</IRNCANCELLED>
          <ISSHIPPINGWITHINSTATE>No</ISSHIPPINGWITHINSTATE>
          <ISOVERSEASTOURISTTRANS>No</ISOVERSEASTOURISTTRANS>
          <ISDESIGNATEDZONEPARTY>No</ISDESIGNATEDZONEPARTY>
          <ISCANCELLED>No</ISCANCELLED>
          <HASCASHFLOW>No</HASCASHFLOW>
          <ISPOSTDATED>No</ISPOSTDATED>
          <USETRACKINGNUMBER>No</USETRACKINGNUMBER>
          <ISINVOICE>Yes</ISINVOICE>
          <MFGJOURNAL>No</MFGJOURNAL>
          <HASDISCOUNTS>No</HASDISCOUNTS>
          <ASPAYSLIP>No</ASPAYSLIP>
          <ISCOSTCENTRE>No</ISCOSTCENTRE>
          <ISSTXNONREALIZEDVCH>No</ISSTXNONREALIZEDVCH>
          <ISEXCISEMANUFACTURERON>No</ISEXCISEMANUFACTURERON>
          <ISBLANKCHEQUE>No</ISBLANKCHEQUE>
          <ISVOID>No</ISVOID>
          <ORDERLINESTATUS>No</ORDERLINESTATUS>
          <VATISAGNSTCANCSALES>No</VATISAGNSTCANCSALES>
          <VATISPURCEXEMPTED>No</VATISPURCEXEMPTED>
          <ISVATRESTAXINVOICE>No</ISVATRESTAXINVOICE>
          <VATISASSESABLECALCVCH>No</VATISASSESABLECALCVCH>
          <ISVATDUTYPAID>Yes</ISVATDUTYPAID>
          <ISDELIVERYSAMEASCONSIGNEE>No</ISDELIVERYSAMEASCONSIGNEE>
          <ISDISPATCHSAMEASCONSIGNOR>No</ISDISPATCHSAMEASCONSIGNOR>
          <ISDELETEDVCHRETAINED>No</ISDELETEDVCHRETAINED>
          <CHANGEVCHMODE>No</CHANGEVCHMODE>
          <RESETIRNQRCODE>No</RESETIRNQRCODE>
          <ALTERID> 2</ALTERID>
          <MASTERID> 2</MASTERID>
          <VOUCHERKEY>190211216637960</VOUCHERKEY>
          <EWAYBILLDETAILS.LIST>      </EWAYBILLDETAILS.LIST>
          <EXCLUDEDTAXATIONS.LIST>      </EXCLUDEDTAXATIONS.LIST>
          <OLDAUDITENTRIES.LIST>      </OLDAUDITENTRIES.LIST>
          <ACCOUNTAUDITENTRIES.LIST>      </ACCOUNTAUDITENTRIES.LIST>
          <AUDITENTRIES.LIST>      </AUDITENTRIES.LIST>
          <DUTYHEADDETAILS.LIST>      </DUTYHEADDETAILS.LIST>
        
          <SUPPLEMENTARYDUTYHEADDETAILS.LIST>      </SUPPLEMENTARYDUTYHEADDETAILS.LIST>
          <EWAYBILLERRORLIST.LIST>      </EWAYBILLERRORLIST.LIST>
          <IRNERRORLIST.LIST>      </IRNERRORLIST.LIST>
          <INVOICEDELNOTES.LIST>      </INVOICEDELNOTES.LIST>
          <INVOICEORDERLIST.LIST>      </INVOICEORDERLIST.LIST>
          <INVOICEINDENTLIST.LIST>      </INVOICEINDENTLIST.LIST>
          <ATTENDANCEENTRIES.LIST>      </ATTENDANCEENTRIES.LIST>
          <ORIGINVOICEDETAILS.LIST>      </ORIGINVOICEDETAILS.LIST>
          <INVOICEEXPORTLIST.LIST>      </INVOICEEXPORTLIST.LIST>
          <LEDGERENTRIES.LIST>
           <OLDAUDITENTRYIDS.LIST TYPE="Number">
            <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
           </OLDAUDITENTRYIDS.LIST>
           <LEDGERNAME>${customer.name}</LEDGERNAME>
           <GSTCLASS/>
           <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
           <LEDGERFROMITEM>No</LEDGERFROMITEM>
           <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
           <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
           <ISLASTDEEMEDPOSITIVE>Yes</ISLASTDEEMEDPOSITIVE>
           <ISCAPVATTAXALTERED>No</ISCAPVATTAXALTERED>
           <ISCAPVATNOTCLAIMED>No</ISCAPVATNOTCLAIMED>
           <AMOUNT>-${Math.round(invoice.total)}</AMOUNT>
           <SERVICETAXDETAILS.LIST>       </SERVICETAXDETAILS.LIST>
           <BANKALLOCATIONS.LIST>       </BANKALLOCATIONS.LIST>
           <BILLALLOCATIONS.LIST>
            <NAME>${invoice.number}</NAME>
            <BILLTYPE>New Ref</BILLTYPE>
            <TDSDEDUCTEEISSPECIALRATE>No</TDSDEDUCTEEISSPECIALRATE>
            <AMOUNT>-${Math.round(invoice.total)}</AMOUNT>
            <INTERESTCOLLECTION.LIST>        </INTERESTCOLLECTION.LIST>
            <STBILLCATEGORIES.LIST>        </STBILLCATEGORIES.LIST>
           </BILLALLOCATIONS.LIST>
           <INTERESTCOLLECTION.LIST>       </INTERESTCOLLECTION.LIST>
           <OLDAUDITENTRIES.LIST>       </OLDAUDITENTRIES.LIST>
           <ACCOUNTAUDITENTRIES.LIST>       </ACCOUNTAUDITENTRIES.LIST>
           <AUDITENTRIES.LIST>       </AUDITENTRIES.LIST>
           <INPUTCRALLOCS.LIST>       </INPUTCRALLOCS.LIST>
           <DUTYHEADDETAILS.LIST>       </DUTYHEADDETAILS.LIST>
           <EXCISEDUTYHEADDETAILS.LIST>       </EXCISEDUTYHEADDETAILS.LIST>
           <RATEDETAILS.LIST>       </RATEDETAILS.LIST>
           <SUMMARYALLOCS.LIST>       </SUMMARYALLOCS.LIST>
           <STPYMTDETAILS.LIST>       </STPYMTDETAILS.LIST>
           <EXCISEPAYMENTALLOCATIONS.LIST>       </EXCISEPAYMENTALLOCATIONS.LIST>
           <TAXBILLALLOCATIONS.LIST>       </TAXBILLALLOCATIONS.LIST>
           <TAXOBJECTALLOCATIONS.LIST>       </TAXOBJECTALLOCATIONS.LIST>
           <TDSEXPENSEALLOCATIONS.LIST>       </TDSEXPENSEALLOCATIONS.LIST>
           <VATSTATUTORYDETAILS.LIST>       </VATSTATUTORYDETAILS.LIST>
           <COSTTRACKALLOCATIONS.LIST>       </COSTTRACKALLOCATIONS.LIST>
           <REFVOUCHERDETAILS.LIST>       </REFVOUCHERDETAILS.LIST>
           <INVOICEWISEDETAILS.LIST>       </INVOICEWISEDETAILS.LIST>
           <VATITCDETAILS.LIST>       </VATITCDETAILS.LIST>
           <ADVANCETAXDETAILS.LIST>       </ADVANCETAXDETAILS.LIST>
          </LEDGERENTRIES.LIST>
          ${taxTemplate}
          ${itemsTemplete}
          <PAYROLLMODEOFPAYMENT.LIST>      </PAYROLLMODEOFPAYMENT.LIST>
          <ATTDRECORDS.LIST>      </ATTDRECORDS.LIST>
          <GSTEWAYCONSIGNORADDRESS.LIST>      </GSTEWAYCONSIGNORADDRESS.LIST>
          <GSTEWAYCONSIGNEEADDRESS.LIST>      </GSTEWAYCONSIGNEEADDRESS.LIST>
          <TEMPGSTRATEDETAILS.LIST>      </TEMPGSTRATEDETAILS.LIST>
         </VOUCHER>
    </TALLYMESSAGE>`;

   }

   const getDate = (date) => {
        var dl = new Date(date);
        dl.setHours(0,0,0,0);
        return new Date(date);
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
   var invoiceEachTemplate = filterdedInvoices.map((ele,index) =>{
     return getEachInvoiceTemplate(ele,index);
   }).join(""); 
    

  var mainBody = `<ENVELOPE>
   <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
   </HEADER>
   <BODY>
    <IMPORTDATA>
     <REQUESTDESC>
      <REPORTNAME>All Masters</REPORTNAME>
      <STATICVARIABLES>
       <SVCURRENTCOMPANY>${companyData.name}</SVCURRENTCOMPANY>
      </STATICVARIABLES>
     </REQUESTDESC>
     <REQUESTDATA>
       ${invoiceEachTemplate}
     </REQUESTDATA>
    </IMPORTDATA>
   </BODY>
   </ENVELOPE>`

   const saveFile = async () => {
     
     if(action == "download"){
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (permissions.granted) {
        const uri = permissions.directoryUri;

        const newFile = await FileSystem.StorageAccessFramework.createFileAsync(
            uri,
            "transactions.xml",
            "xml"
        );
        await FileSystem.writeAsStringAsync(newFile, mainBody, { encoding: FileSystem.EncodingType.UTF8 });

        alert(`Files Downloaded Successfully`);
      }
    }
    else{
      let fileUri = FileSystem.documentDirectory + "transactions.xml";
      await FileSystem.writeAsStringAsync(fileUri, mainBody, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(fileUri)
      .catch((err) => console.log('Sharing::error', err))
    }
      
  }

  await saveFile();
}

export default ExportData;




 //const { status } = await MediaLibrary.requestPermissionsAsync();
   //   if (status === "granted") {
        
     // }

  // FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "invoices", {intermediates : true})
          //let fileUri = FileSystem.documentDirectory + "/invoices/invoices.xml";
          //await FileSystem.writeAsStringAsync(fileUri, mainBody, { encoding: FileSystem.EncodingType.UTF8 });
          //await Sharing.shareAsync(fileUri)
         //.catch((err) => console.log('Sharing::error', err))
         /*MediaLibrary.createAssetAsync(fileUri)
         .then(()=>{

         })
         .catch((error)=>{
            console.log(error)
         })*/

          //await MediaLibrary.createAlbumAsync("DigitalKhatta", asset, false);
          //await MediaLibrary.saveToLibraryAsync(fileUri)
         //const album = await MediaLibrary.getAlbumAsync('Download');
        // if (album == null) {
           // await MediaLibrary.createAlbumAsync('Download', asset, false);
         //} else {
            //await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
         //}
