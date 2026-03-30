import { useEffect, useState, useRef } from 'react';
import { MessageCircle, Send, Paperclip, X, FileText, Download, Hash, Users } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { courseAPI, chatAPI } from '../services/api';

const SERVER_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace('/api', '');

function ChatPage({ user }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadCourses();
    return () => { stompClientRef.current?.deactivate(); };
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadMessages(selectedCourse.id);
      connectWebSocket(selectedCourse.id);
    }
    return () => { stompClientRef.current?.deactivate(); };
  }, [selectedCourse]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadCourses = async () => {
    try {
      const res = await courseAPI.getAll();
      setCourses(res.data);
      if (res.data.length > 0) setSelectedCourse(res.data[0]);
    } catch (e) { console.error(e); }
  };

  const loadMessages = async (courseId) => {
    setLoadingMessages(true);
    try {
      const res = await chatAPI.getMessages(courseId);
      const data = Array.isArray(res.data) ? res.data : [];
      // 최신순 정렬 (desc로 오면 reverse)
      setMessages(data[0]?.createdAt > data[data.length - 1]?.createdAt ? [...data].reverse() : data);
    } catch (e) { console.error(e); }
    finally { setLoadingMessages(false); }
  };

  const connectWebSocket = (courseId) => {
    stompClientRef.current?.deactivate();
    const token = localStorage.getItem('token');
    const socket = new SockJS(`${SERVER_BASE}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/course/${courseId}`, (msg) => {
          setMessages(prev => [...prev, JSON.parse(msg.body)]);
        });
      },
      onStompError: () => setConnected(false),
      onDisconnect: () => setConnected(false),
    });
    client.activate();
    stompClientRef.current = client;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { alert('파일 크기는 20MB 이하여야 합니다.'); return; }
    const isImage = file.type.startsWith('image/');
    setAttachedFile({ file, preview: isImage ? URL.createObjectURL(file) : null, isImage });
    e.target.value = '';
  };

  const removeAttachedFile = () => {
    if (attachedFile?.preview) URL.revokeObjectURL(attachedFile.preview);
    setAttachedFile(null);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachedFile) || !selectedCourse) return;

    try {
      let fileUrl = null, fileName = null, fileSize = null, type = 'TEXT';

      if (attachedFile) {
        setAttachedFile(prev => ({ ...prev, uploading: true }));
        const formData = new FormData();
        formData.append('file', attachedFile.file);
        const uploadRes = await chatAPI.uploadFile(formData);
        fileUrl = uploadRes.data.fileUrl;
        fileName = uploadRes.data.fileName;
        fileSize = uploadRes.data.fileSize;
        type = attachedFile.isImage ? 'IMAGE' : 'FILE';
      }

      await chatAPI.sendMessage({
        courseId: selectedCourse.id,
        content: newMessage.trim() || fileName || '파일',
        type,
        fileUrl,
        fileName,
        fileSize,
      });

      setNewMessage('');
      removeAttachedFile();
    } catch (err) {
      console.error(err);
      alert('메시지 전송에 실패했습니다: ' + (err.response?.data?.error || err.message));
      setAttachedFile(prev => prev ? { ...prev, uploading: false } : null);
    }
  };

  const selectedCourseData = courses.find(c => c.id === selectedCourse?.id);

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">

      {/* ── 좌측: 채팅 목록 ── */}
      <div className="w-64 shrink-0 bg-gray-900 dark:bg-gray-950 flex flex-col">
        {/* 헤더 */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <MessageCircle className="w-5 h-5 text-primary-400" />
            채팅
          </div>
        </div>

        {/* 강의 목록 */}
        <div className="flex-1 overflow-y-auto py-2">
          {courses.length === 0 ? (
            <p className="text-gray-500 text-sm text-center px-4 py-6">등록된 강의가 없습니다</p>
          ) : (
            <>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider px-4 mb-2">강의 채팅</p>
              {courses.map(course => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all group ${
                    selectedCourse?.id === course.id
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  <Hash className="w-4 h-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{course.name}</p>
                    <p className="text-xs text-gray-500 truncate">{course.code}</p>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>

        {/* 유저 정보 */}
        <div className="p-3 border-t border-gray-700 bg-gray-850 flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user.name?.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user.name}</p>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-gray-500'}`} />
              <span className="text-xs text-gray-400">{connected ? '온라인' : '연결 중...'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 우측: 채팅창 ── */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 min-w-0">
        {!selectedCourse ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p>강의를 선택해 채팅을 시작하세요</p>
            </div>
          </div>
        ) : (
          <>
            {/* 채팅 헤더 */}
            <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <Hash className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{selectedCourse?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{selectedCourse?.code}</p>
              </div>
              <div className="ml-auto flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span className="text-xs">강의 채팅</span>
              </div>
            </div>

            {/* 메시지 목록 */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {loadingMessages ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>첫 메시지를 보내보세요!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.sender?.email === user.email;
                  const showName = !isMe && (idx === 0 || messages[idx - 1]?.sender?.email !== msg.sender?.email);
                  return (
                    <div key={idx} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                      {/* 아바타 */}
                      {!isMe && (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 self-end ${showName ? '' : 'opacity-0'}`}
                          style={{ backgroundColor: `hsl(${(msg.sender?.name?.charCodeAt(0) || 0) * 30 % 360}, 60%, 50%)` }}>
                          {msg.sender?.name?.charAt(0)}
                        </div>
                      )}

                      <div className={`max-w-[65%] space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        {showName && !isMe && (
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 px-1">{msg.sender?.name}</span>
                        )}

                        <div className={`rounded-2xl px-4 py-2.5 ${
                          isMe
                            ? 'bg-primary-600 text-white rounded-br-sm'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm'
                        }`}>
                          {/* 이미지 */}
                          {msg.type === 'IMAGE' && msg.fileUrl && (
                            <img src={`${SERVER_BASE}${msg.fileUrl}`} alt={msg.fileName}
                              className="max-w-xs max-h-60 rounded-lg object-contain cursor-pointer mb-1"
                              onClick={() => window.open(`${SERVER_BASE}${msg.fileUrl}`, '_blank')} />
                          )}

                          {/* 파일 */}
                          {msg.type === 'FILE' && msg.fileUrl && (
                            <a href={`${SERVER_BASE}${msg.fileUrl}`} download={msg.fileName} target="_blank" rel="noreferrer"
                              className={`flex items-center gap-2 p-2 rounded-lg mb-1 transition ${isMe ? 'bg-primary-700 hover:bg-primary-800' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300'}`}>
                              <FileText className="w-5 h-5 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate max-w-[160px]">{msg.fileName}</p>
                                {msg.fileSize && <p className="text-xs opacity-70">{formatFileSize(msg.fileSize)}</p>}
                              </div>
                              <Download className="w-4 h-4 shrink-0 opacity-70" />
                            </a>
                          )}

                          {/* 텍스트 */}
                          {(msg.type === 'TEXT' || !msg.fileUrl || (msg.content !== msg.fileName)) && (
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          )}
                        </div>

                        <span className={`text-xs text-gray-400 dark:text-gray-500 px-1 ${isMe ? 'text-right' : ''}`}>
                          {new Date(msg.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 파일 미리보기 */}
            {attachedFile && (
              <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <div className="flex items-center gap-3 p-2 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                  {attachedFile.isImage
                    ? <img src={attachedFile.preview} alt="" className="w-12 h-12 object-cover rounded-lg" />
                    : <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/40 rounded-lg flex items-center justify-center"><FileText className="w-6 h-6 text-primary-600" /></div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{attachedFile.file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(attachedFile.file.size)}{attachedFile.uploading ? ' · 업로드 중...' : ''}</p>
                  </div>
                  <button onClick={removeAttachedFile} disabled={attachedFile.uploading} className="p-1 text-gray-400 hover:text-gray-600 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 입력창 */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-end gap-2">
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.hwp" />
              <button type="button" onClick={() => fileInputRef.current?.click()}
                disabled={!connected || attachedFile?.uploading}
                className="p-2.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition disabled:opacity-40 shrink-0" title="파일 첨부">
                <Paperclip className="w-5 h-5" />
              </button>
              <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                placeholder={attachedFile ? '메시지 추가 (선택)...' : '메시지 입력...'}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm outline-none"
                disabled={!connected || attachedFile?.uploading} />
              <button type="submit"
                disabled={!connected || attachedFile?.uploading || (!newMessage.trim() && !attachedFile)}
                className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed shrink-0">
                <Send className="w-5 h-5" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ChatPage;
