const express         = require('express');
const dotenv          = require('dotenv');
const cors            = require('cors');
const path            = require('path');
const helmet          = require('helmet');
const compression     = require('compression');

const connectDB              = require('./config/db');
const logger                 = require('./middleware/logger');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { sanitizeStrings }    = require('./middleware/validate');

dotenv.config();
connectDB();

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(sanitizeStrings);
app.use(logger);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => res.send('FYP Management API is running'));

app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/admin',      require('./routes/adminRoutes'));
app.use('/api/supervisor', require('./routes/supervisorRoutes'));
app.use('/api/student',    require('./routes/studentRoutes'));
app.use('/api/superadmin', require('./routes/superAdminRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
