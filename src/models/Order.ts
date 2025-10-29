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
    shippingAddress: {
      name: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: { type: String, default: "US" },
    },
    subtotal: Number, // cents - items subtotal
    shipping: Number, // cents - shipping cost
    tax: Number, // cents - tax amount
    amount: Number, // cents - total amount (subtotal + shipping + tax)
    currency: { type: String, default: "usd" },
    stripePaymentIntentId: String,
    stripeSessionId: String,
    paymentStatus: { type: String, default: "paid" }, // paid, pending, failed
    fulfillmentStatus: {
      type: String,
      default: "order_received",
      enum: ["order_received", "processing", "shipped", "in_transit", "out_for_delivery", "delivered", "cancelled"],
    },
    trackingNumber: String,
    notes: String,
  },
  { timestamps: true }
);

export default models.Order || model("Order", OrderSchema);
