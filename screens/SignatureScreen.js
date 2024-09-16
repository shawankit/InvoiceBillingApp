import React , {useRef,useEffect,useState} from 'react';
import { StyleSheet, Dimensions, View ,Image ,Text , Button} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import SignatureScreen from "react-native-signature-canvas";
import * as ImagePicker from 'expo-image-picker';

const {height} = Dimensions.get("screen");
const style = `
              body,html {height: ${height - 550}px;}`;

const SignatureScreen1 = ({navigation,route}) => {
    const ref = useRef();

    const [signature,setSignature] = useState(null);

    useEffect(() => {
 
         (async ()=>{
             const signature = await AsyncStorage.getItem("signatures");
 
             if(signature != null){
                setSignature(signature);
             }

             const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
             if (status !== 'granted') {
               alert('Sorry, we need camera roll permissions to make this work!');
             }
         })();
 
     },[]);

     const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3],
          quality:1,
        });
    
        console.log(result);
    
        if (!result.cancelled) {
         
          const base64 = await FileSystem.readAsStringAsync(result.uri, { encoding: 'base64' });
          setSignature("data:image/"+result.uri.split('.').pop().trim()+";base64,"+base64);
        }
      };

    // Called after ref.current.readSignature() reads a non-empty base64 string
    const handleOK = (signature) => {
        //console.log(signature);
        //onOK(signature); // Callback from Component props
        setSignature(signature);
    };

    // Called after ref.current.readSignature() reads an empty string
    const handleEmpty = () => {
        console.log("Empty");
    };

    // Called after ref.current.clearSignature()
    const handleClear = () => {
        //console.log("clear success!");
        //setSignature(null);
    };

    // Called after end of stroke
    const handleEnd = () => {
        ref.current.readSignature();
    };

    // Called after ref.current.getData()
    const handleData = (data) => {
        //console.log(data);

        AsyncStorage.setItem("signatures",signature);

        alert("Signature is saved successfully");

        navigation.goBack();
    };

    return (
        <View style={{ flex: 1 }}>
           
            <View style={styles.header}>
                    <Text style={styles.text_header}>Signature Preview</Text>
            </View>
            <View style={styles.preview}>
                {signature ? (
                <Image
                    resizeMode={"contain"}
                    style={{ width: 335, height: 114 }}
                    source={{ uri: signature }}
                />
                ) : null}
        </View>
        <View style={styles.header,{marginHorizontal : 20,paddingVertical : 20}}>
        <Text style={styles.text_header}>Signature Board</Text>
        </View>
            <SignatureScreen
            ref={ref}
            onEnd={handleEnd}
            onOK={handleOK}
            onEmpty={handleEmpty}
            onClear={handleClear}
            onGetData={handleData}
            autoClear={false}
            webStyle ={style}
            clearText="Clear"
            confirmText="Save"
            descriptionText={"Add Your Signature Above"}
        />
        <View style={{marginHorizontal : 20,paddingVertical : 20}}>
                <Button title="Pick an image for Signature" style={{margin:20,padding:20}} onPress={pickImage} />
        </View>
        </View>
    );

}
export default SignatureScreen1;

const styles = StyleSheet.create({
    preview: {
        height: 114,
        backgroundColor: "#F8F8F8",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 15,
      },
      previewText: {
        color: "#FFF",
        fontSize: 14,
        height: 40,
        lineHeight: 40,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: "#69B2FF",
        width: 120,
        textAlign: "center",
        marginTop: 10,
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
            fontSize: 17.5
        },
        text_footer: {
            color: '#05375a',
            fontSize: 18
        },
});