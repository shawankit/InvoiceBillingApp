import React from 'react';
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
    Alert } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Google from 'expo-google-app-auth';
import * as GoogleSignIn from 'expo-google-sign-in';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import Spinner from 'react-native-loading-spinner-overlay';

import {
  GDrive,
  MimeTypes
} from "@robinbobin/react-native-google-drive-api-wrapper";

import Constants from 'expo-constants';
const isInExpo = Constants.appOwnership === 'expo';


const BackupScreen = () => {
    const [bData,setBData] = React.useState({
      date : "NA",
      size : "NA",
      account : "NA",
      id : "",
      spinner : false
    });


    React.useEffect(() => {
        (async()=>{ 
          const driveData = await  AsyncStorage.getItem('driveData');
          let account = await  AsyncStorage.getItem('email');

          const googleData = await AsyncStorage.getItem('googleData');
          if(googleData){
            account = JSON.parse(googleData).user.email;
          }
          
          let driveDataList;
          if(!driveData){
            driveDataList = [];
            driveDataList = await getBackupInfo();
             if(driveDataList.length > 0){
              const {date,size,fileId} = driveDataList[driveDataList.length - 1];
              setBData({...bData,date,account,size,id : fileId})
            }
           
          }
          else{
            driveDataList = JSON.parse(driveData);
             if(driveDataList.length > 0){
               const {date,size,id} = driveDataList[driveDataList.length - 1];
               setBData({...bData,date,account,size,id})
             }
          }

        })();
    },[]);
    const getAllData = async() => {
       const cString = await AsyncStorage.getItem("companyData");
       const companyData = cString ? JSON.parse(cString) : {};
       
       const insString = await AsyncStorage.getItem("insetlist");
       const insetlist = insString ? JSON.parse(insString) : {};

       const cusString = await AsyncStorage.getItem("customers");
       const customers = cusString ? JSON.parse(cusString) : {};

       const itemsString = await AsyncStorage.getItem("items");
       const items = itemsString ? JSON.parse(itemsString) : {};

       const lString = await AsyncStorage.getItem("ledgers");
       const ledgers = lString ? JSON.parse(lString) : {};

       const inString = await AsyncStorage.getItem("invoices");
       const invoices = inString ? JSON.parse(inString) : {};

      return [companyData,insetlist,customers,items,ledgers,invoices]
    }

     const setAllData = async(data) => {
       const allData = JSON.parse(data);
       await AsyncStorage.setItem("companyData",JSON.stringify(allData[0]))
       await AsyncStorage.setItem("insetlist",JSON.stringify(allData[1]))
       await AsyncStorage.setItem("customers",JSON.stringify(allData[2]))
       await AsyncStorage.setItem("items",JSON.stringify(allData[3]))
       await AsyncStorage.setItem("ledgers",JSON.stringify(allData[4]))
       await AsyncStorage.setItem("invoices",JSON.stringify(allData[5]))
    }
    
    const backup = async() => {
      setBData({...bData,spinner : true});
      const gdrive = new GDrive();
      gdrive.accessToken = JSON.parse(await  AsyncStorage.getItem('googleData')).accessToken;
     
      const exe = async() => {
          const allData = await getAllData();
          
          

          const id = (await gdrive.files.newMultipartUploader()
            .setData(JSON.stringify(allData), MimeTypes.TEXT)
            .setRequestBody({
              name: "DigitalKhattaBackup.txt"
            })
            .execute()
          ).id;

          const driveData = await  AsyncStorage.getItem('driveData');

          let driveDataList;
          if(!driveData){
            driveDataList = [];
          }
          else{
            driveDataList = JSON.parse(driveData);
          }
          const date = new Date().getTime();
          const size = encodeURI(JSON.stringify(allData)).split(/%..|./).length - 1;
          driveDataList.push({id,date,size});
          AsyncStorage.setItem("driveData",JSON.stringify(driveDataList));

          

          const account = JSON.parse(await  AsyncStorage.getItem('googleData')).user.email;
          setBData({...bData,size,date,account});

          postBackupInfo(size,date,account,id);
          setBData({...bData,spinner : false});

          alert("Backup Taken Successfully");
      }

     gdrive.files.list().then((list)=>{
        exe();
      })
      .catch((errr)=>{
          setBData({...bData,spinner : false});
          if(errr.json && errr.json.error && errr.json.error.code == 401){
             (async()=>{
               await signInWithGoogle();
               await backup();
             })()
          }
      })
    }

    const postBackupInfo = async(size,date,account,id)=>{
       const email = await AsyncStorage.getItem('email');
       fetch('http://zetaweb.in/backup.php?email='+email+'&backup_email='+account+'&date='+date+'&size='+size+'&fileId='+id+'&flag=NOT',{
            method: 'POST',
        })
          .then(response => response.json())
          .then(data => {
               console.log("Back up Data Saved");
           }).
          catch(errorMsg => {console.log(errorMsg);});

    }

    const signInWithGoogle = async() => {
      setBData({...bData,spinner : true});
      let authUser;
      if(isInExpo){
          authUser = await Google.logInAsync({
            androidClientId: `588319098877-fldb1g4id65a8q8pj755h7ij0000tqvf.apps.googleusercontent.com`,
             scopes: ['https://www.googleapis.com/auth/drive.readonly',"https://www.googleapis.com/auth/drive.file"]
          });
      }
      else{
          authUser = await Google.logInAsync({
            androidClientId: `588319098877-ivr0kg1ufk2dpiqoseqddtifplveu8iv.apps.googleusercontent.com`,
            androidStandaloneAppClientId : `588319098877-ivr0kg1ufk2dpiqoseqddtifplveu8iv.apps.googleusercontent.com`,
            redirectUrl : "com.digitalkhata.digitalkhata:/oauth2redirect/google",
            scopes: ['https://www.googleapis.com/auth/drive.readonly',"https://www.googleapis.com/auth/drive.file"]
          });
      }
      if(authUser.type == "success"){
         AsyncStorage.setItem('googleData', JSON.stringify(authUser));
      }
       setBData({...bData,spinner : false});
    }

    const getBackupInfo = async()=>{
       const email = await AsyncStorage.getItem('email');
       return new Promise(resolve => {
         fetch('http://zetaweb.in/backup.php?email='+email+'&flag=YES',{
            method: 'POST',
        })
          .then(response => response.json())
          .then(data => {
              resolve(data);
           }).
          catch(errorMsg => {console.log(errorMsg);resolve([]);});
      });

    }

    const checkUserData = async() => {
       
       const googleData = await AsyncStorage.getItem('googleData');
       
       if(!googleData){
         await signInWithGoogle();
         checkUserData();
       }
       else{
         
         backup();
       }
      
    }

    const printDriveData = async()=>{
      const driveData = await  AsyncStorage.getItem('driveData');
      console.log( JSON.parse(driveData));
    }

    const restore = async()=>{
      setBData({...bData,spinner : true});
      const gdrive = new GDrive();

      const googleData = await  AsyncStorage.getItem('googleData');
      if(googleData){
        
        gdrive.accessToken = JSON.parse(await AsyncStorage.getItem('googleData')).accessToken;

        gdrive.files.getText(bData.id).then((text)=>{

          setAllData(text);
          
          setBData({...bData,spinner : false});

          alert("Data restored Successfully");
        })
        .catch((erre)=>{
          
          console.log(erre.json);
          setBData({...bData,spinner : false});

          if(erre.json && erre.json.error && erre.json.error.code == 401){
             singInAndRestore();
          }
          if(erre.json && erre.json.error && erre.json.error.code == 400){
            alert("Something went wrong.");
            /*gdrive.files.list().then((text)=>{ 
              //console.log(text.files);
              text.files.forEach((ele)=>{
                console.log(ele.id,bData.id);
              })
            })*/
          }
        });
      }
      else{
        setBData({...bData,spinner : false});

        singInAndRestore();
      }
    }

    const singInAndRestore = async() => {
      await signInWithGoogle();
      
      restore();
    }

    return (
      <View style={styles.container}>
      <Spinner
              visible={bData.spinner}
              textContent={'Loading...'}
              textStyle={{color: '#FFF'}}
            />
       <View style={styles.wrapper}>
           <View style={{flexDirection : 'row'}}>
              <View style={{flex:.5}}>
                 <FontAwesome               
                      name="cloud-upload"
                      color="#05375a"
                      size={40}
                   />
              </View>
              <View style={{flex:2}}>
                 <View style={styles.header}>
                  <Text style={styles.text_header}>Last Backup</Text>
                </View>
                <View style={styles.header}>
                  <Text style={styles.textSign}>Back up your Data to Google Drive. You can restore them when you reinstall Financial Khata.</Text>
                </View>

                <View style={styles.header}>
                  <Text style={styles.textSign}>Google Drive - {bData.date != "NA" ? moment(parseInt(bData.date)).format("DD/MM/YYYY hh:mm") : bData.date}</Text>
                </View>
                <View style={styles.header}>
                  <Text style={styles.textSign}>Size - { bData.size == "NA" ? bData.size : Math.round(bData.size / 1024) + "KB"} </Text>
                </View>

                <View style={styles.buttonWrapper}>
                     <Button
                      title="Back Up"
                      onPress={() => checkUserData()}
                      style={{flex:1}}
                    />
                 </View>
                </View>
           </View>
           <View style={{flexDirection : 'row',marginTop : 25}}>
             <View style={{flex:.5}}>
                 <MaterialCommunityIcons               
                      name="google-drive"
                      color="#05375a"
                      size={40}
                   />
              </View>
              <View style={{flex:2}}>
                 <View style={styles.header}>
                  <Text style={styles.text_header}>Google Drive Settings</Text>
                </View>
                <View style={styles.header}>
                  <Text style={styles.textLarge}>Google Accounts</Text>
                </View>
                <View style={styles.header}>
                  <Text style={styles.textSign}>{bData.account}</Text>
                </View>
              </View>
           </View>
           {
             bData.id != "" ?
             <View style={{flexDirection : 'row',marginTop : 25}}>
             <View style={{flex:.5}}>
                 <MaterialCommunityIcons               
                      name="file-restore"
                      color="#05375a"
                      size={40}
                   />
              </View>
              <View style={{flex:2}}>
                 <View style={styles.header}>
                  <Text style={styles.text_header}>Restore</Text>
                </View>
                <View style={styles.header}>
                  <Text style={styles.textLarge}>Restore Latest Backup From Google Drive</Text>
                </View>
                  <View style={styles.buttonWrapper}>
                     <Button
                      title="Restore"
                      onPress={() => restore()}
                      style={{flex:1}}
                    />
                 </View>
             </View>
           </View>
              : null
           }
         </View>  
     </View>
    );
};

export default BackupScreen;

const styles = StyleSheet.create({
  container: {
      flex: 1,
    },
    wrapper : {
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    header: {
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
    signIn: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10
    },
    textSign: {
        fontSize: 15,
        color: '#05375a',
    },
    textLarge : {
      fontSize: 15,
      fontWeight: 'bold',
        color: '#05375a',
    },
    box : { 
      borderWidth: 1,
      borderColor : "#ccc",
      marginTop:10,
      borderRadius : 8
    },
    buttonWrapper : {
      margin : 10,
      flexDirection:"row"
    }
  });
