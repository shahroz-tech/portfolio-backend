import mongoose, { Document, Schema } from "mongoose";

export interface ISiteSettings extends Document {
  notificationEmail: string;
  analyticsEnabled: boolean;
  contactFormEnabled: boolean;
  resumeFileName: string;
  siteTitle: string;
  siteDescription: string;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    notificationEmail: { type: String, required: true },
    analyticsEnabled: { type: Boolean, default: true },
    contactFormEnabled: { type: Boolean, default: true },
    resumeFileName: { type: String, default: "resume.pdf" },
    siteTitle: { type: String, default: "Muhammad Shahroz Shahzad — Full Stack Developer" },
    siteDescription: {
      type: String,
      default:
        "Full Stack Developer specializing in Laravel/PHP and the MERN stack. 3+ years building scalable, secure web applications.",
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);
