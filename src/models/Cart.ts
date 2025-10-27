import { Schema, models, model } from "mongoose";
const CartSchema = new Schema(
{
userId: { type: String, index: true }, // Clerk user id (or null for guest via cookie id)
cookieId: { type: String, index: true },
items: [
{
productId: { type: Schema.Types.ObjectId, ref: "Product" },
title: String,
price: Number, // cents
quantity: Number,
image: String,
},
],
},
{ timestamps: true }
);
export default models.Cart || model("Cart", CartSchema);