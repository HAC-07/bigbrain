import express from "express";
import { z } from "zod";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";
import { Contentmodel, Linkmodel, Usermodel } from "./db";
import { auth } from "./auth";
import { Jwt_password } from "./jwt_password";
import { randomhash } from "./utils";
const app = express();

app.use(express.json());

const hashed= randomhash(10);

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

app.post("/api/v1/signin", async (req, res) => {
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
        const token = jwt.sign(
          {
            id: existingUser._id,
          },
          Jwt_password
        );
        res.json({
          token,
        });
      } else {
        res.status(403).json({
          message: "Incorrect Crediantials",
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "Somegthing went wrong",
      });
    }
  }
});

app.post("/api/v1/content", auth, async (req, res) => {
  const ZodSchema = z.object({
    link: z.string(),
    type: z.enum(["X", "Youtube"]),
    title: z.string(),
    userId: z.string(),
  });

  const contentdata = {
    link: req.body.link,
    type: req.body.type,
    title: req.body.title,
    userId: req.userId,
  };

  const finaldata = ZodSchema.safeParse(contentdata);

  if (finaldata.success) {
    try {
      await Contentmodel.create({
        link: contentdata.link,
        type: contentdata.type,
        title: contentdata.title,
        userId: contentdata.userId,
      });
      res.json({
        message: "Content Added",
      });
    } catch (e) {
      console.log(e);
      res.json({
        message: "Invalid Inputs",
      });
    }
  }
  else {
    res.json({
      message: "Invalid Inputs",
    });
  }
});

app.get("/api/v1/content", auth, async (req, res) => {

  const userId=req.userId;
  const content= await Contentmodel.find({
    userId:userId
  }).populate("userId","username");

  res.json({
    content 
  })

});

app.delete("/api/v1/content", auth, async (req, res) => {

  const userId=req.userId;
  const contentId=req.body.contentId;

  if(!contentId){
    res.json({
      message:"Content Id is required"
    })
    return;
  }

  try{
      const deletedcontent= await Contentmodel.deleteMany({
   _id:contentId,
   userId:userId,
  });
  res.json({
    message:"Content Deleted",
    deletedcontent
  })
}
 catch(e){
    res.json({
      message:"Invalid Inputs",
    })
  };
});

app.post("/api/v1/share", auth, async (req, res) => {
  const share = req.body.share;
  if(share){

    const existinglink = await Linkmodel.findOne({
      userId:req.userId
    })
    if (existinglink){
      res.json({
        link:`http://localhost:3000/api/v1/${existinglink.hash}`
      })
      return;
    }

    await Linkmodel.create({
      userId:req.userId,
      hash:hashed
    })
    res.json({
      link: `http://localhost:3000/api/v1/${hashed}`
    })
  }
  else{
    await Linkmodel.deleteOne({
      userId:req.userId
    })
  }
  res.json({
    message:"Share Link Updated",
  })
});

app.get("/api/v1/:sharelink", async (req, res) => {

  const sharelink = req.params.sharelink;
  if(!sharelink){
    res.json({
      message:"Share link is required"
    })
    return;
  }
  const trimmedvalue = sharelink.split("/").pop();
  const link =await Linkmodel.findOne({
    hash:trimmedvalue
  })

  if(!link){
    res.json({
      message:"Wrong link provided"
    })
    return;
  }
  
    const content = await Contentmodel.find({
      userId:link.userId
    })

    const user = await Usermodel.findOne({
      _id:link.userId
    })
    if(!user){
      res.json({
        message:"User not found (ideally should not happen)"
      })
      return;
    }
    res.json({
      name:user?.name,
      username:user?.username,
      content:content
    })
});

app.listen(3000);
