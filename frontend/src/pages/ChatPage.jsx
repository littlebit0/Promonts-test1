import { useEffect, useState, useRef } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { courseAPI } from '../services/api';
import axios from 'axios';

function ChatPage({ user }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadCourses();
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadMessages(selectedCourse);
      connectWebSocket(selectedCourse);
    }
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [selectedCourse]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      setCourses(response.data);
      if (response.data.length > 0) {
        setSelectedCourse(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const loadMessages = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/api/chat/courses/${courseId}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const connectWebSocket = (courseId) => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log('Connected to WebSocket');
        setConnected(true);
        client.subscribe(`/topic/course/${courseId}`, (message) => {
          const receivedMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, receivedMessage]);
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        setConnected(false);
      },
    });

    client.activate();
    stompClientRef.current = client;
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedCourse) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8080/api/chat/messages',
        {
          courseId: selectedCourse,
          content: newMessage,
          type: 'TEXT',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('ë©”ì‹œì§€ ì „ì†¡ì— ì‹¤íŒ¨í–ˆìŠµë‹ˆë‹¤.');
    }
  };

  if (courses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        ë“±ë¡ëœ ê°•ì˜ê°€ ì—†ìŠµë‹ˆë‹¤. ê°•ì˜ë¥¼ ë¨¼ì € ìƒì„±í•´ì£¼ì„¸ìš”.
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ì±„íŒ…</h1>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {connected ? 'ì—°ê²°ë¨' : 'ì—°ê²° ëŠê¹€'}
          </span>
        </div>
      </div>

      {/* Course Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <select
          value={selectedCourse || ''}
          onChange={(e) => setSelectedCourse(Number(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name} ({course.code})
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              ì±„íŒ… ë‚´ì—­ì´ ì—†ìŠµë‹ˆë‹¤. ì²« ë©”ì‹œì§€ë¥¼ ë³´ë‚´ë³´ì„¸ìš”!
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMyMessage = msg.sender?.email === user.email;
              return (
                <div
                  key={index}
                  className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isMyMessage
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    {!isMyMessage && (
                      <div className="text-xs opacity-70 mb-1">{msg.sender?.name}</div>
                    )}
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <div className={`text-xs mt-1 ${isMyMessage ? 'opacity-70' : 'opacity-50'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="border-t border-gray-200 dark:border-gray-700 p-4 flex gap-2 dark:bg-gray-800">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="ë©”ì‹œì§€ë¥¼ ìž…ë ¥í•˜ì„¸ìš”..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            disabled={!connected}
          />
          <button
            type="submit"
            disabled={!connected || !newMessage.trim()}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            ì „ì†¡
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatPage;



