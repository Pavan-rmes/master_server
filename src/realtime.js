import { Router } from "express";
import { SocketActivation,SocketDeactivate,ChangeValues,GetValues,getPresentPort } from "./index.js";
import express from "express";

const realTimeRouter = Router();

realTimeRouter.post("/",express.json(),(req,res)=>{
    const filter = req.body
    console.log(filter)
    const {regulation,port,automatic,percentage} = filter
    let load = percentage
    console.log(load)
    res.header("Access-Control-Allow-Origin", "*");
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

export default realTimeRouter;