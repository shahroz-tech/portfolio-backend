import mongoose, { Document, Schema } from "mongoose";

export interface IResumeDownload extends Document {
  visitorId: string;
  referrer?: string;
  device?: string;
  createdAt: Date;
}

const ResumeDownloadSchema = new Schema<IResumeDownload>(
  {
    visitorId: { type: String, required: true },
    referrer: { type: String },
    device: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ResumeDownloadSchema.index({ createdAt: -1 });

export default mongoose.model<IResumeDownload>("ResumeDownload", ResumeDownloadSchema);
