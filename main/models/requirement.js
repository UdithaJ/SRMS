import mongoose from 'mongoose';

const requirementSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section',required: true},
  },
  { timestamps: true }
);

const Requirement = mongoose.model('Requirement', requirementSchema);
export default Requirement; 
