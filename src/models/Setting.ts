import { Schema, model, models } from "mongoose";

const SettingSchema = new Schema(
  {
    homepage: {
      bannerImage: { type: String, default: "" },
      bannerHeading: { type: String, default: "Your Industrial Partner" },
      bannerSub: { type: String, default: "Quality signage & materials" },
      featuredProductIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
      brandLogos: [
        {
          lightUrl: { type: String, default: "" },
          darkUrl: { type: String, default: "" },
        }
      ],
      features: [
        {
          title: { type: String, default: "" },
          description: { type: String, default: "" },
          icon: { type: String, default: "shipping" }, // shipping, payment, returns, support
        }
      ],
    },
    pricing: {
      markupPercent: { type: Number, default: 0 }, // e.g., 30 for "30 points"
    },
  },
  { timestamps: true }
);

export default models.Setting || model("Setting", SettingSchema);
