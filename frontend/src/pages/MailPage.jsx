import { useState, useEffect, useCallback } from 'react';
import {
  Mail, Send, Inbox, Trash2, RefreshCw, Plus, X,
  ChevronLeft, Paperclip, AlertCircle
} from 'lucide-react';
import { mailAPI } from '../services/api';
import { PageSkeleton } from '../components/LoadingSkeleton';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export default function MailPage() {
  const [tab, setTab] = useState('inbox'); // 'inbox' | 'sent'
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [connected, setConnected] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [compose, setCompose] = useState({ to: '', subject: '', body: '' });
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  // ms=linked 파라미터 감지 + status 확인
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('ms') === 'linked') {
      const url = new URL(window.location.href);
      url.searchParams.delete('ms');
      window.history.replaceState({}, '', url.toString());
    }

    mailAPI.status()
      .then((res) => {
        console.log('[MailPage] status res:', res);
        const connected = typeof res === 'object' && res !== null
          ? (res.connected ?? false)
          : Boolean(res);
        setConnected(connected);
      })
      .catch((e) => {
        console.error('[MailPage] status error:', e);
        setConnected(false);
      });
  }, []);

  // 메시지 목록 로드
  const loadMessages = useCallback(async () => {
    setLoading(true);
    setSelected(null);
    setDetail(null);
    try {
      const data = tab === 'inbox'
        ? await mailAPI.getInbox()
        : await mailAPI.getSent();
      setMessages(data || []);
    } catch (e) {
      console.error('loadMessages error', e);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    if (connected === true) loadMessages();
  }, [connected, tab, loadMessages]);

  // 메일 열기
  const openMessage = async (msg) => {
    setSelected(msg.id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const data = await mailAPI.getMessage(msg.id);
      setDetail(data);
      if (!msg.isRead) {
        await mailAPI.markAsRead(msg.id).catch(() => {});
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m))
        );
      }
    } catch (e) {
      console.error('openMessage error', e);
    } finally {
      setDetailLoading(false);
    }
  };

  // 메일 삭제
  const deleteMail = async (id, e) => {
    e?.stopPropagation();
    try {
      await mailAPI.deleteMail(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selected === id) {
        setSelected(null);
        setDetail(null);
      }
    } catch (e) {
      console.error('deleteMail error', e);
    }
  };

  // 메일 발송
  const handleSend = async () => {
    if (!compose.to || !compose.subject) return;
    setSending(true);
    setSendResult(null);
    try {
      await mailAPI.sendMail(compose);
      setSendResult('success');
      setCompose({ to: '', subject: '', body: '' });
      setTimeout(() => {
        setShowCompose(false);
        setSendResult(null);
      }, 1200);
    } catch (e) {
      console.error('handleSend error', e);
      setSendResult('error');
    } finally {
      setSending(false);
    }
  };

  // MS 연동 핸들러
  const handleMSConnect = () => {
    sessionStorage.setItem('ms_link_return', '/mail');
    const token = localStorage.getItem('token') || '';
    window.location.href = `${BACKEND_URL}/api/ms/connect?token=${token}&returnTo=/oauth2/linked`;
  };

  // ── 로딩 중 ──
  if (connected === null) return <PageSkeleton />;

  // ── MS 미연동 ──
  if (connected === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8">
        <AlertCircle className="w-16 h-16 text-yellow-500" />
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Microsoft 계정 연동이 필요합니다</h2>
          <p className="text-gray-500">Outlook 메일을 사용하려면 Microsoft 계정을 연결해주세요.</p>
        </div>
        <button
          onClick={handleMSConnect}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <Mail className="w-5 h-5" />
          Microsoft 계정 연동하기
        </button>
      </div>
    );
  }

  // ── 메인 메일 UI ──
  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <Mail className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-bold">Outlook 메일</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowCompose(true); setSendResult(null); }}
            className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            새 메일
          </button>
          <button
            onClick={loadMessages}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
            title="새로고침"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex border-b">
        <button
          onClick={() => setTab('inbox')}
          className={`flex items-center gap-1 px-5 py-3 text-sm font-medium border-b-2 transition ${
            tab === 'inbox'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Inbox className="w-4 h-4" />
          받은편지함
        </button>
        <button
          onClick={() => setTab('sent')}
          className={`flex items-center gap-1 px-5 py-3 text-sm font-medium border-b-2 transition ${
            tab === 'sent'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Send className="w-4 h-4" />
          보낸편지함
        </button>
      </div>

      {/* 2분할 레이아웃 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 메일 목록 */}
        <div className="w-80 flex-shrink-0 border-r overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">불러오는 중...</div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">메일이 없습니다.</div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => openMessage(msg)}
                className={`flex flex-col gap-1 px-4 py-3 border-b cursor-pointer hover:bg-gray-50 transition ${
                  selected === msg.id ? 'bg-blue-50' : ''
                } ${!msg.isRead ? 'font-semibold' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm truncate max-w-[160px]">
                    {tab === 'inbox' ? msg.from?.name || msg.from?.address : msg.to?.[0]?.name || msg.to?.[0]?.address}
                  </span>
                  <div className="flex items-center gap-1">
                    {!msg.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                    )}
                    <button
                      onClick={(e) => deleteMail(msg.id, e)}
                      className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition"
                      title="삭제"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <span className="text-sm truncate text-gray-800">{msg.subject}</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 truncate max-w-[160px]">{msg.preview || msg.bodyPreview}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-1">
                    {msg.receivedAt || msg.sentAt
                      ? new Date(msg.receivedAt || msg.sentAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
                      : ''}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 메일 상세 */}
        <div className="flex-1 overflow-y-auto p-6">
          {detailLoading ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">불러오는 중...</div>
          ) : !detail ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-3">
              <Mail className="w-12 h-12" />
              <span className="text-sm">메일을 선택하세요</span>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-xl font-bold mb-3">{detail.subject}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b">
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <span>{detail.from?.name || detail.from?.address}</span>
                </div>
                {detail.receivedAt || detail.sentAt ? (
                  <span>
                    {new Date(detail.receivedAt || detail.sentAt).toLocaleString('ko-KR')}
                  </span>
                ) : null}
                {detail.hasAttachments && (
                  <span className="flex items-center gap-1">
                    <Paperclip className="w-4 h-4" />
                    첨부파일 있음
                  </span>
                )}
              </div>
              {detail.bodyHtml ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: detail.bodyHtml }}
                />
              ) : (
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">{detail.body}</pre>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 새 메일 작성 모달 */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">새 메일 작성</h3>
              <button
                onClick={() => { setShowCompose(false); setSendResult(null); }}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="email"
              placeholder="받는 사람 (이메일)"
              value={compose.to}
              onChange={(e) => setCompose((p) => ({ ...p, to: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              placeholder="제목"
              value={compose.subject}
              onChange={(e) => setCompose((p) => ({ ...p, subject: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />
            <textarea
              placeholder="내용을 입력하세요..."
              value={compose.body}
              onChange={(e) => setCompose((p) => ({ ...p, body: e.target.value }))}
              rows={8}
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />

            {sendResult === 'success' && (
              <p className="text-green-600 text-sm font-medium">✓ 메일이 발송되었습니다.</p>
            )}
            {sendResult === 'error' && (
              <p className="text-red-500 text-sm font-medium">발송에 실패했습니다. 다시 시도해주세요.</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowCompose(false); setSendResult(null); }}
                className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50 transition"
              >
                취소
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !compose.to || !compose.subject}
                className="flex items-center gap-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
              >
                <Send className="w-4 h-4" />
                {sending ? '발송 중...' : '발송'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
