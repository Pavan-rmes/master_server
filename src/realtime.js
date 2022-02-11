import { Router } from "express";
import { SocketActivation,SocketDeactivate,changeDgaValues,ChangeValues,GetValues,getPresentPort,ChangeAmbTemp,changeNameplate,GetNameplateValues } from "./index.js";
import express from "express";

const realTimeRouter = Router();

realTimeRouter.post("/",express.json(),(req,res)=>{
    const filter = req.body
    console.log(filter)
    const {regulation,port,automatic,percentage} = filter
    let load = percentage
    res.send(GetValues())
    if(getPresentPort() === +port) {
        'pass'
    }
    else{
        SocketDeactivate()
        SocketActivation(+port)
    }
    ChangeValues(regulation,automatic,load)
    
})

realTimeRouter.get("/",(req,res)=>{
    res.send(GetValues())
})

realTimeRouter.post("/dga",express.json(),(req,res)=>{
    changeDgaValues(req.body)
    console.log(req.body)
    res.send({status:"success"})
    
})

realTimeRouter.get("/nameplate",(req,res)=>{
    res.send(GetNameplateValues())
})

realTimeRouter.post("/nameplate",express.json(),(req,res)=>{
    changeNameplate(req.body)
    res.send({stats:"success"})
})

realTimeRouter.post("/ambtemp",express.json(),(req,res)=>{
    ChangeAmbTemp(req.body.ambTemp)
    res.send({status:"success"})
})

export default realTimeRouter;