const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'openclaw',
    enum: ['openclaw', 'autogen', 'crewai', 'custom']
  },
  userId: {
    type: String,
    required: true
  },
  apiKey: {
    type: String,
    required: true,
    unique: true
  },
  endpoint: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'offline',
    enum: ['online', 'offline', 'busy']
  },
  lastSeen: {
    type: Date,
    default: null
  },
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Agent', agentSchema);