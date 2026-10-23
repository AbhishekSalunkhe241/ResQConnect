import mongoose from 'mongoose';

const TimelineStepSchema = new mongoose.Schema(
  {
    step: {
      type: String,
      required: true,
      enum: [
        'Submitted',
        'Under Verification',
        'Verified',
        'Matched',
        'Assistance In Progress',
        'Field Check-in',
        'Resource Allocated',
        'Completed',
        'Closed',
        'Rejected',
      ],
    },
    timestamp: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const CheckInNoteSchema = new mongoose.Schema(
  {
    timestamp: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const ItemNeededSchema = new mongoose.Schema(
  {
    item: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    qty: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    unit: {
      type: String,
      default: 'units',
      trim: true,
    },
  },
  { _id: false }
);

const AllocatedResourceSchema = new mongoose.Schema(
  {
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },
    resourceName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unit: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    timestamp: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const RequestSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Food & Water',
        'Medical Assistance',
        'Shelter',
        'Clothing',
        'Transportation',
        'Household Supplies',
        'Financial Assistance',
        'Other',
      ],
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      required: true,
      enum: [
        'Submitted',
        'Under Verification',
        'Verified',
        'Matched',
        'Assistance In Progress',
        'Completed',
        'Closed',
        'Rejected',
      ],
      default: 'Submitted',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    addressDetails: {
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
    },
    peopleAffected: {
      type: Number,
      required: true,
      min: [1, 'People affected must be at least 1'],
      default: 1,
    },
    accessibility: {
      type: String,
      default: 'None',
      trim: true,
    },
    additionalNotes: {
      type: String,
      default: '',
      trim: true,
    },
    requester: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
      },
      name: { type: String, required: true },
      phone: { type: String, default: '' },
      type: { type: String, default: 'Citizen' },
      affectedCount: { type: Number, default: 1 },
    },
    assignedOrganization: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String },
    },
    assignedVolunteer: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String },
      phone: { type: String },
      badge: { type: String },
    },
    estimatedAssistance: {
      type: String,
      default: null,
    },
    itemsNeeded: {
      type: [ItemNeededSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one requested item is required',
      },
    },
    allocatedResources: {
      type: [AllocatedResourceSchema],
      default: [],
    },
    timeline: {
      type: [TimelineStepSchema],
      default: [],
    },
    checkInNotes: {
      type: [CheckInNoteSchema],
      default: [],
    },
    completionNote: {
      type: String,
      default: null,
    },
    proofDescription: {
      type: String,
      default: null,
    },
    completedAt: {
      type: String,
      default: null,
    },
    isFlagged: {
      type: Boolean,
      default: false,
      index: true,
    },
    flagReason: {
      type: String,
      default: null,
    },
    flaggedAt: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for id mapped to _id
RequestSchema.virtual('mongoId').get(function () {
  return this._id.toHexString();
});

const Request = mongoose.model('Request', RequestSchema);

export default Request;
