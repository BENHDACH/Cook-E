var mqtt;
var reconnectTimeout = 2000;
var host="broker.mqttdashboard.com";
var port=8000;

var currentNomCooking = "";

var jeSuisCuit = false;
var tempOK = false;
var timer = false;

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
                if(recupJson["id"]==1 && currentNomCooking!="" && !timer){
                    //On modifie la valeur de tmp imaginaire dans myCooking
                    myCooking(currentNomCooking,"1");
                }else if(recupJson["id"]==2 && currentNomCooking!="" && !timer){
                    myCooking(currentNomCooking,"2");
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
            //mySprite("-");
            
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

        function myCooking(nom,current){
            //mqtt.subscribe("isen03/led");
            var stringMessage = "";
            var message = new Paho.MQTT.Message(stringMessage.toString());

            if(current=="3" && tempOK){
                return ;
            }
            else if(current=="0"){
                tempOK=false;
                jeSuisCuit = false;
                //Eteint tout

                for(let i = 1; i <= 3; i++){
                    setTimeout(function() {
                        turnOnOff(i,0);
                    }, i*50);
                }
            }

            currentNomCooking = nom;
            
            var limit=100;
            var time=100;
            var previousTmp = document.getElementById("My_Temp");
            var maTemperature = previousTmp.innerHTML;
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
            if(!timer){
                tempsCuisson.innerHTML = "-"+(time/1000)+"s-";
            }
            
            
            var maCuissonTemperature = parseInt(maTemperature[1]+maTemperature[2])+45;

            if(current=="1" && maCuissonTemperature>limit){
                maCuissonTemperature = limit;
            }
            else if(current=="2" && maCuissonTemperature<limit){
                maCuissonTemperature = limit;
            }

            docIdCuissonT.innerHTML = "["+maCuissonTemperature+"°]";



            //On donne les chiffre (XY°C) donc X position [1] et Y [2]
            if(maCuissonTemperature==limit){
                //On eteint la led rouge
                setTimeout(function() {
                    turnOnOff(3,0);
                }, 350);

                setTimeout(function(){
                    mySprite("-");
                    clignotement(true);
                },450);

                timer=true;
                for(let i = 1; i <= time/1000; i++){
                    setTimeout(function(){
                        myTimer(time/1000 - i);
                    },1000*i)
                }
                setTimeout(function(){
                    timer=false;
                },time);
                
                setTimeout(function() {
                    cooked();
                }, time);
                
            //Limite non atteinte
            }else{
                
                setTimeout(function() {
                    turnOnOff(3,1);
                }, 400);

                if(maCuissonTemperature>limit){
                    mySprite(">");
                }
                else{
                    mySprite("<");
                }

            
                //On reboucle (toute les 2s) pour verifier avec la nouvelle temperature
               /* setTimeout(function() {
                    recupTemp(nom);
                }, 2000);*/
            }
            
        }

        function turnOnOff(unNom,state){
            stringMessage = "{\"id\":"+unNom+",\"state\": "+state+"}";
            message = new Paho.MQTT.Message(stringMessage.toString());
            message.destinationName = "isen03/led";
            message.retained=true;
            mqtt.send(message);
        }

        function myTimer(timing){
            var tempsCuisson = document.getElementById("tps");
            tempsCuisson.innerHTML = "-"+timing+"s-";
        }
        
        function clignotement(value){
            tempOK = true;

            if(value){
                setTimeout(function() {
                    turnOnOff(2,1);
                }, 50);
            }else{
                setTimeout(function() {
                    turnOnOff(2,0);
                }, 50);
            }
            if(!jeSuisCuit)
            setTimeout(function() {
                clignotement(!value);
            }, 250);
        }

        function cooked(){
            //si le clignotement c'est arrêter sur ON on le OFF au cas où
            setTimeout(function() {
                turnOnOff(2,0);
            }, 750);

            jeSuisCuit = true;
            setTimeout(function() {
                turnOnOff(1,1);
            }, 850);
            

        }

        function recupTemp(nom){
            var stringMessage = "{\"request\": 1}";
            var message = new Paho.MQTT.Message(stringMessage.toString());
            message.destinationName = "isen03/getTemp";
            message.retained=true;
            mqtt.send(message);
            setTimeout(function() {
                myCooking(nom,"3");
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
            var sprite = new Sprite((700/2 - 11),0, 11, 16);
            context.clearRect(0, 0, canvas.width, canvas.height);
            sprite.draw(context);
            
           if(verif==">"){
                sprite.x = 700/1.5;
                context.clearRect(0, 0, canvas.width, canvas.height);
                sprite.draw(context);
            }else if(verif=="<"){
                sprite.x = 700/3;
                context.clearRect(0, 0, canvas.width, canvas.height);
                sprite.draw(context);
            }
            
            
            
        }
        window.onload = mySprite;

        
