import mongoose from "mongoose";
import { Schema } from "mongoose";
import Producto from "./Product.js";
import User from "./User.js";


const CartSchema = new mongoose.Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: User },
    products : [{type: Schema.Types.ObjectId, ref: Producto ,required: true}],
    totalAmount: { type: Number, required: true },
  },

  { timestamps: true }
);

export default mongoose.model("Cart", CartSchema);