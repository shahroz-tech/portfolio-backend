import mongoose, { Document, Schema } from "mongoose";

export type MessageStatus = "new" | "read" | "replied" | "archived";

export interface IContactMessage extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  ipHash?: string;
  userAgent?: string;
  createdAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 150 },
    subject: { type: String, required: true, trim: true, maxlength: 150 },
    message: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
    status: { type: String, enum: ["new", "read", "replied", "archived"], default: "new", index: true },
    ipHash: { type: String },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ContactMessageSchema.index({ createdAt: -1 });

export default mongoose.model<IContactMessage>("ContactMessage", ContactMessageSchema);
