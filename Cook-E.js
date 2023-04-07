var mqtt;
var reconnectTimeout = 2000;
var host="broker.mqttdashboard.com";
var port=8000;

var jeSuisCuit = false;
        function onFailure(message) {
			console.log("Connection Attempt to Host "+host+"Failed");
			setTimeout(MQTTconnect, reconnectTimeout);
        }
		function onMessageArrived(msg){
			out_msg="Message received "+msg.payloadString+"<br>";
			out_msg=out_msg+"Message received Topic "+msg.destinationName;
			console.log(out_msg);

            if(msg.destinationName=="isen03/temp"){
                 try {
                //On a besoin de "value" au lieu de 'value' ...
                var recupJson = JSON.parse(msg.payloadString.replace(/'/g, "\""));
                var text = document.getElementById("My_Temp");
                text.innerHTML = "("+recupJson["value"]+"°)";
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                }
            }
            else if(msg.destinationName=="isen03/button"){
                var recupJson = JSON.parse(msg.payloadString.replace(/'/g, "\""));
                if(recupJson["id"]==1){
                    
                }else{

                }
            }

            
		}
	 	function onConnect() {
            console.log("Connected ");
            //mqtt.subscribe("isen03/led");
            mqtt.subscribe("isen03/temp");
            mqtt.subscribe("isen03/button");
            var stringMessage = "{\"request\": 1}";
            message = new Paho.MQTT.Message(stringMessage.toString());
            message.destinationName = "isen03/getTemp";
            message.retained=true;
            mqtt.send(message);

            mySprite("-");

	  }
	  function MQTTconnect() {
		console.log("connecting to "+ host +" "+ port);
			var x=Math.floor(Math.random() * 10000); 
		var cname="orderform-"+x;
		mqtt = new Paho.MQTT.Client(host,port,cname);
		//document.write("connecting to "+ host);
		var options = {
			timeout: 3,
			onSuccess: onConnect,
			onFailure: onFailure,
			 };
         mqtt.onMessageArrived = onMessageArrived
		 mqtt.connect(options); //connect
		}

        function myCooking(nom){
            //mqtt.subscribe("isen03/led");
            jeSuisCuit = false;
            var limit=100;
            var time=100;
            var previousTmp = document.getElementById("My_Temp");
            var maTemperature = previousTmp.innerHTML;
            var stringMessage = "";
            var message = new Paho.MQTT.Message(stringMessage.toString());
            var monIndice = 0;

            var listePlat = [
                ["oeufDur",70,12000],
                ["oeufCoque",70,8000],
                ["steak",71,15000],
                ["saumon",54,20000],
                ["cookie",180,10000],
                ["macaron",160,10000],
                ["pizzaDeLaMama",200,10000],
                ["patate",100,10000]
            ];

            for(let i = 0; i < listePlat.length; i++){
                if(listePlat[i][0]==nom){
                    monIndice = i;
                }
            }

            limit = listePlat[monIndice][1];
            time = listePlat[monIndice][2];

            var docIdCuissonT = document.getElementById("Tcuissons");
            var tempsCuisson = document.getElementById("tps");
            tempsCuisson.innerHTML = "-"+(time/1000)+"s-";
            
            var maCuissonTemperature = parseInt(maTemperature[1]+maTemperature[2])+45;
            docIdCuissonT.innerHTML = "["+maCuissonTemperature+"°]";

            

            //On donne les chiffre (XY°C) donc X position [1] et Y [2]
            if(maCuissonTemperature==limit){
                //On eteint la led rouge
                stringMessage = "{\"id\": 3,\"state\": 0}";
                message = new Paho.MQTT.Message(stringMessage.toString());
                message.destinationName = "isen03/led";
                message.retained=true;
                mqtt.send(message);

                clignotement(true);
                setTimeout(function() {
                    cooked();
                }, time);
                
            //Limite non atteinte
            }else{
                
                stringMessage = "{\"id\": 3,\"state\": 1}";
                message = new Paho.MQTT.Message(stringMessage.toString());
                message.destinationName = "isen03/led";
                message.retained=true;
                mqtt.send(message);

                if(maCuissonTemperature>limit){
                    mySprite(">");
                }
                else{
                    mySprite("<");
                }

            
                //On reboucle (toute les 2s) pour verifier avec la nouvelle temperature
                setTimeout(function() {
                    recupTemp(nom);
                }, 2000);
            }
            
        }
        
        function clignotement(value){
            var stringMessage = "";
            var message = new Paho.MQTT.Message(stringMessage.toString());

            if(value){
                stringMessage = "{\"id\": 2,\"state\": 1}";
                message = new Paho.MQTT.Message(stringMessage.toString());
                message.destinationName = "isen03/led";
                message.retained=true;
                mqtt.send(message);
            }else{
                stringMessage = "{\"id\": 2,\"state\": 0}";
                message = new Paho.MQTT.Message(stringMessage.toString());
                message.destinationName = "isen03/led";
                message.retained=true;
                mqtt.send(message);
            }
            if(!jeSuisCuit)
            setTimeout(function() {
                clignotement(!value);
            }, 400);
        }

        function cooked(){
            jeSuisCuit = true;
            var stringMessage = "{\"id\": 1,\"state\": 1}";
            var message = new Paho.MQTT.Message(stringMessage.toString());
            message.destinationName = "isen03/led";
            message.retained=true;
            mqtt.send(message);
        }

        function recupTemp(nom){

            var stringMessage = "{\"request\": 1}";
            var message = new Paho.MQTT.Message(stringMessage.toString());
            message.destinationName = "isen03/getTemp";
            message.retained=true;
            mqtt.send(message);
            setTimeout(function() {
                myCooking(nom);
            }, 1000);
        }

        class Sprite {
            constructor(x, y, width, height) {
              this.x = x;
              this.y = y;
              this.width = width;
              this.height = height;
            }
          
            draw(context) {
              context.fillStyle = "#FFF";
              context.fillRect(this.x, this.y, this.width, this.height);
            }
          }

        function mySprite(verif){
            const canvas = document.getElementById("myCanvas");
            const context = canvas.getContext("2d");
            var x;
           if(verif==">"){
                x = 700/1.5;
            }else if(verif=="<"){
                x = 700/3;
            }
            else{
                x = 700/2 - 11;
            }
            
            sprite.draw(context);
            
            
        }
        window.onload = mySprite;

        
