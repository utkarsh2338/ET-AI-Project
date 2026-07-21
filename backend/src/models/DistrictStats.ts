import mongoose, { Document, Schema } from 'mongoose';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type Trend = 'Increasing' | 'Stable' | 'Decreasing';

export interface IDistrictStats extends Document {
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  reportCount: number;
  verifiedCount: number;
  criticalCount: number;
  averageSeverity: number;        // 1=Low, 2=Medium, 3=High, 4=Critical
  hotspotScore: number;           // 0–100 normalized
  priorityLevel: PriorityLevel;
  latestIncident: Date | null;
  trend: Trend;
  geminiRecommendation: string;
  geminiPriority: PriorityLevel;
  lastCalculated: Date;
  // Seed-level historical data
  historicalFraudCount: number;
}

const DistrictStatsSchema = new Schema<IDistrictStats>(
  {
    district:              { type: String, required: true, trim: true, index: true },
    state:                 { type: String, required: true, trim: true, index: true },
    latitude:              { type: Number, required: true },
    longitude:             { type: Number, required: true },
    reportCount:           { type: Number, default: 0 },
    verifiedCount:         { type: Number, default: 0 },
    criticalCount:         { type: Number, default: 0 },
    averageSeverity:       { type: Number, default: 1 },
    hotspotScore:          { type: Number, default: 0, min: 0, max: 100 },
    priorityLevel:         { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
    latestIncident:        { type: Date, default: null },
    trend:                 { type: String, enum: ['Increasing', 'Stable', 'Decreasing'], default: 'Stable' },
    geminiRecommendation:  { type: String, default: '' },
    geminiPriority:        { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
    lastCalculated:        { type: Date, default: Date.now },
    historicalFraudCount:  { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Unique constraint per district+state pair
DistrictStatsSchema.index({ district: 1, state: 1 }, { unique: true });
// Sort index for hotspot queries
DistrictStatsSchema.index({ hotspotScore: -1 });
DistrictStatsSchema.index({ latitude: 1, longitude: 1 });

export const DistrictStats = mongoose.model<IDistrictStats>('DistrictStats', DistrictStatsSchema);
