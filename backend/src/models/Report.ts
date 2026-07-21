import mongoose, { Document, Schema } from 'mongoose';

export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
export type ReportStatus = 'Pending' | 'Verified' | 'Resolved';
export type ReportSource = 'Citizen' | 'Police' | 'Imported';
export type FraudCategory =
  | 'Digital Arrest / Impersonation of Law Enforcement'
  | 'Online Financial Fraud (UPI/Card/Net-banking)'
  | 'Investment / Trading Scam'
  | 'Job Fraud / Work-From-Home Scam'
  | 'Loan App Harassment'
  | 'KYC Update Fraud'
  | 'SIM Swap Fraud'
  | 'Courier / Parcel Scam'
  | 'Romance / Matrimonial Scam'
  | 'Sextortion'
  | 'Lottery / Prize Scam'
  | 'Phishing (Email/SMS/Voice)'
  | 'Social Media Account Takeover'
  | 'Cyberbullying / Online Harassment'
  | 'Counterfeit Currency Passing'
  | 'Ransomware / Malware'
  | 'Online Shopping / E-commerce Fraud'
  | 'Cryptocurrency Fraud'
  | 'UPI Fraud'
  | 'Banking Fraud'
  | 'OTP Scam'
  | 'Phishing'
  | 'Lottery Scam'
  | 'Job Fraud'
  | 'Investment Scam'
  | 'KYC Scam'
  | 'Impersonation'
  | 'Other'
  | string;

export interface IReport extends Document {
  reportId: string;
  title: string;
  description: string;
  category: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  severity: Severity;
  scamPrediction?: string;
  confidence?: number;
  status: ReportStatus;
  source: ReportSource;
  contentHash?: string;
}

const ReportSchema = new Schema<IReport>(
  {
    reportId:       { type: String, required: true, unique: true, index: true },
    title:          { type: String, required: true, maxlength: 200, trim: true },
    description:    { type: String, required: true, maxlength: 2000, trim: true },
    category:       { type: String, required: true, trim: true },
    district:       { type: String, required: true, trim: true, index: true },
    state:          { type: String, required: true, trim: true, index: true },
    latitude:       { type: Number, required: true, min: 6, max: 38 },
    longitude:      { type: Number, required: true, min: 68, max: 98 },
    timestamp:      { type: Date, required: true, default: Date.now, index: true },
    severity:       { type: String, required: true, enum: ['Low', 'Medium', 'High', 'Critical'], index: true },
    scamPrediction: { type: String },
    confidence:     { type: Number, min: 0, max: 100 },
    status:         { type: String, required: true, enum: ['Pending', 'Verified', 'Resolved'], default: 'Pending' },
    source:         { type: String, required: true, enum: ['Citizen', 'Police', 'Imported'], default: 'Citizen' },
    contentHash:    { type: String, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound geospatial index
ReportSchema.index({ latitude: 1, longitude: 1 });
// Compound index for district aggregation queries
ReportSchema.index({ district: 1, state: 1, timestamp: -1 });
// Deduplication index
ReportSchema.index({ contentHash: 1, timestamp: -1 });

export const Report = mongoose.model<IReport>('Report', ReportSchema);
