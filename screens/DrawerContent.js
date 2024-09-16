import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
    useTheme,
    Avatar,
    Title,
    Caption,
    Paragraph,
    Drawer,
    Text,
    TouchableRipple,
    Switch
} from 'react-native-paper';
import {
    DrawerContentScrollView,
    DrawerItem
} from '@react-navigation/drawer';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { AuthContext } from '../components/context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

export function DrawerContent(props) {

    const paperTheme = useTheme();

    const { signOut, toggleTheme } = React.useContext(AuthContext);

    const [value, setValue] = React.useState({
        name : "",
        email : "",
        isInSet : false,
    });

    React.useEffect(()=>{
         (async() => {
         const name = await AsyncStorage.getItem('userName');
         const email = await AsyncStorage.getItem('email');
         
         let isInSet = true;
         let insString = await AsyncStorage.getItem('insetlist');
         if(!insString){
             //message.push("Invoice Settings");
             isInSet = false;
         }

         setValue({name,email,isInSet});
         })();
    });

    return(
        <View style={{flex:1}}>
            <DrawerContentScrollView {...props}>
                <View style={styles.drawerContent}>
                    <View style={styles.userInfoSection}>
                        <View style={{flexDirection:'row',marginTop: 15}}>
                             <FontAwesome style={{marginTop : 10}}
                                  name="user-circle-o"
                                  color="#05375a"
                                  size={40}
                              />
                            <View style={{marginLeft:15, flexDirection:'column'}}>
                                <Title style={styles.title}>{value.name}</Title>
                                <Caption style={styles.caption}>{value.email}</Caption>
                            </View>
                        </View>
                    </View>

                    <Drawer.Section style={styles.drawerSection}>
                        <DrawerItem 
                            icon={({color, size}) => (
                                <Icon 
                                name="home-outline" 
                                color={color}
                                size={size}
                                />
                            )}
                            label="Home"
                            onPress={() => {props.navigation.navigate('Home')}}
                        />
                        <DrawerItem 
                            icon={({color, size}) => (
                                <FontAwesome 
                                name="gear" 
                                color={color}
                                size={size}
                                />
                            )}
                            label="Invoice Settings"
                            onPress={() => { value.isInSet ? props.navigation.navigate('ListScreen', {title: 'Invoice Settings'}) : navigation.navigate('InvoiceSettings', {title: 'Add Invoice Setting'})}}
                        />
                         <DrawerItem 
                            icon={({color, size}) => (
                                <FontAwesome5 
                                name="signature" 
                                color={color}
                                size={size}
                                />
                            )}
                            label="Signature"
                            onPress={() => {props.navigation.navigate('SignatureScreen', {title: 'Signature'})}}
                        />
                         <DrawerItem 
                            icon={({color, size}) => (
                                <FontAwesome 
                                name="cloud-upload" 
                                color={color}
                                size={size}
                                />
                            )}
                            label="Backup"
                            onPress={() => {props.navigation.navigate('BackupScreen', {title: 'Backup Your Data'})}}
                        />
                    </Drawer.Section>
                </View>
            </DrawerContentScrollView>
            <Drawer.Section style={styles.bottomDrawerSection}>
                <DrawerItem 
                    icon={({color, size}) => (
                        <Icon 
                        name="exit-to-app" 
                        color={color}
                        size={size}
                        />
                    )}
                    label="Sign Out"
                    onPress={() => {signOut()}}
                />
            </Drawer.Section>
        </View>
    );
}

const styles = StyleSheet.create({
    drawerContent: {
      flex: 1,
    },
    userInfoSection: {
      paddingLeft: 20,
    },
    title: {
      fontSize: 16,
      marginTop: 3,
      fontWeight: 'bold',
    },
    caption: {
      fontSize: 14,
      lineHeight: 14,
    },
    row: {
      marginTop: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    section: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 15,
    },
    paragraph: {
      fontWeight: 'bold',
      marginRight: 3,
    },
    drawerSection: {
      marginTop: 15,
    },
    bottomDrawerSection: {
        marginBottom: 15,
        borderTopColor: '#f4f4f4',
        borderTopWidth: 1
    },
    preference: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
  });
