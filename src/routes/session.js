const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Message = require('../models/Message');
const memoryStorage = require('../services/memoryStorage');

// 检查数据库是否可用
let isDatabaseAvailable = true;

// 测试数据库连接
const testDatabaseConnection = async () => {
  try {
    await Session.findOne({}).exec();
    isDatabaseAvailable = true;
  } catch (error) {
    isDatabaseAvailable = false;
    console.warn('数据库不可用，使用内存存储');
  }
};

testDatabaseConnection();

// 创建会话
router.post('/create', async (req, res) => {
  try {
    const { name, agentIds, creatorId } = req.body;
    
    if (!name || !agentIds || !Array.isArray(agentIds) || agentIds.length < 2) {
      return res.status(400).json({ error: '会话名称和至少两个Agent ID是必需的' });
    }

    // 准备会话数据
    const sessionData = {
      name,
      agentIds,
      creatorId: creatorId || 'system',
      status: 'active',
      lastMessageAt: null,
      metadata: {}
    };

    let session;
    if (isDatabaseAvailable) {
      // 使用数据库
      session = new Session(sessionData);
      await session.save();
    } else {
      // 使用内存存储
      session = memoryStorage.createSession(sessionData);
    }

    res.status(201).json({
      success: true,
      session: {
        id: session._id,
        name: session.name,
        agentIds: session.agentIds,
        status: session.status,
        createdAt: session.createdAt
      }
    });
  } catch (error) {
    console.error('创建会话失败:', error);
    // 尝试使用内存存储
    try {
      const { name, agentIds, creatorId } = req.body;
      const sessionData = {
        name,
        agentIds,
        creatorId: creatorId || 'system',
        status: 'active',
        lastMessageAt: null,
        metadata: {}
      };
      const session = memoryStorage.createSession(sessionData);
      res.status(201).json({
        success: true,
        session: {
          id: session._id,
          name: session.name,
          agentIds: session.agentIds,
          status: session.status,
          createdAt: session.createdAt
        }
      });
    } catch (memoryError) {
      res.status(500).json({ error: '创建会话失败' });
    }
  }
});

// 获取会话列表
router.get('/', async (req, res) => {
  try {
    const sessions = await Session.find({});
    res.json({
      success: true,
      sessions: sessions.map(session => ({
        id: session._id,
        name: session.name,
        agentIds: session.agentIds,
        status: session.status,
        lastMessageAt: session.lastMessageAt,
        createdAt: session.createdAt
      }))
    });
  } catch (error) {
    console.error('获取会话列表失败:', error);
    res.status(500).json({ error: '获取会话列表失败' });
  }
});

// 获取单个会话详情
router.get('/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: '会话不存在' });
    }
    res.json({
      success: true,
      session: {
        id: session._id,
        name: session.name,
        agentIds: session.agentIds,
        status: session.status,
        lastMessageAt: session.lastMessageAt,
        metadata: session.metadata,
        createdAt: session.createdAt
      }
    });
  } catch (error) {
    console.error('获取会话详情失败:', error);
    res.status(500).json({ error: '获取会话详情失败' });
  }
});

// 更新会话
router.put('/:id', async (req, res) => {
  try {
    const { name, agentIds, status, metadata } = req.body;
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ error: '会话不存在' });
    }

    // 更新字段
    if (name) session.name = name;
    if (agentIds && Array.isArray(agentIds)) session.agentIds = agentIds;
    if (status && ['active', 'closed', 'archived'].includes(status)) session.status = status;
    if (metadata) session.metadata = metadata;

    await session.save();

    res.json({
      success: true,
      session: {
        id: session._id,
        name: session.name,
        agentIds: session.agentIds,
        status: session.status,
        lastMessageAt: session.lastMessageAt,
        metadata: session.metadata,
        createdAt: session.createdAt
      }
    });
  } catch (error) {
    console.error('更新会话失败:', error);
    res.status(500).json({ error: '更新会话失败' });
  }
});

// 关闭会话
router.patch('/:id/close', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: '会话不存在' });
    }

    session.status = 'closed';
    await session.save();

    res.json({
      success: true,
      session: {
        id: session._id,
        status: session.status
      }
    });
  } catch (error) {
    console.error('关闭会话失败:', error);
    res.status(500).json({ error: '关闭会话失败' });
  }
});

// 获取会话消息
router.get('/:id/messages', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const messages = await Message.find({ sessionId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    res.json({
      success: true,
      messages: messages.map(message => ({
        id: message._id,
        from: message.from,
        to: message.to,
        content: message.content,
        type: message.type,
        status: message.status,
        timestamp: message.createdAt
      }))
    });
  } catch (error) {
    console.error('获取会话消息失败:', error);
    res.status(500).json({ error: '获取会话消息失败' });
  }
});

module.exports = router;