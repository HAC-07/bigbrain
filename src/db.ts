import mongoose, { Schema, Types } from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export const User = mongoose.model("User", UserSchema);

const contenttype = ["X", "Youtube"];

const ContentSchema = new mongoose.Schema({
  type: { type: String, required: true },
  title: { type: String, enum: contenttype, required: true },
  link: { type: String, required: true },
  userId: { type: Types.ObjectId, ref: User, required: true },
});

export const Content = mongoose.model("Content", ContentSchema);

const LinkSchema = new mongoose.Schema({
  hash: { type: String, required: true },
  userId: { type: Types.ObjectId, ref: User, required: true },
});

export const Link = mongoose.model("Link", LinkSchema);
