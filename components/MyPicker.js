import React from 'react';
import {View, Text,FlatList, StyleSheet, ScrollView, TouchableOpacity,Modal,TextInput,SafeAreaView} from 'react-native';

import FontAwesome from 'react-native-vector-icons/FontAwesome';

const MyPicker = ({items, onValueChange,selectedValue,style,placeholder,api,addIcon,addFun}) => {

	
	const [data, setData] = React.useState({
		visible : false,
		searchText : "",
		items : items,
		filterItems : items,
		selectedValue : selectedValue
	});

	React.useEffect(() => {
      setData({...data,selectedValue : selectedValue,items : items});
    },[selectedValue,items]);

	const onSelect = (value)=>{
		onValueChange(value);
		setData({...data,visible : false,selectedValue : value});
	}

	const onTextPress = (value)=>{
		setData({...data,visible : true,searchText : '',filterItems : data.items});
	}

	const textInputChange = (value) => {

		let filterItems = value == "" ? data.items : data.items.filter((val) => val.name.toLowerCase().indexOf(value.toLowerCase()) != -1);

		if(value != ""){
			filterItems.sort((a,b)=>{
				return a.name.toLowerCase().indexOf(value.toLowerCase()) - b.name.toLowerCase().indexOf(value.toLowerCase())
			});
		}
		setData({...data,searchText : value,filterItems : filterItems});
	}

	const itemsMap = data.items.reduce((acc,cur)=> {
		acc[cur.value] = cur;
		return acc;
	},{});

	const renderItem = ({item}) => {
	    return (
	    	<TouchableOpacity onPress={()=> onSelect(item.value)}>
	        	<View style={styles.card}> 
	            	<Text style={styles.cardTitle}>{item.name}</Text>
	        	</View>
	    	</TouchableOpacity>
	    );
	};
	
  return (
  	<View style={{flex : 1}}>
  	  <View style={{flexDirection : "row",justifyContent: 'flex-end'}}>
  		<TouchableOpacity style={[style,{marginTop : 1}]} onPress={()=> onTextPress()}  activeOpacity="0">
  			<View style={{flexDirection : "row",justifyContent: 'flex-end'}}>
  			
  				<Text>{itemsMap[data.selectedValue]? itemsMap[data.selectedValue].name : placeholder}</Text>
  				
  				<View style={{flexDirection : "row",marginLeft:"auto",paddingRight : 10}}>
  					<FontAwesome 
	                	name="caret-down"
	                	color="#05375a"
	                	size={20}
	                	style={{paddingRight : addIcon ? 20 : 0}}
	            	/>
  				</View>
            </View>
  		</TouchableOpacity>
  		{addIcon ?
  			<TouchableOpacity style={[{marginTop : 1,marginLeft:"auto"}]} onPress={() => addFun()}>
	            		<FontAwesome 
	                	name="plus"
	                	color="#05375a"
	                	size={20}
	            	/> 
	         </TouchableOpacity>: null
	    }
  		</View>
  		
	    <Modal
	          transparent={true}
	          visible={data.visible}
	          onRequestClose={() => { setData({...data,visible : false}); } }
	    >
	    	<View style={{backgroundColor : "#000000aa",flex : 1}}>
                <View style={styles.modal}>
                    <SafeAreaView style={[styles.wrapper,data.filterItems.length > 10 ? {paddingBottom:30} : {}]}>
                       <View style={styles.action}>
	                      <TextInput
	                          value={data.searchText}  
		                      placeholder="Search.. "
		                      style={styles.textInput}
		                      autoCapitalize="none"
		                      onChangeText={(val) => textInputChange(val)}
	                      />
	                      <TouchableOpacity style={[{marginTop : 3,paddingRight : 10}]} onPress={()=> setData({...data,visible : false})}>
		                      <FontAwesome 
			                	name="times"
			                	color="#05375a"
			                	size={20}
			            	 />
		            	 </TouchableOpacity>
                      </View>
                      <View>
                        {
                        	data.filterItems.length == 0 ? 
                        	<View style={styles.card}> 
				            	<Text style={styles.cardTitle}>No Item matched</Text>
				        	</View>
                        	:
                        	<FlatList 
				            	data={data.filterItems}
				            	renderItem={renderItem}
				            	keyExtractor={item => item.id.toString()}
				            	style={{marginBottom : 20}}
				        	/>
				        	
                        }
				      </View>
                    </SafeAreaView>
                </View>
            </View>
	    </Modal>
    </View>
  );
};

export default MyPicker;

const styles = StyleSheet.create({
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
	modal : {
       backgroundColor : "#fff",
       marginTop : 40,
       marginHorizontal : 10,
    },
    textInput: {
       	flex: 1,
    	paddingLeft: 5,
    	color: '#05375a',
    },
    action: {
        flexDirection: 'row',
        marginTop: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        paddingBottom: 5,
        paddingTop : 10,
    },
    wrapper : {
      maxHeight : 450,
      paddingLeft : 20,
    },
});

