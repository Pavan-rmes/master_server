import net from "net"
const serverSocket = net.createServer()
import { Server } from "modbus-tcp";
import express from "express";
import { Server as socketIo } from "socket.io";
import http from "http"
import realTimeRouter from "./realtime.js";
import cors from "cors"

const app = express()

app.use(cors())

let topOilTemp;
let wndTemp;
let loadPower;
let loadCurrent;
let tapPosition;
let oltcCurrent;
let oltcVoltage;

let fankBank1Status
let fankBank2Status
let fankBank3Status
let fankBank4Status 

let fankBank1Current
let fankBank2Current
let fankBank3Current
let fankBank4Current 

//modbus port 
let modbusPort = 50003

//Fan bank threshold values
let fankBank1Threshold = 60
let fankBank2Threshold = 65
let fankBank3Threshold = 70
let fankBank4Threshold = 75

// power in MVA
let loadPowerRatingofTransformer = 100

let automaticLoadGeneration = true;

let ambientTemp = 35

//voltage regulation in perecentage
let voltageRegulation = 6

//load voltage rating in volts
let loadvoltageRatingofTransformer = 231000

let loadpecentage
let lossRatio = 6
let oilExponent = 0.9
let topOilTempRiseAtRatedLoad = 35
let wndgTempAtRatedLoad = 40




//This function converts befor giving it to holding registers
function convertValues(num){
    let firstPart = Math.floor(num/256)
    let lastPart = num%256
    return (new Buffer.from([firstPart,lastPart]))
}


serverSocket.on('connection',socket=>{
    var server = new Server();
    console.log("client connected")
    server.pipe(socket);
    server.on("read-input-registers", function (from, to, reply) {
        var reg = [
            convertValues(topOilTemp),convertValues(wndTemp),convertValues(ambientTemp*100),convertValues(loadPower),
            convertValues(loadCurrent*100),convertValues(tapPosition*100),convertValues(oltcCurrent),convertValues(oltcVoltage*100),
            convertValues(fankBank1Status*100),convertValues(fankBank2Status*100),convertValues(fankBank3Status*100),convertValues(fankBank4Status*100),
            convertValues(fankBank1Current),convertValues(fankBank2Current),convertValues(fankBank3Current),convertValues(fankBank4Current),
        ]
        return reply(null, reg);
    });
    socket.on("error", (err) =>socket.end())
    })
    console.log("hello")

function SocketDeactivate(){
    serverSocket.close()
}

function SocketActivation(modbusPort){
    serverSocket.listen(modbusPort,()=>{console.log("server bound")})
}


SocketActivation(modbusPort)


async function TagsGeneration(){

    let date =new Date().toLocaleTimeString()
    let [time,timePeriod] = date.split(" ")
    let [hr,min,sec] = time.split(":")
    if(automaticLoadGeneration){
        while(automaticLoadGeneration){

            //For morning the load varing will be
            if(timePeriod === "am" || timePeriod === "AM"){
                if(hr==="0"){
                    loadpecentage  = randomBetweenTwoNumbers(35,40)
                }
            
                else if(hr==="1"){
                    loadpecentage  = randomBetweenTwoNumbers(35,40)
                }
            
                else if(hr==="2"){
                    loadpecentage  = randomBetweenTwoNumbers(37,42)
                }
            
                else if(hr==="3"){
                    loadpecentage  = randomBetweenTwoNumbers(40,46)
                }
            
                else if(hr==="4"){
                    loadpecentage  = randomBetweenTwoNumbers(45,50)
                }
            
                else if(hr==="5"){
                    loadpecentage  = randomBetweenTwoNumbers(50,57)
                }
            
                else if(hr==="6"){
                    loadpecentage  = randomBetweenTwoNumbers(50,60)
                }
            
                else if(hr==="7"){
                    loadpecentage  = randomBetweenTwoNumbers(60,65)
                }
            
                else if(hr==="8"){
                    loadpecentage  = randomBetweenTwoNumbers(55,62)
                }
            
                else if(hr==="9"){
                    loadpecentage  = randomBetweenTwoNumbers(47,52)
                }
            
                else if(hr==="10"){
                    loadpecentage  = randomBetweenTwoNumbers(42,45)
                }
                else if(hr==="11"){
                    loadpecentage  = randomBetweenTwoNumbers(45,52)
                }
            }

            //For evening the load varing will be
            else{

                if(hr==="12"){
                    loadpecentage  = randomBetweenTwoNumbers(50,55)
                }
            
                else if(hr==="1"){
                    loadpecentage  = randomBetweenTwoNumbers(55,60)
                }
            
                else if(hr==="2"){
                    loadpecentage  = randomBetweenTwoNumbers(50,55)
                }
            
                else if(hr==="3"){
                    loadpecentage  = randomBetweenTwoNumbers(45,50)
                }
            
                else if(hr==="4"){
                    loadpecentage  = randomBetweenTwoNumbers(53,58)
                }
            
                else if(hr==="5"){
                    loadpecentage  = randomBetweenTwoNumbers(60,70)
                }
            
                else if(hr==="6"){
                    loadpecentage  = randomBetweenTwoNumbers(70,75)
                }
            
                else if(hr==="7"){
                    loadpecentage  = randomBetweenTwoNumbers(65,70)
                }
            
                else if(hr==="8"){
                    loadpecentage  = randomBetweenTwoNumbers(55,60)
                }
            
                else if(hr==="9"){
                    loadpecentage  = randomBetweenTwoNumbers(47,55)
                }
            
                else if(hr==="10"){
                    loadpecentage  = randomBetweenTwoNumbers(42,47)
                }
                else if(hr==="11"){
                    loadpecentage  = randomBetweenTwoNumbers(38,45)
                }
            }

            CalculateTags()
            //sleep for 1 sec
            await sleep(1000)

        }
    }
    else{
        CalculateTags()
    }

}

function CalculateTags(){
    // new top oil calculated from load
    TopOilCal(loadpecentage)
        
    //Load power and current
    LoadPowerCurrent(loadpecentage)


    //OLTC Current,Voltage and Tap-pos
    TapPos()
    oltcVoltage = randomBetweenTwoNumbers(210,220)

    //Fankbank 
    FanBank(topOilTemp)

    //Winding Temp
    wndTemp = WindingTemp(topOilTemp)

}

function TopOilCal(loadpecentage){
    // Top oil temp calculation
    let topOilFirstPart = Math.pow(loadpecentage*0.01,2)
    let topOilSecPart = topOilFirstPart*lossRatio*topOilFirstPart+1
    let topOilThirdPart = topOilFirstPart*lossRatio +1 
    let topOilRatio = Math.pow(topOilSecPart/topOilThirdPart,oilExponent)
    let newtopOilTemp = Math.round((ambientTemp + (loadpecentage*0.01*topOilTempRiseAtRatedLoad*topOilRatio))*100)
    if(topOilTemp){
        topOilTemp = newtopOilTemp
    }
    else{
        if(!(newtopOilTemp-topOilTemp>0.2 && topOilTemp-newtopOilTemp >0.2)){
            topOilTemp = newtopOilTemp
        }
    }

}

function WindingTemp(topOilTemp){
    return Math.round((wndgTempAtRatedLoad/topOilTempRiseAtRatedLoad)*topOilTemp)
}

function TapPos(){
    //load volatge change in kv
    let loadVolatge= LoadVoltageCal(voltageRegulation)
    //OLTC Tap Position
    let newtapPosition = CalculateTapPos(loadVolatge)

    if(tapPosition !== newtapPosition){
        tapPosition = newtapPosition
        oltcCurrent = randomBetweenTwoNumbers(386,396)
    }
    else{
        tapPosition = newtapPosition
        oltcCurrent = 0
    }
}

function CalculateTapPos(voltage){

    
    if(voltage<203){
        return 10
    }
    else if(voltage>=203 && voltage <208){
        return 9
    }
    else if(voltage>=208 && voltage <214){
        return 8
    }
    else if(voltage>=214 && voltage <219){
        return 7
    }
    else if(voltage>=219 && voltage <225){
        return 6
    }
    else if(voltage>=225 && voltage <231){
        return 5
    }
    else if(voltage>=231 && voltage <236){
        return 4
    }
    else if(voltage>=236 && voltage <242){
        return 3
    }
    else if(voltage>=242 && voltage <248){
        return 2
    }
    else if(voltage>=248 && voltage <254){
        return 1
    }
    else{
        return 1
    }
}

function FanBank(topOilTemp){
    //FanBank status
    if(topOilTemp < fankBank1Threshold*100){
        fankBank1Status = 0
        fankBank2Status = 0
        fankBank3Status = 0
        fankBank4Status = 0
    }
    else if(topOilTemp>=fankBank1Threshold*100 && topOilTemp<fankBank2Threshold*100){
        fankBank1Status = 1
        fankBank2Status = 0
        fankBank3Status = 0
        fankBank4Status = 0
    }
    else if(topOilTemp>=fankBank2Threshold*100 && topOilTemp < fankBank3Threshold*100){
        fankBank1Status = 1
        fankBank2Status = 1
        fankBank3Status = 0
        fankBank4Status = 0
    }
    else if(topOilTemp>=fankBank3Threshold*100 && topOilTemp < fankBank4Threshold*100){
        fankBank1Status = 1
        fankBank2Status = 1
        fankBank3Status = 1
        fankBank4Status = 0
    }
    else if (topOilTemp >= fankBank4Threshold*100){
        fankBank1Status = 1
        fankBank2Status = 1
        fankBank3Status = 1
        fankBank4Status = 1
    }

    if(fankBank1Status ===1){
        fankBank1Current = randomBetweenTwoNumbers(386,396)
    }
    if(fankBank2Status ===1){
        fankBank2Current = randomBetweenTwoNumbers(386,396)
    }
    if(fankBank3Status ===1){
        fankBank3Current = randomBetweenTwoNumbers(386,396)
    }
    if(fankBank4Status ===1){
        fankBank4Current = randomBetweenTwoNumbers(386,396)
    }
}

function LoadPowerCurrent(loadpecentage){
    //Load Current and power
    if((loadpecentage*0.01) >0.11){
        let linevoltage = loadvoltageRatingofTransformer*1.737
        loadCurrent =  ((loadPowerRatingofTransformer*1000000)/(linevoltage))*(loadpecentage*0.01)
        loadPower = loadCurrent*linevoltage/10000
    }
    else{
        let linevoltage = loadvoltageRatingofTransformer*1.737
        loadCurrent =  ((loadPowerRatingofTransformer*1000000)/(linevoltage))*(0.05)
        loadPower = loadCurrent*linevoltage
    }
}

function sleep(time){
    return new Promise(resolve=>setTimeout(resolve,time))
}

function randomBetweenTwoNumbers(min,max){
    let randomBetweenZeroToOne = Math.random()
    return Math.round((min+randomBetweenZeroToOne*(max-min)))
}

function LoadVoltageCal(voltageRegulation){
    return (231-(2.31*voltageRegulation))
}

TagsGeneration()

function ChangeValues(regulation,automatic,load){
    voltageRegulation = regulation
    automaticLoadGeneration=false
    automatic=== "yes"?automaticLoadGeneration=true:automaticLoadGeneration=false
    loadpecentage = parseFloat(load)
    TagsGeneration()
}

function GetValues(){
    return({regulation:voltageRegulation,
        port:modbusPort,
        automatic:automaticLoadGeneration,
        loadpercentage:loadpecentage
    })
}

function getPresentPort(){
    return modbusPort
}


// app.get("/",(req,res)=>{
//     res.send("Hello")
// })

app.listen(9000)

// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
//     next();
// });

app.use("/trafo",realTimeRouter)


const server = http.createServer(app);
const io = new socketIo(server,{ cors: { origin: '*' } });



io.on("connection", (socket) => {
  let interval;
  console.log("New client connected");
  
  interval = setInterval(() => getApiAndEmit(socket), 1000);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});
const getApiAndEmit = socket => {
  const response = {topOilTemp,wndTemp,tapPosition:tapPosition*100}
  socket.emit("FromAPI", response);
};

server.listen(8000,()=>{console.log("socket port is 8000")})

export {ChangeValues,SocketActivation,SocketDeactivate,GetValues,getPresentPort}






