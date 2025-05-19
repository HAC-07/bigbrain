import mongoose, { model, Schema, Types } from "mongoose";
mongoose.connect("mongodb://localhost:27017/bigbrain")

const UserSchema = new mongoose.Schema({
  name: { type: String },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export const Usermodel = model("User", UserSchema);

const contenttype = ["X", "Youtube"];

const ContentSchema = new mongoose.Schema({
  type: { type: String, required: true },
  title: { type: String, enum: contenttype, required: true },
  link: { type: String, required: true },
  userId: { type: Types.ObjectId, ref: "User", required: true },
});

export const Contentmodel = model("Content", ContentSchema);

const LinkSchema = new mongoose.Schema({
  hash: { type: String, required: true },
  userId: { type: Types.ObjectId, ref: "User", required: true },
});

export const Linkmodel = model("Link", LinkSchema);
