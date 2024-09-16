import React,{ useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useTheme} from '@react-navigation/native';

import Swiper from 'react-native-swiper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ExportData from '../components/ExportData';


const HomeScreen = ({navigation}) => {
  const theme = useTheme();

  const [data,setData] =  React.useState({
    message : [],
    isLedger : false,
    isInSet : false,
    isBoth : false 
  })

  useEffect(() => {
      (async() => {
            
            const message = [];
            let isLedger = false,isBoth = false;
            const cData = await AsyncStorage.getItem("companyData");
            if(!cData){
                message.push("Company Details");
            }
            else{
              const nature = JSON.parse(cData).nature;
              if(nature == "Service" || nature == "Transporter"){
                isLedger = true;
              }
              if(nature == "Trading and Service"){
                isBoth = true;
              }
            }

            let isInSet = true;
            let insString = await AsyncStorage.getItem('insetlist');
            if(!insString){
                message.push("Invoice Settings");
                isInSet = false;
            }

            let cString = await AsyncStorage.getItem("customers");
            if(!cString){
               message.push("Customers");
            }

           let iString = await AsyncStorage.getItem(isLedger ? "ledgers" :"items");
            if(!iString){
                message.push(isLedger ? "Ledgers" : "Items");
            }
              
           setData({...data,message,isLedger,isInSet,isBoth});
        })();
    });

   const backup = () => {

     ExportData().then(()=>{

     })
   }
  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      <View style={styles.sliderContainer}>
        <Swiper
          autoplay
          horizontal={false}
          height={200}
          activeDotColor="#FF6347">
          <View style={styles.slide}>
            <Image
              source={require('../assets/banners/gstblog2.jpg')}
              resizeMode="cover"
              style={styles.sliderImage}
            />
          </View>
          <View style={styles.slide}>
            <Image
              source={require('../assets/banners/invoice2.png')}
              resizeMode="cover"
              style={styles.sliderImage}
            />
          </View>
          <View style={styles.slide}>
            <Image
              source={require('../assets/banners/accounting-v6.png')}
              resizeMode="cover"
              style={styles.sliderImage}
            />
          </View>
        </Swiper>
      </View>

      <View style={styles.categoryContainer}>
        <TouchableOpacity
          style={styles.categoryBtn}
          onPress={() =>
            navigation.navigate('CompanyScreen', {title: 'Company Details'})
          }>
          <View style={styles.categoryIcon}>
            <FontAwesome name="building" size={35} color="#009387" />
          </View>
          <Text style={styles.categoryBtnTxt}>Company</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.categoryBtn}
          onPress={() =>
            navigation.navigate('ListScreen', {title: 'Customers'})
          }>
          <View style={styles.categoryIcon}>
            <FontAwesome
              name="users"
              size={35}
              color="#009387"
            />
          </View>
          <Text style={styles.categoryBtnTxt}>Customers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryBtn} onPress={() => {
          navigation.navigate('ListScreen', {title: data.isLedger ? 'Ledgers' : 'Items'})
        }}>
          <View style={styles.categoryIcon}>
            <Fontisto name="nav-icon-list" size={35} color="#009387" />
          </View>
          <Text style={styles.categoryBtnTxt}>{data.isLedger ? 'Ledgers' : 'Items'}</Text>
        </TouchableOpacity>

        
       
      </View>
      <View style={[styles.categoryContainer, {marginTop: 10}]}>
        <TouchableOpacity style={styles.categoryBtn} onPress={() => {
           data.isInSet ? navigation.navigate('ListScreen', {title: 'Invoice Settings'}) : navigation.navigate('InvoiceSettings', {title: 'Add Invoice Setting'})
        }}>
          <View style={styles.categoryIcon}>
            <MaterialCommunityIcons name="card-bulleted-settings-outline" size={35} color="#009387" />
          </View>
          <Text style={styles.categoryBtnTxt}>Invoice Setting</Text>
        </TouchableOpacity>
         <TouchableOpacity style={styles.categoryBtn} onPress={() => {
           navigation.navigate('ListScreen', {title: 'Invoices' , validation : data.message.length > 0 ? true : false,messages : data.message})
        }}>
          <View style={styles.categoryIcon}>
            <MaterialCommunityIcons name="file-pdf" size={35} color="#009387" />
          </View>
          <Text style={styles.categoryBtnTxt}>Invoices</Text>
        </TouchableOpacity>
        {data.isBoth ?
          <TouchableOpacity style={styles.categoryBtn} onPress={() => {
            navigation.navigate('ListScreen', {title: 'Ledgers'})
         }}>
           <View style={styles.categoryIcon}>
             <Fontisto name="gg" size={35} color="#009387" />
           </View>
           <Text style={styles.categoryBtnTxt}>Ledgers</Text>
         </TouchableOpacity>
         :
        <TouchableOpacity style={styles.categoryBtn} onPress={() => {
          navigation.navigate('ExportScreen', {title: 'Expoort Data'})
        }}>
          <View style={styles.categoryIcon}>
            <MaterialCommunityIcons name="export" size={35} color="#009387" />
          </View>
          <Text style={styles.categoryBtnTxt}>Export</Text>
        </TouchableOpacity>}
      </View>
      <View style={[styles.categoryContainer, {marginTop: 10}]}>
      {
        data.isBoth ? 
       
         <TouchableOpacity style={styles.categoryBtn} onPress={() => {
          navigation.navigate('ExportScreen', {title: 'Expoort Data'})
        }}>
          <View style={styles.categoryIcon}>
            <MaterialCommunityIcons name="export" size={35} color="#009387" />
          </View>
          <Text style={styles.categoryBtnTxt}>Export</Text>
        </TouchableOpacity>
       : null
      }

        <TouchableOpacity style={styles.categoryBtn} onPress={() => {
          navigation.navigate('ReportScreen', {title: 'Sales Report'})
        }}>
          <View style={styles.categoryIcon}>
            <MaterialCommunityIcons name="file-pdf-outline" size={35} color="#009387" />
          </View>
          <Text style={styles.categoryBtnTxt}>Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryBtn} onPress={() => {
           navigation.navigate('ListScreen', {title: 'Receipts'})
        }}>
          <View style={styles.categoryIcon}>
            <MaterialCommunityIcons name="select-inverse" size={35} color="#009387" />
          </View>
          <Text style={styles.categoryBtnTxt}>Receipt</Text>
        </TouchableOpacity>

        </View>
        <View style={[styles.categoryContainer, {marginTop: 10}]}>

            <TouchableOpacity style={styles.categoryBtn} onPress={() => {
              navigation.navigate('ListScreen', {title: 'Purchases'})
            }}>
              <View style={styles.categoryIcon}>
                <MaterialCommunityIcons name="soldering-iron" size={35} color="#009387" />
              </View>
              <Text style={styles.categoryBtnTxt}>Suppliers</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryBtn} onPress={() => {
              navigation.navigate('ListScreen', {title: 'Suppliers'})
            }}>
              <View style={styles.categoryIcon}>
                <MaterialCommunityIcons name="size-s" size={35} color="#009387" />
              </View>
              <Text style={styles.categoryBtnTxt}>Purchases</Text>
            </TouchableOpacity>

        </View>
      
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sliderContainer: {
    height: 200,
    width: '90%',
    marginTop: 10,
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 8,
  },

  wrapper: {},

  slide: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  sliderImage: {
    height: '100%',
    width: '100%',
    alignSelf: 'center',
    borderRadius: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    marginTop: 25,
    marginBottom: 10,
  },
  categoryBtn: {
    flex: 1,
    width: '30%',
    marginHorizontal: 0,
    alignSelf: 'center',
  },
  categoryIcon: {
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: 70,
    height: 70,
    backgroundColor: '#c7e0de' /* '#FF6347' */,
    borderRadius: 50,
  },
  categoryBtnTxt: {
    alignSelf: 'center',
    marginTop: 5,
    color: '#009387',
  },
  cardsWrapper: {
    marginTop: 20,
    width: '90%',
    alignSelf: 'center',
  },
  card: {
    height: 100,
    marginVertical: 10,
    flexDirection: 'row',
    shadowColor: '#999',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  cardImgWrapper: {
    flex: 1,
  },
  cardImg: {
    height: '100%',
    width: '100%',
    alignSelf: 'center',
    borderRadius: 8,
    borderBottomRightRadius: 0,
    borderTopRightRadius: 0,
  },
  cardInfo: {
    flex: 2,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderBottomRightRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: '#fff',
  },
  cardTitle: {
    fontWeight: 'bold',
  },
  cardDetails: {
    fontSize: 12,
    color: '#444',
  },
});
