import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    actionType: {
      type: String,
      required: true,
      index: true,
    },
    actor: {
      type: String,
      required: true,
      trim: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    actorRole: {
      type: String,
      required: true,
      enum: ['citizen', 'volunteer', 'ngo', 'admin', 'system'],
      default: 'system',
    },
    targetId: {
      type: String,
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      required: true,
    },
    timestamp: {
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
AuditLogSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

export default AuditLog;
