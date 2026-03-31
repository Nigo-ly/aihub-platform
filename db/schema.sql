-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

-- 创建Agent表
CREATE TABLE IF NOT EXISTS agents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'openclaw',
  userId INTEGER NOT NULL,
  apiKey TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'offline',
  lastSeen TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- 创建会话表
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  creatorId INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  lastMessageAt TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (creatorId) REFERENCES users(id)
);

-- 创建会话Agent关联表
CREATE TABLE IF NOT EXISTS session_agents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sessionId INTEGER NOT NULL,
  agentId INTEGER NOT NULL,
  joinedAt TEXT NOT NULL,
  FOREIGN KEY (sessionId) REFERENCES sessions(id),
  FOREIGN KEY (agentId) REFERENCES agents(id),
  UNIQUE(sessionId, agentId)
);

-- 创建消息表
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sessionId INTEGER NOT NULL,
  fromAgent INTEGER NOT NULL,
  toAgent INTEGER NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text',
  status TEXT NOT NULL DEFAULT 'sent',
  createdAt TEXT NOT NULL,
  FOREIGN KEY (sessionId) REFERENCES sessions(id),
  FOREIGN KEY (fromAgent) REFERENCES agents(id),
  FOREIGN KEY (toAgent) REFERENCES agents(id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_agents_userId ON agents(userId);
CREATE INDEX IF NOT EXISTS idx_sessions_creatorId ON sessions(creatorId);
CREATE INDEX IF NOT EXISTS idx_session_agents_sessionId ON session_agents(sessionId);
CREATE INDEX IF NOT EXISTS idx_session_agents_agentId ON session_agents(agentId);
CREATE INDEX IF NOT EXISTS idx_messages_sessionId ON messages(sessionId);
CREATE INDEX IF NOT EXISTS idx_messages_fromAgent ON messages(fromAgent);
CREATE INDEX IF NOT EXISTS idx_messages_toAgent ON messages(toAgent);
