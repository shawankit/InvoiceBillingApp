import React from 'react';
import axios from 'axios';
import{ AuthContext } from '../components/context';

 const serviceTaskId = "375438";   
 const REST_API_SERVER = "http://192.168.150.1/rest?s=true";
 const api_token = "8f465e36-a788-40a5-9ff9-ef840e96c2a9";

function postRequest(operation,arg,successFunction,failureFunction,ticket){

	const fullUrl = REST_API_SERVER  + "&o=" + operation + "&locale=en_US" + ((ticket != undefined) ? "&ticket=" + ticket : "");

	console.log(fullUrl);
	axios(fullUrl, {
	  method: 'POST',
	  headers: {
	    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
	  },
	  dataType : "json",
	  data: new URLSearchParams({
        'a': JSON.stringify(arg),
      }),
	  crossDomain: true,
	})
	.then(response => {successFunction(response.data);})
  	.catch(error => {console.log(error);failureFunction(error);});
}


function processData(id,parameters,successFunction,failureFunction){
	postRequest("gdtu",[id,api_token,parameters],successFunction,failureFunction);
}
 

function getData(name,projection,successFunction,failureFunction,ticket){
	postRequest("gma",[name, api_token, null, null, null, null, projection, false],successFunction,failureFunction,ticket);
}

function update(id,data,ticket,successFunction,failureFunction){
	postRequest("ia",[id,'update',data, null],successFunction,failureFunction,ticket);
}

const Services = {
	login : function(idType,userLogin,password,successFunction,failureFunction){
		processData("375444",{idType,userLogin,password},successFunction,failureFunction);
	},
	executeService : function(serviceId,successFunction,failureFunction){
		processData(serviceTaskId,{serviceId},successFunction,failureFunction);
	},
	executeParameterizedService : function(serviceId,parameter,successFunction,failureFunction){
		processData(serviceTaskId,{...parameter,serviceId},successFunction,failureFunction);
	},
	create : function(id,data,idfields,ticket,successFunction,failureFunction){
		postRequest("sp",[id,data,idfields],successFunction,failureFunction,ticket);
	},
	get : function(name,ticket,successFunction,failureFunction){
		getData(name,["Data"],successFunction,failureFunction,ticket);
	},
	save : function(id,data,ticket,successFunction,failureFunction){
		update(id,data,ticket,successFunction,failureFunction);
	},
	getWithProjection : function(name,ticket,successFunction,failureFunction){
		getData(name,["Data"],successFunction,failureFunction,ticket);
	},
	logout : function(ticket,successFunction,failureFunction){
		postRequest("logout",null,successFunction,failureFunction,ticket);
	}
};

export default Services;
