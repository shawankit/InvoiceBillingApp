import React,{useEffect} from 'react';
import { StyleSheet, Dimensions, View  } from 'react-native';

import PDFReader from 'rn-pdf-reader-js'
import {DeviceEventEmitter} from "react-native"

const PDFScreen = ({navigation,route}) => {
    const source = {uri:route.params.base64,cache:true};
    //const source = require('./test.pdf');  // ios only
    //const source = {uri:'bundle-assets://test.pdf'};

    //const source = {uri:'file:///sdcard/test.pdf'};
    //const source = {uri:"data:application/pdf;base64,JVBERi0xLjcKJc..."};

    useEffect(() => {
        return () => {
            DeviceEventEmitter.removeAllListeners("event.sharePdfEvent");
          };
        }, []);
    
    const base64 = route.params.base64; 
    return (
       
           <PDFReader
            source={{
              base64: "data:application/pdf;base64," + base64,
            }}
          />
     
    )
  
}
export default PDFScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 25,
    },
    pdf: {
        flex:1,
        width:Dimensions.get('window').width,
        height:Dimensions.get('window').height,
    }
});