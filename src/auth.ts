import express, {Request,Response, NextFunction } from "express";
import jwt,{JwtPayload} from "jsonwebtoken";
import { Jwt_password } from "./jwt_password";

export const auth=(req:Request, res:Response, next: NextFunction)=>{
    const header = req.headers["authorization"]
    const decode = jwt.verify(header as string,Jwt_password)

    if (decode){
        if(typeof decode === "string"){
            res.status(403).json({
                message:"You are not logged in"
            })
            return;
        }
        req.userId=(decode as JwtPayload).id;
        next();
    }
    else{
        res.status(403).json({
                message:"You are not logged in"
        })
    }
}