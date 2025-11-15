// main/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth.js';
import sectionRoutes from './routes/section.route.js';
import inquiryRoutes from './routes/inquiry.route.js';
import requirementRoutes from './routes/requirement.route.js';

const app = express();
app.use(express.json());
app.use(cors());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/requirements', requirementRoutes);

// __dirname replacement in ES modules
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine whether the app is packaged
// Adjust this logic depending on your Electron packaging
const isPackaged = process.argv[0].includes('MyApp.exe');

// Path for production build:
const prodEnv = path.join(process.resourcesPath || __dirname, '.env');

// Path for development:
const devEnv = path.join(process.cwd(), '.env');

// Decide which .env file to load
const envPath = fs.existsSync(prodEnv) ? prodEnv : devEnv;
console.log("Loading .env from:", envPath);

dotenv.config({ path: envPath });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));
