import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password hash in queries by default
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: {
        values: ['citizen', 'volunteer', 'ngo', 'admin'],
        message: 'Role must be citizen, volunteer, ngo, or admin',
      },
      default: 'citizen',
    },
    location: {
      type: String,
      default: 'Panvel, Maharashtra',
      trim: true,
    },
    avatar: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
    },
    bio: {
      type: String,
      default: '',
      trim: true,
    },
    verified: {
      type: Boolean,
      default: function () {
        // Citizens and seeded Admins are verified by default; Volunteers & NGOs require review
        return this.role === 'citizen' || this.role === 'admin';
      },
    },
    pendingVerification: {
      type: Boolean,
      default: function () {
        return this.role === 'volunteer' || this.role === 'ngo';
      },
    },
    verificationNotes: {
      type: String,
      default: '',
    },
    rejectionReason: {
      type: String,
      default: '',
    },

    // Volunteer specific fields
    skills: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Available', 'Assigned', 'On Field Mission', 'Awaiting Verification'],
      default: function () {
        if (this.role === 'volunteer') {
          return this.verified ? 'Available' : 'Awaiting Verification';
        }
        return undefined;
      },
    },
    badge: {
      type: String,
      default: function () {
        if (this.role === 'volunteer') {
          return this.verified ? 'Field Responder' : 'Applicant';
        }
        return undefined;
      },
    },
    assignedTasksCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedTasksCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // NGO specific fields
    regNumber: {
      type: String,
      trim: true,
      default: '',
    },
    focusAreas: {
      type: [String],
      default: [],
    },
    activeMissions: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedMissions: {
      type: Number,
      default: 0,
      min: 0,
    },
    volunteersCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Admin specific fields
    department: {
      type: String,
      default: function () {
        return this.role === 'admin'
          ? 'Disaster Recovery Coordination Bureau'
          : undefined;
      },
    },

    joinedDate: {
      type: String,
      default: function () {
        const now = new Date();
        return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Map _id to id for seamless compatibility with frontend
UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Pre-save hook to hash password if modified
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to return safe object without sensitive properties
UserSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

const User = mongoose.model('User', UserSchema);

export default User;
