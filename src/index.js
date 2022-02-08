import net from "net"
const serverSocket = net.createServer()
import { Server } from "modbus-tcp";
import express from "express";
import { Server as socketIo } from "socket.io";
import http from "http"
import realTimeRouter from "./realtime.js";
import cors from "cors"
import e from "express";

const app = express()

app.use(cors())

let topOilTemp;
let wndTemp;
let loadPower;
let loadCurrent;
let tapPosition;
let oltcCurrent = 0;
let oltcVoltage;

let fankBank1Status
let fankBank2Status
let fankBank3Status
let fankBank4Status 

let fankBank1Current
let fankBank2Current
let fankBank3Current
let fankBank4Current 

let No = process.argv[2]

//modbus port 
let modbusPort = 50000+(+No)

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

// cooling system
let FB1InletTemp;
let FB1OutletTemp;
let FB1TempDiff;
let RegMap=[];

//OLTCTags
let OLTCTopOil;


//Bushing tags
//capacitance
//Took the insulation resistance as 100Mohms,freq is 50
//c = 1/(wRC*tan(d))
let MVBush1Cap;let MVBush2Cap;let MVBush3Cap;
let LVBush1Cap;let LVBush2Cap;let LVBush3Cap;
let HVBush1Cap;let HVBush2Cap;let HVBush3Cap;

//tan delta
let MVBush1tand;let MVBush2tand;let MVBush3tand;
let LVBush1tand;let LVBush2tand;let LVBush3tand;
let HVBush1tand;let HVBush2tand;let HVBush3tand;



//This function converts befor giving it to holding registers
function convertValues(num){
    let firstPart = Math.floor(num/256)
    let lastPart = num%256
    return (new Buffer.from([firstPart,lastPart]))
}

function Modbus(data){
    let inputArray = BreakString(data.toString("hex"))
    let outputArray = inputArray.filter((val,index)=>index<=8)
    let noOfRegAsked = parseInt(inputArray[11],16)
    outputArray[5] = convertToHex(3 + noOfRegAsked*2)
    outputArray[8] = convertToHex(noOfRegAsked*2)
    let regValue = parseInt(inputArray[8]+inputArray[9],16)
    let indexOfReg=0;
    RegMap.map((reg,index)=>{
      if(reg.reg === regValue){
        indexOfReg = index;
      }
    })
    let result = []
    outputArray.forEach((ele)=>{
      result.push(parseInt(ele,16))
    })
    for(let i=1;i<=noOfRegAsked && i<=RegMap.length;i++){
      result.push(convertValues(RegMap[indexOfReg]?.val)[0]);
      result.push(convertValues(RegMap[indexOfReg]?.val)[1])
      indexOfReg++;
    }
    return result
}

function BreakString(str){
    let arr=[]
    for (let i=0;i<str.length;i+=2){
      arr.push(str.substring(i,i+2))
    }
    return(arr)
}
  
function convertToHex(num){
let result 
if(num <=15){
    result = 0+num.toString(16)
}
else{
    result = num.toString(16)
}
return result
}

function updateRegisterValues(){
   
    RegMap = [
        {
          reg:2048,
          val:topOilTemp
        },
        {
          reg:2049,
          val:wndTemp
        },
        {
          reg:2050,
          val:ambientTemp*100
        },
        {
          reg:2051,
          val:loadPower
        },
        {
            reg:2052,
            val:loadCurrent*100
        },
        {
            reg:2053,
            val:tapPosition*100
        },
        {
            reg:2054,
            val:oltcCurrent
        },
        {
            reg:2055,
            val:oltcVoltage*100
        },
        {
            reg:2056,
            val:fankBank1Status*100
        },
        {
            reg:2057,
            val:fankBank2Status*100
        },
        {
            reg:2058,
            val:fankBank3Status*100
        },
        {
            reg:2059,
            val:fankBank4Status*100
        },
        {
            reg:2060,
            val:fankBank1Current
        },
        {
            reg:2061,
            val:fankBank2Current
        },
        {
            reg:2062,
            val:fankBank3Current
        },
        {
            reg:2063,
            val:fankBank4Current
        },
        {
            reg:2064,
            val:FB1InletTemp   
        },
        {
            reg:2065,
            val:FB1OutletTemp
        },
        {
            reg:2066,
            val:FB1TempDiff
        },
        {
            reg:2067,
            val:MVBush1Cap
        },
        {
            reg:2068,
            val:MVBush2Cap
        },
        {
            reg:2069,
            val:MVBush3Cap
        },
        {
            reg:2070,
            val:LVBush1Cap
        },
        {
            reg:2071,
            val:LVBush2Cap
        },
        {
            reg:2072,
            val:LVBush3Cap
        },
        {
            reg:2073,
            val:HVBush1Cap
        },
        {
            reg:2074,
            val:HVBush2Cap
        },
        {
            reg:2075,
            val:HVBush3Cap
        },
        {
            reg:2076,
            val:MVBush1tand
        },
        {
            reg:2077,
            val:MVBush2tand
        },
        {
            reg:2078,
            val:MVBush3tand
        },
        {
            reg:2079,
            val:LVBush1tand
        },
        {
            reg:2080,
            val:LVBush2tand
        },
        {
            reg:2081,
            val:LVBush3tand
        },
        {
            reg:2082,
            val:HVBush1tand
        },
        {
            reg:2083,
            val:HVBush2tand
        },
        {
            reg:2084,
            val:HVBush3tand
        },
        {
            reg:2085,
            val:OLTCTopOil
        }
    ]
}

serverSocket.on('connection',socket=>{
    socket.on("data",data=>{
      socket.write((new Buffer.from(Modbus(data),'utf-8')))
    })
    socket.on("error", (err) =>socket.end())
})

function SocketDeactivate(){
    serverSocket.close()
}

function SocketActivation(modbusPort){
    serverSocket.listen(modbusPort,()=>{console.log("server bound")})
}


SocketActivation(modbusPort)


async function TagsGeneration(){

    if(automaticLoadGeneration){
        while(automaticLoadGeneration){
            let date =new Date().toLocaleTimeString()
            let [time,timePeriod] = date.split(" ")
            let [hr,min,sec] = time.split(":")
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

    //cooling subsystem
    CoolingTags(topOilTemp)

    //tandelta calculation
    tanDeltaCal()

    //capacitance calculation
    capacitanceCal()

    //OLTC subsystem
    OLTCTags(loadpecentage)
    
    //updating the register values
    updateRegisterValues()

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

function CoolingTags(topOilTemp){
    if(topOilTemp >= fankBank1Threshold*100){
        FB1InletTemp = randomBetweenTwoNumbers(topOilTemp-100,topOilTemp+100)
        FB1OutletTemp = randomBetweenTwoNumbers(topOilTemp-300,topOilTemp-200)
        FB1TempDiff = FB1InletTemp - FB1OutletTemp
    }
    else{
        FB1InletTemp = randomBetweenTwoNumbers(topOilTemp-50,topOilTemp-10)
        FB1OutletTemp = randomBetweenTwoNumbers(topOilTemp-70,topOilTemp-50)
        FB1TempDiff = FB1InletTemp - FB1OutletTemp
    }

}

function OLTCTags(loadpecentage){
    OLTCTopOil = topOilTemp - randomBetweenTwoNumbers(100,300)
    if(loadpecentage >65 & loadpecentage <70){
        tapPosition = 4
    }
    else if(loadpecentage >70 & loadpecentage <75){
        tapPosition = 3
    }
    else if(loadpecentage >40 & loadpecentage <50){
        tapPosition = 6
    }
    else if(loadpecentage >30 & loadpecentage <40){
        tapPosition = 7
    }
    else if(loadpecentage >40 & loadpecentage <50){
        tapPosition = 6
    }
    else if(loadpecentage >50 && loadpecentage <65){
        tapPosition = 5
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
        setTimeout(()=>(oltcCurrent = 0),5000)
        oltcCurrent = randomBetweenTwoNumbers(386,396)
    }
}

function tanDeltaCal(){
    MVBush1tand = randomBetweenTwoNumbers(270,290);
    MVBush2tand = randomBetweenTwoNumbers(270,290);
    MVBush3tand = randomBetweenTwoNumbers(270,290);
    LVBush1tand = randomBetweenTwoNumbers(270,290);
    LVBush2tand = randomBetweenTwoNumbers(270,290);
    LVBush3tand = randomBetweenTwoNumbers(270,290);
    HVBush1tand = randomBetweenTwoNumbers(270,290);
    HVBush2tand = randomBetweenTwoNumbers(270,290);
    HVBush3tand = randomBetweenTwoNumbers(270,290);
}

function capacitanceCal(){
    MVBush1Cap = 3183.09/(0.001*MVBush1tand);
    MVBush2Cap = 3183.09/(0.001*MVBush2tand);
    MVBush3Cap = 3183.09/(0.001*MVBush3tand);
    LVBush1Cap = 3183.09/(0.001*LVBush1tand);
    LVBush2Cap = 3183.09/(0.001*LVBush2tand);
    LVBush3Cap = 3183.09/(0.001*LVBush3tand);
    HVBush1Cap = 3183.09/(0.001*HVBush1tand);
    HVBush2Cap = 3183.09/(0.001*HVBush2tand);
    HVBush3Cap = 3183.09/(0.001*HVBush3tand);
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

function ChangeAmbTemp(ambTemp){
    ambientTemp = parseFloat(ambTemp) 
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

app.listen(9000+(+No),()=>console.log(9000+(+No)))

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

server.listen(8000+(+No),()=>{console.log("socket port is",8000+(+No))})

export {ChangeValues,SocketActivation,SocketDeactivate,GetValues,getPresentPort,ChangeAmbTemp}






