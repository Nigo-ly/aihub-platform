const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const memoryStorage = require('../services/memoryStorage');
const { authMiddleware } = require('../services/auth');
const crypto = require('crypto');

// 检查数据库是否可用
let isDatabaseAvailable = true;

// 测试数据库连接
const testDatabaseConnection = async () => {
  try {
    await Agent.findOne({}).exec();
    isDatabaseAvailable = true;
  } catch (error) {
    isDatabaseAvailable = false;
    console.warn('数据库不可用，使用内存存储');
  }
};

testDatabaseConnection();

// 生成API密钥
const generateApiKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

// 注册Agent
router.post('/register', async (req, res) => {
  try {
    const { name, type = 'openclaw', endpoint, metadata } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Agent名称不能为空' });
    }

    // 生成API密钥
    const apiKey = generateApiKey();

    // 准备Agent数据
    const agentData = {
      name,
      type,
      userId: req.body.userId || 'default',
      apiKey,
      endpoint,
      metadata,
      status: 'offline',
      lastSeen: null
    };

    let agent;
    if (isDatabaseAvailable) {
      // 使用数据库
      agent = new Agent(agentData);
      await agent.save();
    } else {
      // 使用内存存储
      agent = memoryStorage.createAgent(agentData);
    }

    res.status(201).json({
      success: true,
      agent: {
        id: agent._id,
        name: agent.name,
        type: agent.type,
        apiKey: agent.apiKey,
        status: agent.status,
        createdAt: agent.createdAt
      }
    });
  } catch (error) {
    console.error('注册Agent失败:', error);
    // 尝试使用内存存储
    try {
      const { name, type = 'openclaw', endpoint, metadata } = req.body;
      const apiKey = generateApiKey();
      const agentData = {
        name,
        type,
        userId: req.body.userId || 'default',
        apiKey,
        endpoint,
        metadata,
        status: 'offline',
        lastSeen: null
      };
      const agent = memoryStorage.createAgent(agentData);
      res.status(201).json({
        success: true,
        agent: {
          id: agent._id,
          name: agent.name,
          type: agent.type,
          apiKey: agent.apiKey,
          status: agent.status,
          createdAt: agent.createdAt
        }
      });
    } catch (memoryError) {
      res.status(500).json({ error: '注册Agent失败' });
    }
  }
});

// 获取Agent列表
router.get('/', async (req, res) => {
  try {
    let agents;
    if (isDatabaseAvailable) {
      agents = await Agent.find({});
    } else {
      agents = memoryStorage.getAgents();
    }
    res.json({
      success: true,
      agents: agents.map(agent => ({
        id: agent._id,
        name: agent.name,
        type: agent.type,
        status: agent.status,
        lastSeen: agent.lastSeen,
        createdAt: agent.createdAt
      }))
    });
  } catch (error) {
    console.error('获取Agent列表失败:', error);
    // 尝试使用内存存储
    try {
      const agents = memoryStorage.getAgents();
      res.json({
        success: true,
        agents: agents.map(agent => ({
          id: agent._id,
          name: agent.name,
          type: agent.type,
          status: agent.status,
          lastSeen: agent.lastSeen,
          createdAt: agent.createdAt
        }))
      });
    } catch (memoryError) {
      res.status(500).json({ error: '获取Agent列表失败' });
    }
  }
});

// 获取单个Agent详情
router.get('/:id', async (req, res) => {
  try {
    let agent;
    if (isDatabaseAvailable) {
      agent = await Agent.findById(req.params.id);
    } else {
      agent = memoryStorage.getAgent(req.params.id);
    }
    if (!agent) {
      return res.status(404).json({ error: 'Agent不存在' });
    }
    res.json({
      success: true,
      agent: {
        id: agent._id,
        name: agent.name,
        type: agent.type,
        endpoint: agent.endpoint,
        status: agent.status,
        lastSeen: agent.lastSeen,
        metadata: agent.metadata,
        createdAt: agent.createdAt
      }
    });
  } catch (error) {
    console.error('获取Agent详情失败:', error);
    // 尝试使用内存存储
    try {
      const agent = memoryStorage.getAgent(req.params.id);
      if (!agent) {
        return res.status(404).json({ error: 'Agent不存在' });
      }
      res.json({
        success: true,
        agent: {
          id: agent._id,
          name: agent.name,
          type: agent.type,
          endpoint: agent.endpoint,
          status: agent.status,
          lastSeen: agent.lastSeen,
          metadata: agent.metadata,
          createdAt: agent.createdAt
        }
      });
    } catch (memoryError) {
      res.status(500).json({ error: '获取Agent详情失败' });
    }
  }
});

// 更新Agent
router.put('/:id', async (req, res) => {
  try {
    const { name, type, endpoint, metadata } = req.body;
    const agent = await Agent.findById(req.params.id);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent不存在' });
    }

    // 更新字段
    if (name) agent.name = name;
    if (type) agent.type = type;
    if (endpoint) agent.endpoint = endpoint;
    if (metadata) agent.metadata = metadata;

    await agent.save();

    res.json({
      success: true,
      agent: {
        id: agent._id,
        name: agent.name,
        type: agent.type,
        endpoint: agent.endpoint,
        status: agent.status,
        lastSeen: agent.lastSeen,
        metadata: agent.metadata,
        createdAt: agent.createdAt
      }
    });
  } catch (error) {
    console.error('更新Agent失败:', error);
    res.status(500).json({ error: '更新Agent失败' });
  }
});

// 删除Agent
router.delete('/:id', async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent不存在' });
    }

    await agent.remove();
    res.json({ success: true, message: 'Agent已删除' });
  } catch (error) {
    console.error('删除Agent失败:', error);
    res.status(500).json({ error: '删除Agent失败' });
  }
});

// 更新Agent状态
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['online', 'offline', 'busy'].includes(status)) {
      return res.status(400).json({ error: '无效的状态值' });
    }

    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent不存在' });
    }

    agent.status = status;
    if (status === 'online') {
      agent.lastSeen = new Date();
    }

    await agent.save();
    res.json({
      success: true,
      agent: {
        id: agent._id,
        status: agent.status,
        lastSeen: agent.lastSeen
      }
    });
  } catch (error) {
    console.error('更新Agent状态失败:', error);
    res.status(500).json({ error: '更新Agent状态失败' });
  }
});

module.exports = router;