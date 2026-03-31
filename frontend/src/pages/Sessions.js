import React, { useState, useEffect } from 'react';
import { Box, Heading, Button, Table, Thead, Tbody, Tr, Th, Td, Badge, IconButton, Flex, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, Select, MultiSelect } from '@chakra-ui/react';
import { Plus, Edit, Delete, MoreVertical } from 'lucide-react';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    agentIds: []
  });
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    // 模拟数据获取
    setTimeout(() => {
      setSessions([
        { id: 1, name: '会话 1', agentCount: 3, status: 'active', lastMessage: '2026-04-01 10:00' },
        { id: 2, name: '会话 2', agentCount: 2, status: 'closed', lastMessage: '2026-03-31 18:00' },
        { id: 3, name: '会话 3', agentCount: 4, status: 'active', lastMessage: '2026-04-01 09:30' },
        { id: 4, name: '会话 4', agentCount: 2, status: 'active', lastMessage: '2026-04-01 10:15' },
      ]);
      setAgents([
        { value: '1', label: 'Agent 1' },
        { value: '2', label: 'Agent 2' },
        { value: '3', label: 'Agent 3' },
        { value: '4', label: 'Agent 4' },
      ]);
    }, 500);
  }, []);

  const handleOpenModal = () => {
    setFormData({
      name: '',
      agentIds: []
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = () => {
    // 模拟提交
    console.log('Form submitted:', formData);
    setIsModalOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'blue';
      case 'closed': return 'gray';
      case 'archived': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb="6">
        <Heading size="lg">
          会话管理
        </Heading>
        <Button leftIcon={<Plus />} colorScheme="blue" onClick={handleOpenModal}>
          新建会话
        </Button>
      </Flex>
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>名称</Th>
              <Th>Agent数量</Th>
              <Th>状态</Th>
              <Th>最后消息</Th>
              <Th>操作</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sessions.map((session) => (
              <Tr key={session.id}>
                <Td>{session.name}</Td>
                <Td>{session.agentCount}</Td>
                <Td>
                  <Badge colorScheme={getStatusColor(session.status)}>
                    {session.status}
                  </Badge>
                </Td>
                <Td>{session.lastMessage}</Td>
                <Td>
                  <Flex spaceX="2">
                    <IconButton
                      aria-label="Edit"
                      icon={<Edit size={16} />}
                      variant="ghost"
                      size="sm"
                    />
                    <IconButton
                      aria-label="Delete"
                      icon={<Delete size={16} />}
                      variant="ghost"
                      size="sm"
                      colorScheme="red"
                    />
                    <IconButton
                      aria-label="More"
                      icon={<MoreVertical size={16} />}
                      variant="ghost"
                      size="sm"
                    />
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>新建会话</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box mb="4">
              <Text mb="2">会话名称</Text>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="会话名称"
              />
            </Box>
            <Box mb="4">
              <Text mb="2">选择Agent（至少2个）</Text>
              <MultiSelect
                options={agents}
                value={formData.agentIds}
                onChange={(value) => setFormData({ ...formData, agentIds: value })}
                placeholder="选择要加入会话的Agent"
              />
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr="3" onClick={handleCloseModal}>
              取消
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              创建
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Sessions;
