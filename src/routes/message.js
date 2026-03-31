const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Session = require('../models/Session');
const memoryStorage = require('../services/memoryStorage');
const messageRouter = require('../services/messageRouter');

// 检查数据库是否可用
let isDatabaseAvailable = true;

// 测试数据库连接
const testDatabaseConnection = async () => {
  try {
    await Message.findOne({}).exec();
    isDatabaseAvailable = true;
  } catch (error) {
    isDatabaseAvailable = false;
    console.warn('数据库不可用，使用内存存储');
  }
};

testDatabaseConnection();

// 发送消息
router.post('/send', async (req, res) => {
  try {
    const { sessionId, from, to, content, type = 'text' } = req.body;
    
    if (!sessionId || !from || !to || !content) {
      return res.status(400).json({ error: '会话ID、发送方、接收方和消息内容是必需的' });
    }

    // 验证会话是否存在
    let session;
    if (isDatabaseAvailable) {
      session = await Session.findById(sessionId);
    } else {
      session = memoryStorage.getSession(sessionId);
    }
    if (!session) {
      return res.status(404).json({ error: '会话不存在' });
    }

    // 验证发送方和接收方是否在会话中
    if (!session.agentIds.includes(from) || !session.agentIds.includes(to)) {
      return res.status(400).json({ error: '发送方或接收方不在会话中' });
    }

    // 准备消息数据
    const messageData = {
      sessionId,
      from,
      to,
      content,
      type,
      status: 'sent',
      metadata: {}
    };

    let message;
    if (isDatabaseAvailable) {
      // 使用数据库
      message = new Message(messageData);
      await message.save();
    } else {
      // 使用内存存储
      message = memoryStorage.createMessage(messageData);
    }

    // 更新会话的最后消息时间
    if (isDatabaseAvailable) {
      session.lastMessageAt = new Date();
      await session.save();
    } else {
      memoryStorage.updateSession(sessionId, { lastMessageAt: new Date() });
    }

    // 通过消息路由器发送消息
    const sendResult = await messageRouter.sendMessage(from, to, content);
    if (sendResult.success) {
      if (isDatabaseAvailable) {
        message.status = 'delivered';
        await message.save();
      } else {
        memoryStorage.updateMessage(message._id, { status: 'delivered' });
      }
    }

    res.status(201).json({
      success: true,
      message: {
        id: message._id,
        sessionId: message.sessionId,
        from: message.from,
        to: message.to,
        content: message.content,
        type: message.type,
        status: message.status,
        timestamp: message.createdAt
      }
    });
  } catch (error) {
    console.error('发送消息失败:', error);
    // 尝试使用内存存储
    try {
      const { sessionId, from, to, content, type = 'text' } = req.body;
      
      // 验证会话是否存在
      const session = memoryStorage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: '会话不存在' });
      }

      // 验证发送方和接收方是否在会话中
      if (!session.agentIds.includes(from) || !session.agentIds.includes(to)) {
        return res.status(400).json({ error: '发送方或接收方不在会话中' });
      }

      // 准备消息数据
      const messageData = {
        sessionId,
        from,
        to,
        content,
        type,
        status: 'sent',
        metadata: {}
      };

      const message = memoryStorage.createMessage(messageData);
      
      // 更新会话的最后消息时间
      memoryStorage.updateSession(sessionId, { lastMessageAt: new Date() });

      // 通过消息路由器发送消息
      const sendResult = await messageRouter.sendMessage(from, to, content);
      if (sendResult.success) {
        memoryStorage.updateMessage(message._id, { status: 'delivered' });
      }

      res.status(201).json({
        success: true,
        message: {
          id: message._id,
          sessionId: message.sessionId,
          from: message.from,
          to: message.to,
          content: message.content,
          type: message.type,
          status: message.status,
          timestamp: message.createdAt
        }
      });
    } catch (memoryError) {
      res.status(500).json({ error: '发送消息失败' });
    }
  }
});

// 发送会话广播消息
router.post('/broadcast', async (req, res) => {
  try {
    const { sessionId, from, content, type = 'text' } = req.body;
    
    if (!sessionId || !from || !content) {
      return res.status(400).json({ error: '会话ID、发送方和消息内容是必需的' });
    }

    // 验证会话是否存在
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: '会话不存在' });
    }

    // 验证发送方是否在会话中
    if (!session.agentIds.includes(from)) {
      return res.status(400).json({ error: '发送方不在会话中' });
    }

    // 广播消息
    const broadcastResult = messageRouter.broadcastToSession(sessionId, {
      from,
      content
    }, from);

    if (broadcastResult.success) {
      // 为每个接收方创建消息记录
      for (const agentId of session.agentIds) {
        if (agentId !== from) {
          const message = new Message({
            sessionId,
            from,
            to: agentId,
            content,
            type
          });
          await message.save();
        }
      }

      // 更新会话的最后消息时间
      session.lastMessageAt = new Date();
      await session.save();

      res.json({
        success: true,
        message: '消息已广播到会话中的所有Agent'
      });
    } else {
      res.status(400).json({ error: broadcastResult.error });
    }
  } catch (error) {
    console.error('广播消息失败:', error);
    res.status(500).json({ error: '广播消息失败' });
  }
});

// 获取消息历史
router.get('/history', async (req, res) => {
  try {
    const { sessionId, limit = 50, offset = 0 } = req.query;
    
    if (!sessionId) {
      return res.status(400).json({ error: '会话ID是必需的' });
    }

    let messages;
    if (isDatabaseAvailable) {
      messages = await Message.find({ sessionId })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset));
    } else {
      messages = memoryStorage.getMessagesBySessionId(sessionId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    }

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
    console.error('获取消息历史失败:', error);
    // 尝试使用内存存储
    try {
      const { sessionId, limit = 50, offset = 0 } = req.query;
      if (!sessionId) {
        return res.status(400).json({ error: '会话ID是必需的' });
      }
      const messages = memoryStorage.getMessagesBySessionId(sessionId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(parseInt(offset), parseInt(offset) + parseInt(limit));
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
    } catch (memoryError) {
      res.status(500).json({ error: '获取消息历史失败' });
    }
  }
});

// 更新消息状态
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['sent', 'delivered', 'read', 'failed'].includes(status)) {
      return res.status(400).json({ error: '无效的状态值' });
    }

    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: '消息不存在' });
    }

    message.status = status;
    await message.save();

    res.json({
      success: true,
      message: {
        id: message._id,
        status: message.status
      }
    });
  } catch (error) {
    console.error('更新消息状态失败:', error);
    res.status(500).json({ error: '更新消息状态失败' });
  }
});

module.exports = router;