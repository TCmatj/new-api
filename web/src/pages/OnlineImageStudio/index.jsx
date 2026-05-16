/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useEffect, useMemo, useState } from 'react';

const STORAGE_KEYS = {
  token: 'new-api.onlineImageStudio.token',
};

const DEFAULT_MODEL = 'gpt-image-2';
const DEFAULT_STUDIO_API_BASE = '/studio-api';
const IMAGE_FORMAT_OPTIONS = ['png', 'jpeg', 'webp'];
const SIZE_OPTIONS = [
  '1024x1024',
  '1024x1536',
  '1536x1024',
  '2048x2048',
  '3840x2160',
  '2160x3840',
];
const QUALITY_OPTIONS = ['auto', 'low', 'medium', 'high'];
const BACKGROUND_OPTIONS = ['auto', 'opaque', 'transparent'];
const COUNT_OPTIONS = [1, 2, 3, 4];

function prettyJson(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return String(value);
  }
}

function formatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getStatusTone(status) {
  if (status === 'success') {
    return { bg: 'rgba(34,197,94,.12)', color: '#15803d', border: 'rgba(34,197,94,.22)' };
  }
  if (status === 'failed') {
    return { bg: 'rgba(239,68,68,.12)', color: '#b91c1c', border: 'rgba(239,68,68,.22)' };
  }
  if (status === 'running' || status === 'pending') {
    return { bg: 'rgba(59,130,246,.12)', color: '#1d4ed8', border: 'rgba(59,130,246,.22)' };
  }
  return { bg: 'rgba(148,163,184,.12)', color: '#475569', border: 'rgba(148,163,184,.22)' };
}

function StatusBadge({ status }) {
  const tone = getStatusTone(status);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
        padding: '4px 10px',
        fontSize: 12,
        fontWeight: 700,
        background: tone.bg,
        color: tone.color,
        border: `1px solid ${tone.border}`,
      }}
    >
      {status || '-'}
    </span>
  );
}

function InfoBlock({ children, tone = 'default' }) {
  const toneMap = {
    default: { border: 'rgba(148,163,184,.22)', bg: 'rgba(248,250,252,.9)', color: '#334155' },
    info: { border: 'rgba(59,130,246,.22)', bg: 'rgba(239,246,255,.95)', color: '#1e3a8a' },
    danger: { border: 'rgba(239,68,68,.22)', bg: 'rgba(254,242,242,.96)', color: '#991b1b' },
  };
  const picked = toneMap[tone] || toneMap.default;
  return (
    <div
      style={{
        borderRadius: 18,
        border: `1px solid ${picked.border}`,
        background: picked.bg,
        color: picked.color,
        padding: 14,
        lineHeight: 1.7,
      }}
    >
      {children}
    </div>
  );
}

function buildConversationTitle(task) {
  const text = String(task?.prompt || '').trim();
  if (!text) return `任务 ${String(task?.id || '').slice(0, 8)}`;
  return text.length > 20 ? `${text.slice(0, 20)}...` : text;
}

function normalizeTask(task) {
  return {
    ...task,
    conversationTitle: buildConversationTitle(task),
  };
}

function OnlineImageStudio() {
  const [token, setToken] = useState('');
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [size, setSize] = useState('1024x1024');
  const [quality, setQuality] = useState('high');
  const [background, setBackground] = useState('auto');
  const [outputFormat, setOutputFormat] = useState('png');
  const [count, setCount] = useState(1);
  const [referenceImage, setReferenceImage] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [selectedTaskDetail, setSelectedTaskDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [pageError, setPageError] = useState('');
  const [composerOpen, setComposerOpen] = useState(true);

  useEffect(() => {
    try {
      setToken(localStorage.getItem(STORAGE_KEYS.token) || '');
    } catch (error) {
      console.error('load token failed', error);
    }
    void loadTasks(false);
  }, []);

  useEffect(() => {
    if (!selectedTaskId) return undefined;
    const timer = window.setInterval(() => {
      void loadTaskDetail(selectedTaskId, false);
      void loadTasks(false);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [selectedTaskId]);

  const normalizedTasks = useMemo(
    () => (Array.isArray(tasks) ? tasks.map((item) => normalizeTask(item)) : []),
    [tasks],
  );

  const selectedConversation = useMemo(() => {
    if (!selectedTaskId) return null;
    return normalizedTasks.find((task) => task.id === selectedTaskId) || null;
  }, [normalizedTasks, selectedTaskId]);

  function notify(nextMessage, isError = false) {
    if (isError) {
      setPageError(nextMessage);
      return;
    }
    setMessage(nextMessage);
    window.setTimeout(() => {
      setMessage((current) => (current === nextMessage ? '' : current));
    }, 2500);
  }

  async function parseJsonResponse(response) {
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (error) {
      data = { raw: text };
    }
    if (!response.ok || data?.success === false) {
      const msg =
        data?.message || data?.error?.message || data?.raw || text || `HTTP ${response.status}`;
      throw new Error(msg);
    }
    return data;
  }

  async function loadTasks(showMessage = false) {
    setRefreshing(true);
    try {
      const response = await fetch(`${DEFAULT_STUDIO_API_BASE}/api/tasks`, { cache: 'no-store' });
      const json = await parseJsonResponse(response);
      const nextTasks = Array.isArray(json?.data) ? json.data : [];
      setTasks(nextTasks);
      if (!selectedTaskId && nextTasks[0]?.id) {
        setSelectedTaskId(nextTasks[0].id);
        void loadTaskDetail(nextTasks[0].id, false);
      }
      if (showMessage) notify('会话列表已刷新');
    } catch (error) {
      notify(error.message || '加载任务失败', true);
    } finally {
      setRefreshing(false);
    }
  }

  async function loadTaskDetail(taskId, showMessage = false) {
    if (!taskId) return;
    try {
      const response = await fetch(`${DEFAULT_STUDIO_API_BASE}/api/tasks/${taskId}`, {
        cache: 'no-store',
      });
      const json = await parseJsonResponse(response);
      setSelectedTaskDetail(json?.data || null);
      if (showMessage) notify('会话详情已刷新');
    } catch (error) {
      notify(error.message || '加载任务详情失败', true);
    }
  }

  function persistToken(nextToken) {
    setToken(nextToken);
    try {
      localStorage.setItem(STORAGE_KEYS.token, nextToken);
    } catch (error) {
      console.error('save token failed', error);
    }
  }

  async function handleSubmit(mode) {
    setPageError('');
    if (!token.trim()) {
      notify('请先填写 token', true);
      return;
    }
    if (!prompt.trim()) {
      notify('请输入提示词', true);
      return;
    }
    if (mode === 'edit' && !referenceImage) {
      notify('图生图需要上传参考图片', true);
      return;
    }

    setLoading(true);
    try {
      let response;
      if (mode === 'edit') {
        const formData = new FormData();
        formData.append('token', token.trim());
        formData.append('prompt', prompt.trim());
        formData.append('model', model);
        formData.append('size', size);
        formData.append('quality', quality);
        formData.append('background', background);
        formData.append('output_format', outputFormat);
        formData.append('n', String(count));
        formData.append('image', referenceImage);
        response = await fetch(`${DEFAULT_STUDIO_API_BASE}/api/tasks/image-edits`, {
          method: 'POST',
          body: formData,
        });
      } else {
        response = await fetch(`${DEFAULT_STUDIO_API_BASE}/api/tasks/image-generations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: token.trim(),
            prompt: prompt.trim(),
            model,
            size,
            quality,
            background,
            output_format: outputFormat,
            n: count,
          }),
        });
      }

      const json = await parseJsonResponse(response);
      const task = json?.data;
      if (task?.id) {
        setSelectedTaskId(task.id);
        setPrompt('');
        setReferenceImage(null);
        notify('新会话已创建');
        await loadTasks(false);
        await loadTaskDetail(task.id, false);
      } else {
        await loadTasks(false);
      }
    } catch (error) {
      notify(error.message || '创建任务失败', true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='online-image-chat-page'>
      <style>{`
        .online-image-chat-page {
          display: grid;
          gap: 20px;
          min-height: calc(100vh - 120px);
        }
        .online-image-chat-shell {
          display: grid;
          grid-template-columns: 300px minmax(0, 1fr);
          gap: 18px;
          min-height: calc(100vh - 180px);
        }
        .online-image-chat-card {
          background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(248,250,252,.94));
          border: 1px solid rgba(148,163,184,.16);
          border-radius: 26px;
          box-shadow: 0 18px 40px rgba(15,23,42,.05);
          overflow: hidden;
        }
        .online-image-chat-sidebar {
          display: grid;
          grid-template-rows: auto 1fr auto;
          min-height: 100%;
        }
        .online-image-chat-sidebar-header,
        .online-image-chat-main-header {
          padding: 18px 18px 14px;
          border-bottom: 1px solid rgba(148,163,184,.12);
        }
        .online-image-chat-sidebar-title,
        .online-image-chat-main-title {
          margin: 0;
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
        }
        .online-image-chat-subtitle {
          margin-top: 6px;
          font-size: 13px;
          color: #64748b;
          line-height: 1.6;
        }
        .online-image-chat-list {
          padding: 14px;
          overflow: auto;
          display: grid;
          gap: 10px;
        }
        .online-image-chat-list-item {
          width: 100%;
          text-align: left;
          border: 1px solid rgba(148,163,184,.16);
          background: rgba(255,255,255,.84);
          border-radius: 18px;
          padding: 14px;
          cursor: pointer;
          transition: all .18s ease;
        }
        .online-image-chat-list-item:hover {
          transform: translateY(-1px);
          border-color: rgba(59,130,246,.26);
          box-shadow: 0 8px 20px rgba(15,23,42,.06);
        }
        .online-image-chat-list-item.active {
          border-color: rgba(37,99,235,.34);
          background: linear-gradient(180deg, rgba(239,246,255,.96), rgba(255,255,255,.94));
          box-shadow: 0 12px 26px rgba(37,99,235,.08);
        }
        .online-image-chat-list-top {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: center;
          margin-bottom: 8px;
        }
        .online-image-chat-list-title {
          font-weight: 800;
          color: #0f172a;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .online-image-chat-list-meta {
          font-size: 12px;
          color: #64748b;
          line-height: 1.6;
        }
        .online-image-chat-sidebar-footer {
          padding: 14px;
          border-top: 1px solid rgba(148,163,184,.12);
        }
        .online-image-chat-refresh {
          width: 100%;
        }
        .online-image-chat-main {
          display: grid;
          grid-template-rows: auto 1fr auto;
          min-height: 100%;
        }
        .online-image-chat-main-body {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 330px;
          min-height: 0;
        }
        .online-image-chat-stream {
          padding: 20px;
          overflow: auto;
          display: grid;
          gap: 16px;
          align-content: start;
          background:
            radial-gradient(circle at top left, rgba(59,130,246,.08), transparent 32%),
            linear-gradient(180deg, rgba(248,250,252,.7), rgba(255,255,255,.92));
        }
        .online-image-chat-empty {
          border: 1px dashed rgba(148,163,184,.2);
          background: rgba(255,255,255,.72);
          border-radius: 22px;
          padding: 28px;
          color: #64748b;
          line-height: 1.8;
        }
        .online-image-chat-bubble-user,
        .online-image-chat-bubble-assistant {
          max-width: min(820px, 100%);
          border-radius: 24px;
          padding: 16px 18px;
          box-shadow: 0 10px 24px rgba(15,23,42,.05);
          border: 1px solid rgba(148,163,184,.14);
        }
        .online-image-chat-bubble-user {
          justify-self: end;
          background: linear-gradient(135deg, #2563eb, #0ea5e9);
          color: #fff;
          border-top-right-radius: 8px;
        }
        .online-image-chat-bubble-assistant {
          justify-self: start;
          background: rgba(255,255,255,.95);
          color: #0f172a;
          border-top-left-radius: 8px;
        }
        .online-image-chat-bubble-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
          font-size: 12px;
          font-weight: 700;
        }
        .online-image-chat-bubble-text {
          white-space: pre-wrap;
          line-height: 1.8;
          word-break: break-word;
        }
        .online-image-chat-result-image {
          width: 100%;
          display: block;
          border-radius: 18px;
          margin-top: 14px;
          border: 1px solid rgba(148,163,184,.16);
          background: #fff;
        }
        .online-image-chat-right {
          border-left: 1px solid rgba(148,163,184,.12);
          padding: 18px;
          overflow: auto;
          display: grid;
          gap: 14px;
          align-content: start;
          background: rgba(248,250,252,.6);
        }
        .online-image-chat-section {
          display: grid;
          gap: 8px;
        }
        .online-image-chat-label {
          font-size: 12px;
          font-weight: 700;
          color: #475569;
        }
        .online-image-chat-input,
        .online-image-chat-select,
        .online-image-chat-textarea {
          width: 100%;
          box-sizing: border-box;
          border-radius: 14px;
          border: 1px solid rgba(148,163,184,.22);
          background: rgba(255,255,255,.92);
          color: #0f172a;
          padding: 11px 12px;
          outline: none;
          transition: all .18s ease;
          font-size: 14px;
        }
        .online-image-chat-input:focus,
        .online-image-chat-select:focus,
        .online-image-chat-textarea:focus {
          border-color: rgba(37,99,235,.42);
          box-shadow: 0 0 0 4px rgba(37,99,235,.08);
        }
        .online-image-chat-textarea {
          min-height: 110px;
          resize: vertical;
          line-height: 1.7;
        }
        .online-image-chat-row2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }
        .online-image-chat-compose {
          padding: 16px 18px 18px;
          border-top: 1px solid rgba(148,163,184,.12);
          background: rgba(255,255,255,.92);
        }
        .online-image-chat-compose-box {
          border: 1px solid rgba(148,163,184,.16);
          border-radius: 22px;
          background: linear-gradient(180deg, rgba(255,255,255,.98), rgba(248,250,252,.94));
          box-shadow: inset 0 1px 0 rgba(255,255,255,.6), 0 10px 24px rgba(15,23,42,.04);
          padding: 14px;
          display: grid;
          gap: 12px;
        }
        .online-image-chat-compose-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
        }
        .online-image-chat-compose-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .online-image-chat-btn {
          appearance: none;
          border-radius: 14px;
          min-height: 42px;
          padding: 0 16px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all .18s ease;
        }
        .online-image-chat-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(15,23,42,.08);
        }
        .online-image-chat-btn:disabled {
          opacity: .58;
          cursor: not-allowed;
        }
        .online-image-chat-btn-primary {
          border: 1px solid rgba(37,99,235,.3);
          color: #fff;
          background: linear-gradient(135deg, #2563eb, #0ea5e9);
        }
        .online-image-chat-btn-secondary {
          border: 1px solid rgba(148,163,184,.22);
          color: #0f172a;
          background: #fff;
        }
        .online-image-chat-token-line {
          font-size: 12px;
          color: #64748b;
          line-height: 1.7;
        }
        .online-image-chat-json {
          margin: 0;
          overflow: auto;
          border-radius: 18px;
          background: #0f172a;
          padding: 14px;
          color: #dbeafe;
          font-size: 12px;
          line-height: 1.65;
          white-space: pre-wrap;
          word-break: break-word;
        }
        @media (max-width: 1180px) {
          .online-image-chat-shell {
            grid-template-columns: 1fr;
          }
          .online-image-chat-main-body {
            grid-template-columns: 1fr;
          }
          .online-image-chat-right {
            border-left: none;
            border-top: 1px solid rgba(148,163,184,.12);
          }
        }
        @media (max-width: 768px) {
          .online-image-chat-row2 {
            grid-template-columns: 1fr;
          }
          .online-image-chat-compose-top,
          .online-image-chat-compose-actions {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>

      {message ? <InfoBlock tone='info'>{message}</InfoBlock> : null}
      {pageError ? <InfoBlock tone='danger'>{pageError}</InfoBlock> : null}

      <div className='online-image-chat-shell'>
        <div className='online-image-chat-card online-image-chat-sidebar'>
          <div className='online-image-chat-sidebar-header'>
            <h3 className='online-image-chat-sidebar-title'>绘图会话</h3>
            <div className='online-image-chat-subtitle'>按对话形式查看最近生成记录。</div>
          </div>

          <div className='online-image-chat-list'>
            {normalizedTasks.length === 0 ? (
              <div className='online-image-chat-empty'>还没有会话。先在右侧发起一条绘图消息。</div>
            ) : (
              normalizedTasks.map((task) => (
                <button
                  key={task.id}
                  type='button'
                  className={`online-image-chat-list-item${selectedTaskId === task.id ? ' active' : ''}`}
                  onClick={() => {
                    setSelectedTaskId(task.id);
                    void loadTaskDetail(task.id, false);
                  }}
                >
                  <div className='online-image-chat-list-top'>
                    <div className='online-image-chat-list-title' title={task.conversationTitle}>
                      {task.conversationTitle}
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                  <div className='online-image-chat-list-meta'>
                    {task.type || 'generation'} · {task.model || DEFAULT_MODEL}
                    <br />
                    {formatTime(task.created_at)}
                  </div>
                </button>
              ))
            )}
          </div>

          <div className='online-image-chat-sidebar-footer'>
            <button
              type='button'
              className='online-image-chat-btn online-image-chat-btn-secondary online-image-chat-refresh'
              onClick={() => loadTasks(true)}
              disabled={refreshing}
            >
              {refreshing ? '刷新中...' : '刷新会话'}
            </button>
          </div>
        </div>

        <div className='online-image-chat-card online-image-chat-main'>
          <div className='online-image-chat-main-header'>
            <h3 className='online-image-chat-main-title'>在线绘图对话</h3>
            <div className='online-image-chat-subtitle'>像聊天一样发起绘图请求，并在同一工作区查看结果与细节。</div>
          </div>

          <div className='online-image-chat-main-body'>
            <div className='online-image-chat-stream'>
              {!selectedConversation ? (
                <div className='online-image-chat-empty'>
                  这里会像对话一样显示你的提示词、任务状态、生成结果和错误信息。
                </div>
              ) : (
                <>
                  <div className='online-image-chat-bubble-user'>
                    <div className='online-image-chat-bubble-title'>
                      <span>你</span>
                      <span>{formatTime(selectedConversation.created_at)}</span>
                    </div>
                    <div className='online-image-chat-bubble-text'>{selectedConversation.prompt || '-'}</div>
                  </div>

                  <div className='online-image-chat-bubble-assistant'>
                    <div className='online-image-chat-bubble-title'>
                      <span>绘图工作区</span>
                      <StatusBadge status={selectedTaskDetail?.status || selectedConversation.status} />
                    </div>
                    <div className='online-image-chat-bubble-text'>
                      {selectedTaskDetail?.error
                        ? selectedTaskDetail.error
                        : selectedTaskDetail?.status === 'success'
                          ? '图像已生成完成。'
                          : selectedTaskDetail?.status === 'failed'
                            ? '本次任务执行失败。'
                            : '任务正在处理中，请稍候。'}
                    </div>
                    {(selectedTaskDetail?.image_url || selectedConversation.image_url) ? (
                      <img
                        src={selectedTaskDetail?.image_url || selectedConversation.image_url}
                        alt='生成结果'
                        className='online-image-chat-result-image'
                      />
                    ) : null}
                  </div>
                </>
              )}
            </div>

            <div className='online-image-chat-right'>
              <div className='online-image-chat-section'>
                <div className='online-image-chat-label'>Token</div>
                <input
                  type='password'
                  className='online-image-chat-input'
                  value={token}
                  onChange={(event) => persistToken(event.target.value)}
                  placeholder='输入 token'
                />
                <div className='online-image-chat-token-line'>Token 仅保存在当前浏览器 localStorage。</div>
              </div>

              <div className='online-image-chat-section'>
                <div className='online-image-chat-label'>模型与参数</div>
                <div className='online-image-chat-row2'>
                  <select value={model} onChange={(event) => setModel(event.target.value)} className='online-image-chat-select'>
                    <option value={DEFAULT_MODEL}>{DEFAULT_MODEL}</option>
                  </select>
                  <select value={size} onChange={(event) => setSize(event.target.value)} className='online-image-chat-select'>
                    {SIZE_OPTIONS.map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                  <select value={quality} onChange={(event) => setQuality(event.target.value)} className='online-image-chat-select'>
                    {QUALITY_OPTIONS.map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                  <select value={background} onChange={(event) => setBackground(event.target.value)} className='online-image-chat-select'>
                    {BACKGROUND_OPTIONS.map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                  <select value={outputFormat} onChange={(event) => setOutputFormat(event.target.value)} className='online-image-chat-select'>
                    {IMAGE_FORMAT_OPTIONS.map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                  <select value={String(count)} onChange={(event) => setCount(Number(event.target.value))} className='online-image-chat-select'>
                    {COUNT_OPTIONS.map((value) => (
                      <option key={value} value={String(value)}>{String(value)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className='online-image-chat-section'>
                <div className='online-image-chat-label'>参考图片（图生图）</div>
                <input
                  type='file'
                  accept='image/*'
                  onChange={(event) => setReferenceImage(event.target.files?.[0] || null)}
                />
                <div className='online-image-chat-token-line'>
                  {referenceImage ? `已选择：${referenceImage.name}` : '未上传时默认文生图。'}
                </div>
              </div>

              {selectedTaskDetail ? (
                <div className='online-image-chat-section'>
                  <div className='online-image-chat-label'>原始返回</div>
                  <pre className='online-image-chat-json'>
                    {prettyJson(selectedTaskDetail.response_raw || selectedTaskDetail)}
                  </pre>
                </div>
              ) : null}
            </div>
          </div>

          <div className='online-image-chat-compose'>
            <div className='online-image-chat-compose-box'>
              <div className='online-image-chat-compose-top'>
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>发送一条绘图消息</div>
                  <div className='online-image-chat-subtitle' style={{ marginTop: 4 }}>
                    这里更像对话输入框：写 prompt，提交后在上方看到结果。
                  </div>
                </div>
                <button
                  type='button'
                  className='online-image-chat-btn online-image-chat-btn-secondary'
                  onClick={() => setComposerOpen((value) => !value)}
                >
                  {composerOpen ? '收起高级参数' : '展开高级参数'}
                </button>
              </div>

              <textarea
                className='online-image-chat-textarea'
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder='描述你想生成或编辑的画面...'
              />

              {composerOpen ? (
                <div className='online-image-chat-token-line'>
                  当前参数：{model} · {size} · {quality} · {background} · {outputFormat} · {count} 张
                </div>
              ) : null}

              <div className='online-image-chat-compose-actions'>
                <button
                  type='button'
                  className='online-image-chat-btn online-image-chat-btn-primary'
                  disabled={loading}
                  onClick={() => handleSubmit('generation')}
                >
                  {loading ? '处理中...' : '发送文生图'}
                </button>
                <button
                  type='button'
                  className='online-image-chat-btn online-image-chat-btn-secondary'
                  disabled={loading}
                  onClick={() => handleSubmit('edit')}
                >
                  {loading ? '处理中...' : '发送图生图'}
                </button>
                {selectedTaskId ? (
                  <button
                    type='button'
                    className='online-image-chat-btn online-image-chat-btn-secondary'
                    onClick={() => loadTaskDetail(selectedTaskId, true)}
                  >
                    刷新当前会话
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnlineImageStudio;
