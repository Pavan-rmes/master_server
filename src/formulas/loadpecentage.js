async function TopOilGeneration(){
    let automaticLoadGeneration = true;
    let loadpecentage
    let lossRatio = 6
    let oilExponent = 0.9
    let topOilTempRiseAtRatedLoad = 35
    let ambientTemp = 35

    let date =new Date().toLocaleTimeString()
    let [time,timePeriod] = date.split(" ")
    let [hr,min,sec] = time.split(":")

    function randomBetweenTwoNumbers(min,max){
        let randomBetweenZeroToOne = Math.random()
        return Math.round((min+randomBetweenZeroToOne*(max-min)))
    }

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

        let topOilFirstPart = Math.pow(loadpecentage*0.01,2)
        let topOilSecPart = topOilFirstPart*lossRatio*topOilFirstPart+1
        let topOilThirdPart = topOilFirstPart*lossRatio +1 
        let topOilRatio = Math.pow(topOilSecPart/topOilThirdPart,oilExponent)
        let newtopOilTemp = Math.round((ambientTemp + (loadpecentage*0.01*topOilTempRiseAtRatedLoad*topOilRatio))*100)

        if(topOilTemp){
            topOilTemp = newtopOilTemp
        }
        else{
            if(!(newtopOilTemp-topOilTemp>0.5 && topOilTemp-newtopOilTemp >0.5)){
                topOilTemp = newtopOilTemp
            }
        }
        await sleep(1000)
        console.log(topOilTemp)
    }

}

function sleep(time){
    return new Promise(resolve=>setTimeout(resolve,time))
}





