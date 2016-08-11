import fs from 'fs';
import fetch from 'node-fetch';
import formData from 'form-data';
import config from '../../server/config';


class live {

    constructor(options){

    }

    sendMessage(options, callback){

        callback = callback || function(){};
        let form = new formData();
        for(name in options){
            form.append(name, options[name]);
        }
        fetch(config.FRONTEND_HOST, { method: 'POST', body: form })
        .then(function(res) {
            return res.json();
        }).then(function(json) {
            if(json.hasOwnProperty("code") && json.code==1){
                callback(null, json.message, json.result)
            }else{
                callback(true, json.message, null)
            }
        });
    }
 
}


module.exports = new live()
