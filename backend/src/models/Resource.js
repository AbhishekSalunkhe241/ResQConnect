import mongoose from 'mongoose';

const ResourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Resource name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Resource category is required'],
      enum: [
        'Food & Water',
        'Medical Assistance',
        'Shelter',
        'Clothing',
        'Transportation',
        'Household Supplies',
        'Other',
      ],
      default: 'Food & Water',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    unit: {
      type: String,
      default: 'units',
      trim: true,
    },
    minThreshold: {
      type: Number,
      default: 20,
      min: 0,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      default: 'Panvel Central Depot',
    },
    organization: {
      type: String,
      default: 'Helping Hands Foundation',
      trim: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Critical', 'Unavailable'],
      default: 'In Stock',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    lastUpdated: {
      type: String,
      default: function () {
        const now = new Date();
        const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateFormatted = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
        return `${dateFormatted}, ${timeFormatted}`;
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for id mapped to _id
ResourceSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Pre-save hook to compute status based on quantity and threshold
ResourceSchema.pre('save', function (next) {
  if (this.status !== 'Unavailable') {
    if (this.quantity <= 0) {
      this.status = 'Critical';
    } else if (this.quantity <= this.minThreshold) {
      this.status = 'Low Stock';
    } else {
      this.status = 'In Stock';
    }
  }
  next();
});

const Resource = mongoose.model('Resource', ResourceSchema);

export default Resource;
