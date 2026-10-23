import mongoose from 'mongoose';

const RecoveryHubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hub name is required'],
      trim: true,
    },
    zone: {
      type: String,
      required: [true, 'Zone is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      default: 'Raigad District',
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Operational', 'High Demand', 'Restocking', 'Closed'],
      default: 'Operational',
    },
    statusColor: {
      type: String,
      default: 'green',
    },
    operatingHours: {
      type: String,
      default: '08:00 AM - 08:00 PM (Daily)',
    },
    contactPerson: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    capacity: {
      type: String,
      default: '200 Persons Capacity',
    },
    occupancyRate: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    services: {
      type: [String],
      default: [],
    },
    inventorySummary: {
      type: String,
      default: '',
    },
    mapCoords: {
      x: { type: Number, default: 50 },
      y: { type: Number, default: 50 },
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for id mapped to _id
RecoveryHubSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

const RecoveryHub = mongoose.model('RecoveryHub', RecoveryHubSchema);

export default RecoveryHub;
