import React, { useEffect } from 'react';
import { 
    View, 
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
    FlatList,
    SafeAreaView
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {LinearGradient} from 'expo-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from 'react-native-paper';

import { AuthContext } from '../components/context';
import AsyncStorage from '@react-native-async-storage/async-storage';


const SearchScreen = ({navigation,route}) => {

    const list = route.params.list;
    
    const [filteredList, setFilteredList] = React.useState(list);

    const [value, setValue] = React.useState("");

    const onSelect = (val) => {

       navigation.navigate(route.params.previousScreen, {
           title: route.params.previousTitle,
           itemData : route.params.pItemData,
           searchValue : val,
           prop : route.params.prop
         })
    }

    const renderItem = ({item}) => {
        return (
            <TouchableOpacity style={styles.action}onPress={()=> onSelect(item.value)}>
                <View style={styles.card}> 
                    <Text style={styles.cardTitle}>{item.name}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const textInputChange = (val) => {

        let filteredList = value == "" ? list : list.filter((val) => val.name.toLowerCase().indexOf(value.toLowerCase()) != -1);

        if(value != ""){
            filteredList.sort((a,b)=>{
                return a.name.toLowerCase().indexOf(value.toLowerCase()) - b.name.toLowerCase().indexOf(value.toLowerCase())
            });
        }
        setValue(val);
        setFilteredList(filteredList);
    }


    return (
        <View style={styles.container}>
         <SafeAreaView style={[styles.wrapper]}>
             <View style={styles.action}>
                 <FontAwesome 
                    name="search"
                    color="#05375a"
                    size={20}
                /> 
                 
                <TextInput
                    value={value}  
                    placeholder="Search.."
                    style={styles.textInput}
                    autoCapitalize="none"
                    onChangeText={(val) => textInputChange(val)}
                />
            </View>
             <View>
                {
                    filteredList.length == 0 ? 
                    <View style={styles.card}> 
                        <Text style={styles.cardTitle}>No Item matched</Text>
                    </View>
                    :
                    <FlatList 
                        data={filteredList}
                        renderItem={renderItem}
                        keyExtractor={item => item.id.toString()}
                        style={{marginBottom : 20}}
                    />
                    
                }
              </View>
             </SafeAreaView>
       </View>
    )

}


export default SearchScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    wrapper : {
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    iwrapper : {
      paddingHorizontal: 20,
      paddingVertical: 10
    },
    header: {
        flex: 1,
        justifyContent: 'flex-end',
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
        fontSize: 17.5
    },
    text_footer: {
        color: '#05375a',
        fontSize: 18
    },
    action: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        paddingBottom: 5,
        marginBottom: 25,
    },
    actionError: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#FF0000',
        paddingBottom: 5
    },
    textInput: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 0 : -12,
        paddingLeft: 10,
        color: '#05375a',
    },
    errorMsg: {
        color: '#FF0000',
        fontSize: 14,
    },
    button: {
        alignItems: 'center',
        paddingTop: 10,
        marginBottom : 20
    },
    signIn: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10
    },
    textSign: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    card: {
        marginVertical: 10,
        flexDirection: 'row',
        shadowColor: '#999',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    cardTitle: {
        fontWeight: 'bold',
    },
  });
