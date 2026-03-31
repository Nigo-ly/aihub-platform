import React, { useState, useEffect } from 'react';
import { Box, Heading, Button, Table, Thead, Tbody, Tr, Th, Td, Badge, IconButton, Flex, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, Select, useDisclosure, FormControl, FormLabel, useToast } from '@chakra-ui/react';
import { Plus, Edit, Delete, RefreshCw } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingAgent, setEditingAgent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'openclaw',
    endpoint: ''
  });
  const toast = useToast();

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/agents`);
      setAgents(res.data.agents || []);
    } catch (err) {
      console.error('获取Agent列表失败:', err);
      toast({
        title: '获取失败',
        description: '无法连接到服务器',
        status: 'error',
        duration: 3000
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleOpenModal = (agent = null) => {
    if (agent) {
      setEditingAgent(agent);
      setFormData({
        name: agent.name,
        type: agent.type,
        endpoint: agent.endpoint || ''
      });
    } else {
      setEditingAgent(null);
      setFormData({
        name: '',
        type: 'openclaw',
        endpoint: ''
      });
    }
    onOpen();
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: '名称不能为空',
        status: 'warning',
        duration: 2000
      });
      return;
    }

    try {
      if (editingAgent) {
        // 编辑模式（暂时用注册API代替更新）
        await axios.post(`${API_BASE_URL}/api/agents/register`, {
          ...formData,
          userId: editingAgent.userId || 'default'
        });
      } else {
        await axios.post(`${API_BASE_URL}/api/agents/register`, formData);
      }
      toast({
        title: editingAgent ? '更新成功' : '创建成功',
        status: 'success',
        duration: 2000
      });
      onClose();
      fetchAgents();
    } catch (err) {
      toast({
        title: '操作失败',
        description: err.message,
        status: 'error',
        duration: 3000
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'green';
      case 'offline': return 'gray';
      case 'busy': return 'yellow';
      default: return 'gray';
    }
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb="6">
        <Heading size="lg">Agent管理</Heading>
        <Flex gap="2">
          <Button leftIcon={<RefreshCw size={16} />} variant="ghost" onClick={fetchAgents} isLoading={loading}>
            刷新
          </Button>
          <Button leftIcon={<Plus size={16} />} colorScheme="blue" onClick={() => handleOpenModal()}>
            新建Agent
          </Button>
        </Flex>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>名称</Th>
              <Th>类型</Th>
              <Th>状态</Th>
              <Th>最后在线</Th>
              <Th>操作</Th>
            </Tr>
          </Thead>
          <Tbody>
            {agents.length === 0 ? (
              <Tr>
                <Td colSpan="6" textAlign="center" py="8">
                  <Text color="gray.500">暂无Agent，点击"新建Agent"添加</Text>
                </Td>
              </Tr>
            ) : (
              agents.map((agent) => (
                <Tr key={agent.id}>
                  <Td>{agent.id}</Td>
                  <Td>{agent.name}</Td>
                  <Td>{agent.type}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(agent.status)}>
                      {agent.status || 'offline'}
                    </Badge>
                  </Td>
                  <Td>{agent.lastSeen || '-'}</Td>
                  <Td>
                    <Flex gap="1">
                      <IconButton
                        aria-label="编辑"
                        icon={<Edit size={16} />}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(agent)}
                      />
                    </Flex>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingAgent ? '编辑Agent' : '新建Agent'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb="4">
              <FormLabel>名称</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Agent名称"
              />
            </FormControl>
            <FormControl mb="4">
              <FormLabel>类型</FormLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="openclaw">OpenClaw</option>
                <option value="autogen">AutoGen</option>
                <option value="crewai">CrewAI</option>
                <option value="custom">自定义</option>
              </Select>
            </FormControl>
            <FormControl mb="4">
              <FormLabel>端点</FormLabel>
              <Input
                value={formData.endpoint}
                onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                placeholder="http://localhost:4010"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr="3" onClick={onClose}>取消</Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              {editingAgent ? '更新' : '创建'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Agents;
