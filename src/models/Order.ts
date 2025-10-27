import { Schema, model, models } from "mongoose";

const OrderSchema = new Schema(
  {
    userId: { type: String, index: true, default: null },
    email: { type: String },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        title: String,
        price: Number, // cents (already marked up at checkout)
        quantity: Number,
        image: String,
        sku: String,
      },
    ],
    amount: Number, // cents
    currency: { type: String, default: "usd" },
    stripePaymentIntentId: String,
    status: { type: String, default: "paid" },
  },
  { timestamps: true }
);

export default models.Order || model("Order", OrderSchema);
