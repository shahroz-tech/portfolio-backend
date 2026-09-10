import mongoose, { Document, Schema } from "mongoose";

export interface IVisitor extends Document {
  visitorId: string;
  ipHash: string;
  country?: string;
  city?: string;
  device: string;
  browser: string;
  os: string;
  referrer?: string;
  landingPage: string;
  language?: string;
  screenSize?: string;
  pagesVisited: string[];
  sessionDurationSeconds: number;
  createdAt: Date;
  lastSeenAt: Date;
}

const VisitorSchema = new Schema<IVisitor>(
  {
    visitorId: { type: String, required: true, index: true },
    ipHash: { type: String, required: true },
    country: { type: String },
    city: { type: String },
    device: { type: String, default: "unknown" },
    browser: { type: String, default: "unknown" },
    os: { type: String, default: "unknown" },
    referrer: { type: String, default: "direct" },
    landingPage: { type: String, required: true },
    language: { type: String },
    screenSize: { type: String },
    pagesVisited: { type: [String], default: [] },
    sessionDurationSeconds: { type: Number, default: 0 },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

VisitorSchema.index({ createdAt: -1 });
VisitorSchema.index({ country: 1 });

export default mongoose.model<IVisitor>("Visitor", VisitorSchema);
