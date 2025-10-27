import { Schema, models, model } from "mongoose";
const BannerSchema = new Schema(
{ title: String, subtitle: String, ctaLabel: String, ctaHref: String, image: String },
{ timestamps: true }
);
export default models.Banner || model("Banner", BannerSchema);