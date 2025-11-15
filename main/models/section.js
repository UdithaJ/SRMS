import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  sectionId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  }

}, {
  timestamps: true // optional, adds createdAt and updatedAt fields
});

const Section = mongoose.model('Section', sectionSchema);

export default Section; 
