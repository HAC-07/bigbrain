import express from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Usermodel } from "./db";
import { auth } from "./auth";
import { Jwt_password } from "./jwt_password";
const app = express();

app.use(express.json());

app.post("/api/v1/signup", async (req, res) => {
  const ZodSchema = z.object({
    name: z.string().min(1, "Name is Required"),
    username: z
      .string()
      .min(3, "Username is Required with minimum length 3")
      .max(18),
    password: z.string().min(8, "Password with minimum lenth 8 is required"),
  });

  const Userdata = {
    name: req.body.name,
    username: req.body.username,
    password: req.body.password,
  };

  const finaldata = ZodSchema.safeParse(Userdata);
  if (finaldata.success) {
    try {
      const existingUser = await Usermodel.findOne({
        username: Userdata.username,
      });

      if (existingUser) {
        res.status(409).json({ message: "User already exists" });
        return;
      }

      const hashedpassword = await bcrypt.hash(Userdata.password, 10);
      await Usermodel.create({
        name: finaldata.data.name,
        username: finaldata.data.username,
        password: hashedpassword,
      });
      res.status(200).json({
        message: "User signed up",
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Something went wrong. Please try again later." });
    }
  }
});

app.post("/api/v1/signin", async (req,res)=>{

  const ZodSchema = z.object({
    name: z.string().min(1, "Name is Required"),
    username: z
      .string()
      .min(3, "Username is Required with minimum length 3")
      .max(18),
    password: z.string().min(8, "Password with minimum lenth 8 is required"),
  });

  const Userdata = {
    name: req.body.name,
    username: req.body.username,
    password: req.body.password,
  };

  const finaldata=ZodSchema.safeParse(Userdata)

  if(finaldata.success){
    try{
        const existingUser = await Usermodel.findOne({username:Userdata.username})
        if(existingUser){
            const token = jwt.sign({
                id:existingUser._id
            },Jwt_password)
            res.json({
                token
            }) 
        }
        else{
            res.status(403).json({
                message:"Incorrect Crediantials"
            })
        }
    }
    catch(error){
        res.status(500).json({
            message:"Somegthing went wrong"
        })
    }
  }
});
app.listen(3000);
