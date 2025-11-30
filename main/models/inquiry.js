import mongoose from 'mongoose';

// Define the schema first
const inquirySchema = new mongoose.Schema(
  {
    inquiryId: { type: String, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    requirement: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement', required: true },
    nic: { type: String, required: true },
    visitedDate: { type: Date, default: Date.now },
    rating: { type: Number, min: 1, max: 5 },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    acknowledgement: { type: String },
    notes: { type: String },
    status: { type: String, default: 'Pending' }
  },
  { timestamps: true }
);

// Auto-generate Inquiry ID
inquirySchema.pre('save', async function (next) {
  if (!this.inquiryId) {
    const lastInquiry = await this.constructor.findOne().sort({ createdAt: -1 });
    let newId = 'INQ - 00001';

    if (lastInquiry && lastInquiry.inquiryId) {
      const lastNumber = parseInt(lastInquiry.inquiryId.split(' - ')[1], 10);
      const newNumber = String(lastNumber + 1).padStart(5, '0');
      newId = `INQ - ${newNumber}`;
    }

    this.inquiryId = newId;
  }
  next();
});

const Inquiry = mongoose.model('Inquiry', inquirySchema);

export default Inquiry;
