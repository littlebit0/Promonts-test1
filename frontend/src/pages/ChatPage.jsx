import { useEffect, useState, useRef } from 'react';
import { MessageCircle, Send, Paperclip, X, FileText, Image, Download } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { courseAPI } from '../services/api';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const SERVER_BASE = API_BASE.replace('/api', '');

function ChatPage({ user }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null); // { file, preview, uploading }
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadCourses();
    return () => {
      if (stompClientRef.current) stompClientRef.current.deactivate();
    };
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadMessages(selectedCourse);
      connectWebSocket(selectedCourse);
    }
    return () => {
      if (stompClientRef.current) stompClientRef.current.deactivate();
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
      if (response.data.length > 0) setSelectedCourse(response.data[0].id);
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const loadMessages = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE}/chat/courses/${courseId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(response.data.reverse ? response.data.reverse() : response.data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const connectWebSocket = (courseId) => {
    if (stompClientRef.current) stompClientRef.current.deactivate();
    const socket = new SockJS(`${SERVER_BASE}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/course/${courseId}`, (message) => {
          const receivedMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, receivedMessage]);
        });
      },
      onStompError: () => setConnected(false),
      onDisconnect: () => setConnected(false),
    });
    client.activate();
    stompClientRef.current = client;
  };

  // 파일 선택 처리
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert('파일 크기는 20MB 이하여야 합니다.');
      return;
    }
    const isImage = file.type.startsWith('image/');
    const preview = isImage ? URL.createObjectURL(file) : null;
    setAttachedFile({ file, preview, isImage, uploading: false });
    e.target.value = '';
  };

  const removeAttachedFile = () => {
    if (attachedFile?.preview) URL.revokeObjectURL(attachedFile.preview);
    setAttachedFile(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  // 메시지 전송
  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachedFile) || !selectedCourse) return;

    try {
      const token = localStorage.getItem('token');
      let fileUrl = null, fileName = null, fileSize = null, type = 'TEXT';

      // 파일 업로드
      if (attachedFile) {
        setAttachedFile(prev => ({ ...prev, uploading: true }));
        const formData = new FormData();
        formData.append('file', attachedFile.file);
        const uploadRes = await axios.post(`${API_BASE}/chat/upload`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        fileUrl = uploadRes.data.fileUrl;
        fileName = uploadRes.data.fileName;
        fileSize = uploadRes.data.fileSize;
        type = attachedFile.isImage ? 'IMAGE' : 'FILE';
      }

      await axios.post(
        `${API_BASE}/chat/messages`,
        {
          courseId: selectedCourse,
          content: newMessage.trim() || (fileName || '파일'),
          type,
          fileUrl,
          fileName,
          fileSize,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNewMessage('');
      removeAttachedFile();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('메시지 전송에 실패했습니다: ' + (error.response?.data?.error || error.message));
      setAttachedFile(prev => prev ? { ...prev, uploading: false } : null);
    }
  };

  if (courses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        등록된 강의가 없습니다. 강의를 먼저 생성해주세요.
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col space-y-4">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageCircle className="w-8 h-8 text-blue-600" />
          채팅
        </h1>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {connected ? '연결됨' : '연결 끊김'}
          </span>
        </div>
      </div>

      {/* 강의 선택 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <select
          value={selectedCourse || ''}
          onChange={(e) => setSelectedCourse(Number(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name} ({course.code})
            </option>
          ))}
        </select>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              채팅 내역이 없습니다. 첫 메시지를 보내보세요!
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMyMessage = msg.sender?.email === user.email;
              return (
                <div key={index} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isMyMessage
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm'
                  }`}>
                    {!isMyMessage && (
                      <div className="text-xs font-semibold mb-1 opacity-70">{msg.sender?.name}</div>
                    )}

                    {/* 이미지 메시지 */}
                    {msg.type === 'IMAGE' && msg.fileUrl && (
                      <div className="mb-1">
                        <img
                          src={`${SERVER_BASE}${msg.fileUrl}`}
                          alt={msg.fileName || '이미지'}
                          className="max-w-xs max-h-60 rounded-lg object-contain cursor-pointer"
                          onClick={() => window.open(`${SERVER_BASE}${msg.fileUrl}`, '_blank')}
                        />
                      </div>
                    )}

                    {/* 파일 메시지 */}
                    {msg.type === 'FILE' && msg.fileUrl && (
                      <a
                        href={`${SERVER_BASE}${msg.fileUrl}`}
                        download={msg.fileName}
                        target="_blank"
                        rel="noreferrer"
                        className={`flex items-center gap-2 p-2 rounded-lg mb-1 transition ${
                          isMyMessage
                            ? 'bg-blue-700 hover:bg-blue-800'
                            : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                      >
                        <FileText className="w-5 h-5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate max-w-[180px]">{msg.fileName}</p>
                          {msg.fileSize && (
                            <p className="text-xs opacity-70">{formatFileSize(msg.fileSize)}</p>
                          )}
                        </div>
                        <Download className="w-4 h-4 flex-shrink-0 opacity-70" />
                      </a>
                    )}

                    {/* 텍스트 내용 (파일 첨부 시 텍스트도 있으면 표시) */}
                    {(msg.type === 'TEXT' || (msg.fileUrl && msg.content !== msg.fileName)) && (
                      <p className="whitespace-pre-wrap break-words text-sm">{msg.content}</p>
                    )}

                    <div className={`text-xs mt-1 ${isMyMessage ? 'opacity-70 text-right' : 'opacity-50'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 파일 미리보기 영역 */}
        {attachedFile && (
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
            <div className="flex items-center gap-3 p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              {attachedFile.isImage ? (
                <img src={attachedFile.preview} alt="preview" className="w-12 h-12 object-cover rounded" />
              ) : (
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {attachedFile.file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(attachedFile.file.size)}
                  {attachedFile.uploading && ' · 업로드 중...'}
                </p>
              </div>
              <button
                onClick={removeAttachedFile}
                disabled={attachedFile.uploading}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 입력창 */}
        <form onSubmit={sendMessage} className="border-t border-gray-200 dark:border-gray-700 p-3 flex items-end gap-2">
          {/* 파일 첨부 버튼 */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.hwp"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!connected || attachedFile?.uploading}
            className="p-2.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            title="파일 첨부"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={attachedFile ? '메시지 추가 (선택)...' : '메시지를 입력하세요...'}
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
            disabled={!connected || attachedFile?.uploading}
          />
          <button
            type="submit"
            disabled={!connected || attachedFile?.uploading || (!newMessage.trim() && !attachedFile)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm font-medium flex-shrink-0"
          >
            <Send className="w-4 h-4" />
            {attachedFile?.uploading ? '전송 중...' : '전송'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatPage;
