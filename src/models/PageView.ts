import mongoose, { Document, Schema } from "mongoose";

export interface IPageView extends Document {
  visitorId: string;
  path: string;
  createdAt: Date;
}

const PageViewSchema = new Schema<IPageView>(
  {
    visitorId: { type: String, required: true, index: true },
    path: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

PageViewSchema.index({ createdAt: -1 });
PageViewSchema.index({ path: 1 });

export default mongoose.model<IPageView>("PageView", PageViewSchema);
