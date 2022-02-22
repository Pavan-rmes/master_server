import { Router } from "express";
// import { SocketActivation,SocketDeactivate,changeDgaValues,ChangeValues,GetValues,getPresentPort,ChangeAmbTemp,changeNameplate,GetNameplateValues,getFanbankStatus,ChangeFanbankStatus } from "./index.js";
import express from "express";
import axios from "axios";


const trafoApi = "http://127.0.0.1"

const realTimeRouter = Router();

realTimeRouter.post("/",express.json(),(req,res)=>{
    const {id} = req.query
    axios.post(`${trafoApi}:${9000+(+id)}/trafo`,req.body)
    .then(()=>res.send({status:"success"}))
    
})

realTimeRouter.get("/",(req,res)=>{
    const {id} = req.query
    axios.get(`${trafoApi}:${9000+(+id)}/trafo`)
    .then((data) => res.send(data.data))
    .catch((err)=>res.send(err))

})


realTimeRouter.post("/dga",express.json(),(req,res)=>{
    const {id} = req.query
    axios.post(`${trafoApi}:${9000+(+id)}/trafo/dga`,req.body)
    .then(()=>res.send({status:"success"}))
    
})

realTimeRouter.get("/nameplate",async(req,res)=>{
    const {id} = req.query
    axios.get(`${trafoApi}:${9000+(+id)}/trafo/nameplate`)
    .then((data) => res.send(data.data))
    .catch((err)=>res.send(err))

})

realTimeRouter.post("/nameplate",express.json(),async(req,res)=>{
    const {id} = req.query
    const rating = req.body
    axios.post(`${trafoApi}:${9000+(+id)}/trafo/nameplate`, rating)
    .then((data)=>res.send({stats:"success"}))
    // changeNameplate(req.body)
})

realTimeRouter.post("/ambtemp",express.json(),(req,res)=>{
    const {id} = req.query
    axios.post(`${trafoApi}:${9000+(+id)}/trafo/ambtemp`,req.body)
    .then(()=>res.send({status:"success"}))
})

realTimeRouter.get("/fanbank",(req,res)=>{
    const {id} = req.query
    axios.get(`${trafoApi}:${9000+(+id)}/trafo/fanbank`)
    .then((data) => res.send(data.data))
    .catch((err)=>res.send(err))
})

realTimeRouter.post("/fanbank",express.json(),(req,res)=>{
    const {id} = req.query
    axios.post(`${trafoApi}:${9000+(+id)}/trafo/fanbank`,req.body)
    .then(()=>res.send({status:"success"}))
    .catch((err)=>res.send(err))

})



export default realTimeRouter;