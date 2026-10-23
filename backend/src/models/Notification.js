import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    requestId: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ['submitted', 'verification', 'match', 'progress', 'completed', 'closed', 'status'],
      default: 'status',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    desc: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      default: 'Just now',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    unread: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for id mapped to _id
NotificationSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;
