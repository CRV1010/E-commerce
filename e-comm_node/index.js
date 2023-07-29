const express = require("express")
require("./db/config")
const cors = require("cors")
const user = require("./db/user")
const Product = require("./db/Product")
const app = express()
const jwt = require("jsonwebtoken");

const jwtKey = "Chirag"
app.use(express.json())
app.use(cors())

app.post("/signup",async (req,res)=>{
    let data = new user(req.body)
    let result = await data.save()
    result = result.toObject()
    delete result.password
    jwt.sign({result},jwtKey, {expiresIn:"1h"} ,(err,token)=>{
        if(err)
        {
            res.send("Token Expired or something went wrong")
        }
        else{
            res.send({result,token})
        }
    })

})

app.post("/login",async (req,res)=>{
    if(req.body.email && req.body.password)
    {
        let result = await user.findOne(req.body).select("-password")
        if(result)
        {
            jwt.sign({result},jwtKey, {expiresIn:"1h"} ,(err,token)=>{
                if(err)
                {
                    res.send("Token Expired or something went wrong")
                }
                else{
                    res.send({result,token})
                }
            })
            
        }
        else{
            res.send({result :"No record found"})
        }
    }
    else{
        res.send({result :"No record found"})
    }
    
})

app.post("/addProduct",verfiyToken,async (req,res) => {
    let data = new Product(req.body)
    let result = await data.save();
    res.send(result)
})

app.get("/products",verfiyToken,async (req,res) => {
    let data = await Product.find()
    if(data.length>1)
    {
        res.send(data)
    }
    else
    {

        res.send({result: "no record found"})
    }
})

app.delete("/product/:id",verfiyToken,async (req,res)=>{
    let data = await Product.deleteOne({_id:req.params.id})
    res.send(data)
})

app.get("/product/:id",verfiyToken,async (req,res)=>{
    let data = await Product.findOne({_id:req.params.id})
    if(data){
        res.send(data)
    }
    else{
        res.send({result : "NO record found"})
    }
   
})

app.put("/product/:id",verfiyToken,async (req,res) => {
    let data = await Product.updateOne(
        { _id : req.params.id},
        {
            $set : req.body
        }
    )
    if(data)
    {
        res.send(data)
    }
    else{
        res.send("Cannot Update data")
    }
})

app.get("/search/:key",verfiyToken, async (req,res) =>{
    let data = await Product.find({
        "$or":[
            {name : {$regex : req.params.key}},
            {company : {$regex : req.params.key}},
            {category : {$regex : req.params.key}}
            // {price : {$regex : req.params.key}}
        ]
    })

    res.send(data)
})

function verfiyToken(req,res,next){
    let token = req.headers['authorization']
    if(token)
    {
        token = token.split(" ")[1]
        jwt.verify(token,jwtKey,(err,valid)=>{
            if(err)
            {
                res.send({result : "error in token"})
            }
            else{
                next()
            }
        })
    }
    else{
        res.send({result : "Pls provide token with header"})
    }

}

app.listen(4000)