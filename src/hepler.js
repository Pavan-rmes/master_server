// import net from "net"
// const serverSocket = net.createServer()

// function BreakString(str){
//   let arr=[]
//   for (let i=0;i<str.length;i+=2){
//     arr.push(str.substring(i,i+2))
//   }
//   return(arr)
// }

// function convertToHex(num){
//   let result 
//   if(num <=15){
//       result = 0+num.toString(16)
//   }
//   else{
//     result = num.toString(16)
//   }
//   return result
// }

// var RegMap = [
//   {
//     reg:2048,
//     val:20
//   },
//   {
//     reg:2049,
//     val:30
//   },
//   {
//     reg:2050,
//     val:40
//   },
//   {
//     reg:2051,
//     val:50
//   }
// ]

// function convertValues(num){
//   let firstPart = Math.floor(num/256)
//   let lastPart = num%256
//   return ([firstPart,lastPart])
// }

// function Modbus(data){
//   let inputArray = BreakString(data.toString("hex"))
//   let outputArray = inputArray.filter((val,index)=>index<=8)
//   let noOfRegAsked = parseInt(inputArray[11],16)
//   outputArray[5] = convertToHex(3 + noOfRegAsked*2)
//   outputArray[8] = convertToHex(noOfRegAsked*2)
//   let regValue = parseInt(inputArray[8]+inputArray[9],16)
//   let indexOfReg;
//   RegMap.map((reg,index)=>{
//     if(reg.reg === regValue){
//       indexOfReg = index;
//     }
//   })
//   let result = []
//   outputArray.forEach((ele)=>{
//     result.push(parseInt(ele,16))
//   })
//   for(let i=1;i<=noOfRegAsked;i++){
//     result.push(convertValues(RegMap[indexOfReg].val)[0]);
//     result.push(convertValues(RegMap[indexOfReg].val)[1])
//     indexOfReg++;
//   }
//   return result
// }

// serverSocket.on('connection',socket=>{
//   socket.write("hello")
//   socket.on("data",data=>{
//     socket.write((new Buffer.from(Modbus(data),'utf-8')))
//   })
//   socket.on("error", (err) =>socket.end())

// })


// serverSocket.listen(50004,()=>{console.log("server bound")})






// serverSocket.on('connection',socket=>{
//   var server = new Server();
//   console.log("client connected")
//   server.pipe(socket);
//   server.on("read-input-registers", function (from, to, reply) {
//       var reg = [
//           convertValues(topOilTemp),convertValues(wndTemp),convertValues(ambientTemp*100),convertValues(loadPower),
//           convertValues(loadCurrent*100),convertValues(tapPosition*100),convertValues(oltcCurrent),convertValues(oltcVoltage*100),
//           convertValues(fankBank1Status*100),convertValues(fankBank2Status*100),convertValues(fankBank3Status*100),convertValues(fankBank4Status*100),
//           convertValues(fankBank1Current),convertValues(fankBank2Current),convertValues(fankBank3Current),convertValues(fankBank4Current),
//           convertValues(OLTCInletTemp),convertValues(OLTCOutletTemp),convertValues(OLTCTempDiff),
//       ]
//       return reply(null, reg);
//   });
//   socket.on("error", (err) =>socket.end())
//   })




import Client from "ssh2-sftp-client";
import dotenv from "dotenv"
import fs from "fs"

dotenv.config()

console.log(fs.readFileSync("id_rsa.ppk"))
let sftp = new Client();

let remote_path = "/home/rmuser1/gw-rmon/datafiles/rmes/pddata/1/pavan.txt"
let data = fs.createReadStream('id_rsa.ppk')


sftp.connect({
  host: '20.197.63.109',
  port: '22',
  username: 'rmuser1',
  // password: "testsim@123",
  privateKey:fs.readFileSync("id_rsa.ppk")
}).then(() => {
  return sftp.mkdir("/home/rmuser1/gw-rmon/datafiles/rmes/pddata/1")
})
.then(() => {
  return sftp.put(data,remote_path)
}).then(()=>{
  sftp.end();
}).catch(err => {
  console.log(err, 'catch error');
});
