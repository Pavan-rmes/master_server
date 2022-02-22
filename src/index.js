import net from "net"
const serverSocket = net.createServer()
import express from "express";
import { Server as socketIo } from "socket.io";
import http from "http"
import cors from "cors"
import axios from "axios";
import realTimeRouter from "./realtime.js";



const app = express()

app.listen(9000,console.log("Main Api is using the port ",9000))


app.use(cors())

app.use("/trafo",realTimeRouter)


function sleep(time){
    return new Promise(resolve=>setTimeout(resolve,time))
}


const server = http.createServer(app);
const io = new socketIo(server,{ cors: { origin: '*' } });

const trafoKeys = ["Fromtx1","Fromtx2","Fromtx3","Fromtx4"]

const getNamePlate = ["nptx1","nptx2","nptx3"]

let realTimeData={};let namePlateData = {};
io.on("connection", (socket) => {
  let interval;
  //Connected
  console.log("New client connected");

  //get the real time data ans set it to a variable
  trafoKeys.map((tx,id)=>(socket.on(tx,(arg)=>realTimeData[tx] = arg)))

  //get nameplate  details
  getNamePlate.map((np,id)=>(socket.on(np,(arg)=>{namePlateData[np] = arg;console.log(namePlateData)})))

  //Send realtime data upstream
  interval = setInterval(() => {sendData(socket,realTimeData)}, 1000);

  //Send nameplate data upstream
 //socket.on("npData",socket.emit("npData",namePlateData))

  //Client disconnected
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

const sendData = (socket,realTimeData)=>{
    socket.emit("FromAPI",realTimeData)
}

server.listen(8000,()=>{console.log("socket port is",8000)})






