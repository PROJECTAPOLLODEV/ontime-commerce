import mongoose, { Schema, models, model } from "mongoose";

const ProductSchema = new Schema(
  {
    // Canonical fields used by UI
    title: { type: String, required: true },
    slug: { type: String, index: true },
    description: { type: String },
    brand: { type: String },
    category: { type: String },

    // prices in cents
    price_amount: { type: Number, default: 0 },
    compare_at_amount: { type: Number, default: 0 },

    // Canonical image the UI should use first
    image: { type: String },

    // Optional raw arrays (as received from Clover)
    images: [{ type: String }],
    imagesDetails: [
      {
        type: { type: String },
        url: { type: String },
      },
    ],

    // Clover specific fields
    clover_id: { type: String, index: true },
    clover_no: { type: String }, // item number
    clover_type: { type: String },
    oemNos: [
      {
        manufacturer: String,
        oemNo: String,
      },
    ],
    color: String,
    yield: String,
    availability: String,
    attributes: [
      {
        attributeName: String,
        attributeValue: String,
      },
    ],
    videos: [String],
    productBoxDimensions: {
      unitOfMeasure: String,
      length: String,
      width: String,
      height: String,
      weight: String,
    },
    additionalProductInformation: String,
    sds: String,
    downloads: [
      {
        filename: String,
        url: String,
      },
    ],
    searchKeywords: [String],
    countryOfOrigin: String,
  },
  { timestamps: true }
);

const Product = models.Product || model("Product", ProductSchema);
export default Product;
