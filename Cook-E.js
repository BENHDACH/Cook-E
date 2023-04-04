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
            var text = document.getElementById("My_Temp");
            text.innerHTML = msg.payloadString[9]+msg.payloadString[10];
            

		}
	 	function onConnect() {
            console.log("Connected ");
            //mqtt.subscribe("isen03/led");
            mqtt.subscribe("isen03/temp");
            //var stringMessage = "{\"id\": 1,\"state\": 1}";
            var stringMessage = "{\"request\": 1}";
            message = new Paho.MQTT.Message(stringMessage.toString());
            //message.destinationName = "isen03/led";
            message.destinationName = "isen03/getTemp";
            message.retained=true;
            mqtt.send(message);

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
            var maTemperature = getElementById("My_Temp");
            var stringMessage = "";
            var monIndice = 0;

            var listePlat = [
                ["oeufDur",20,10000],
                ["oeufCoque",25,15000]
            ]

            for(i in Range(0,listePlat.length)){
                if(listePlat[i][0]==nom){
                    monIndice = i;
                }
            }

            limit = listePlat[monIndice][1];
            time = listePlat[monIndice][2];

            if(maTemperature.toInt()==limit){
                //On eteint la led rouge
                stringMessage = "{\"id\": 3,\"state\": 0}";
                message = new Paho.MQTT.Message(stringMessage.toString());
                message.destinationName = "isen03/led";
                message.retained=true;
                mqtt.send(message);

                clignotement(true)
                setTimeout(cooked(), time);
                
            //Limite non atteinte
            }else{
                stringMessage = "{\"id\": 3,\"state\": 1}";
                message = new Paho.MQTT.Message(stringMessage.toString());
                message.destinationName = "isen03/led";
                message.retained=true;
                mqtt.send(message);

                //On reboucle (toute les 2s) pour verifier avec la nouvelle temperature
                setTimeout(recupTemp(nom),2000)
            }
            
        }
        
        function clignotement(value){
            
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
            setTimeout(clignotement(!value),400);
        }

        function cooked(){
            jeSuisCuit = true;
            stringMessage = "{\"id\": 1,\"state\": 1}";
            message = new Paho.MQTT.Message(stringMessage.toString());
            message.destinationName = "isen03/led";
            message.retained=true;
            mqtt.send(message);
        }

        function recupTemp(nom){
            var stringMessage = "{\"request\": 1}";
            message = new Paho.MQTT.Message(stringMessage.toString());
            message.destinationName = "isen03/getTemp";
            message.retained=true;
            mqtt.send(message);
            setTimeout(myCooking(nom),1000);
        }
