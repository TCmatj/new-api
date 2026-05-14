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
import {
  Banner,
  Button,
  Card,
  Input,
  Select,
  Space,
  Spin,
  Tag,
  Toast,
  Typography,
} from '@douyinfe/semi-ui';

const { Title, Text } = Typography;

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
  return JSON.stringify(value, null, 2);
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
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [selectedTaskDetail, setSelectedTaskDetail] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEYS.token) || '';
    setToken(savedToken);
    void loadTasks(false);
  }, []);

  useEffect(() => {
    if (!selectedTaskId) return undefined;
    const timer = window.setInterval(() => {
      void loadTaskDetail(selectedTaskId, false);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [selectedTaskId]);

  const taskOptions = useMemo(
    () => tasks.map((task) => ({ label: `${task.status} · ${task.prompt || task.id}`, value: task.id })),
    [tasks],
  );

  async function parseJsonResponse(response) {
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (error) {
      data = { raw: text };
    }
    if (!response.ok || data?.success === false) {
      const message = data?.message || data?.error?.message || text || `HTTP ${response.status}`;
      throw new Error(message);
    }
    return data;
  }

  async function loadTasks(showToast = false) {
    setRefreshing(true);
    try {
      const response = await fetch(`${DEFAULT_STUDIO_API_BASE}/api/tasks`, {
        cache: 'no-store',
      });
      const json = await parseJsonResponse(response);
      const nextTasks = Array.isArray(json?.data) ? json.data : [];
      setTasks(nextTasks);
      if (!selectedTaskId && nextTasks[0]?.id) {
        setSelectedTaskId(nextTasks[0].id);
        void loadTaskDetail(nextTasks[0].id, false);
      }
      if (showToast) {
        Toast.success('已刷新在线绘图任务');
      }
    } catch (error) {
      Toast.error(error.message || '加载任务失败');
    } finally {
      setRefreshing(false);
    }
  }

  async function loadTaskDetail(taskId, showToast = false) {
    if (!taskId) return;
    try {
      const response = await fetch(`${DEFAULT_STUDIO_API_BASE}/api/tasks/${taskId}`, {
        cache: 'no-store',
      });
      const json = await parseJsonResponse(response);
      setSelectedTaskDetail(json?.data || null);
      if (showToast) {
        Toast.success('已刷新任务详情');
      }
    } catch (error) {
      Toast.error(error.message || '加载任务详情失败');
    }
  }

  function persistToken(nextToken) {
    setToken(nextToken);
    localStorage.setItem(STORAGE_KEYS.token, nextToken);
  }

  async function handleSubmit(mode) {
    if (!token.trim()) {
      Toast.error('请先填写 token，并确保它已加入 Image2 分组');
      return;
    }
    if (!prompt.trim()) {
      Toast.error('请输入提示词');
      return;
    }
    if (mode === 'edit' && !referenceImage) {
      Toast.error('图生图需要上传参考图片');
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
          headers: {
            'Content-Type': 'application/json',
          },
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
        Toast.success(`任务已创建：${task.id}`);
        await loadTasks(false);
        await loadTaskDetail(task.id, false);
      } else {
        Toast.success('任务已创建');
        await loadTasks(false);
      }
    } catch (error) {
      Toast.error(error.message || '创建任务失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='w-full space-y-6'>
      <div>
        <Title heading={3}>在线绘图台</Title>
        <Text type='secondary'>
          这个页面通过本地 image-studio 服务代理调用 new-api 的 Image2 绘图接口。
          计费、分组与渠道选择仍由 new-api 完成；图片结果由在线绘图台保存 7 天。
        </Text>
      </div>

      <Banner
        type='warning'
        bordered
        fullMode={false}
        description='请使用已加入 Image2 分组的 token。若 token 不在可用分组内，将直接返回后端报错。'
      />

      <div className='grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]'>
        <Card bordered>
          <Space vertical align='start' spacing='medium' style={{ width: '100%' }}>
            <div style={{ width: '100%' }}>
              <Text strong>Token</Text>
              <Input
                mode='password'
                value={token}
                onChange={persistToken}
                placeholder='请输入已加入 Image2 分组的 token'
                showClear
              />
              <Text type='tertiary' size='small'>
                约束方案 A：请自行确保 token 已在对应分组内；若无权限，页面将直接展示 new-api 返回的错误。
              </Text>
            </div>

            <div style={{ width: '100%' }}>
              <Text strong>Prompt</Text>
              <Input.TextArea
                value={prompt}
                onChange={setPrompt}
                autosize={{ minRows: 5, maxRows: 12 }}
                placeholder='描述你想生成或编辑的画面...'
              />
            </div>

            <div className='grid gap-4 md:grid-cols-2' style={{ width: '100%' }}>
              <div>
                <Text strong>Model</Text>
                <Select value={model} onChange={setModel} optionList={[{ label: DEFAULT_MODEL, value: DEFAULT_MODEL }]} />
              </div>
              <div>
                <Text strong>尺寸</Text>
                <Select value={size} onChange={setSize} optionList={SIZE_OPTIONS.map((value) => ({ label: value, value }))} />
              </div>
              <div>
                <Text strong>质量</Text>
                <Select value={quality} onChange={setQuality} optionList={QUALITY_OPTIONS.map((value) => ({ label: value, value }))} />
              </div>
              <div>
                <Text strong>背景</Text>
                <Select value={background} onChange={setBackground} optionList={BACKGROUND_OPTIONS.map((value) => ({ label: value, value }))} />
              </div>
              <div>
                <Text strong>格式</Text>
                <Select value={outputFormat} onChange={setOutputFormat} optionList={IMAGE_FORMAT_OPTIONS.map((value) => ({ label: value, value }))} />
              </div>
              <div>
                <Text strong>数量</Text>
                <Select value={count} onChange={setCount} optionList={COUNT_OPTIONS.map((value) => ({ label: String(value), value }))} />
              </div>
            </div>

            <div style={{ width: '100%' }}>
              <Text strong>参考图片（图生图）</Text>
              <input
                type='file'
                accept='image/*'
                onChange={(event) => setReferenceImage(event.target.files?.[0] || null)}
              />
              {referenceImage ? (
                <Text type='secondary' size='small'>已选择：{referenceImage.name}</Text>
              ) : (
                <Text type='tertiary' size='small'>不上传则默认走文生图。</Text>
              )}
            </div>

            <Space>
              <Button theme='solid' loading={loading} onClick={() => handleSubmit('generation')}>
                创建文生图任务
              </Button>
              <Button theme='light' loading={loading} onClick={() => handleSubmit('edit')}>
                创建图生图任务
              </Button>
            </Space>
          </Space>
        </Card>

        <Space vertical align='start' spacing='medium' style={{ width: '100%' }}>
          <Card bordered style={{ width: '100%' }}>
            <Space vertical align='start' spacing='small' style={{ width: '100%' }}>
              <div className='flex items-center justify-between w-full'>
                <Title heading={5} style={{ margin: 0 }}>最近任务</Title>
                <Button theme='borderless' loading={refreshing} onClick={() => loadTasks(true)}>刷新</Button>
              </div>
              {tasks.length === 0 ? (
                <Text type='tertiary'>还没有在线绘图任务。</Text>
              ) : (
                <div className='space-y-3 w-full'>
                  {tasks.map((task) => (
                    <Card
                      key={task.id}
                      shadows='hover'
                      bodyStyle={{ padding: 12, cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        void loadTaskDetail(task.id, false);
                      }}
                      style={{
                        border: selectedTaskId === task.id ? '1px solid var(--semi-color-primary)' : undefined,
                      }}
                    >
                      <div className='flex items-center justify-between gap-3'>
                        <Text strong ellipsis={{ showTooltip: true }} style={{ maxWidth: 220 }}>
                          {task.prompt || task.id}
                        </Text>
                        <Tag color={task.status === 'success' ? 'green' : task.status === 'failed' ? 'red' : 'blue'}>
                          {task.status}
                        </Tag>
                      </div>
                      <Text type='tertiary' size='small'>
                        {task.type} · {task.model} · {task.created_at}
                      </Text>
                    </Card>
                  ))}
                </div>
              )}
            </Space>
          </Card>

          <Card bordered style={{ width: '100%' }}>
            <Space vertical align='start' spacing='small' style={{ width: '100%' }}>
              <div className='flex items-center justify-between w-full'>
                <Title heading={5} style={{ margin: 0 }}>任务详情</Title>
                {selectedTaskId ? (
                  <Button theme='borderless' onClick={() => loadTaskDetail(selectedTaskId, true)}>刷新详情</Button>
                ) : null}
              </div>
              {!selectedTaskId ? (
                <Text type='tertiary'>选择一个任务查看详情。</Text>
              ) : !selectedTaskDetail ? (
                <Spin spinning />
              ) : (
                <Space vertical align='start' spacing='medium' style={{ width: '100%' }}>
                  <div className='flex flex-wrap gap-2'>
                    <Tag>{selectedTaskDetail.type}</Tag>
                    <Tag color={selectedTaskDetail.status === 'success' ? 'green' : selectedTaskDetail.status === 'failed' ? 'red' : 'blue'}>
                      {selectedTaskDetail.status}
                    </Tag>
                    <Tag>{selectedTaskDetail.model}</Tag>
                  </div>

                  <div className='w-full rounded-2xl border border-[var(--semi-color-info-light-default)] bg-[var(--semi-color-info-light-default)] p-4'>
                    <Text strong>Prompt</Text>
                    <div className='mt-2 whitespace-pre-wrap text-sm'>
                      {selectedTaskDetail.prompt || '-'}
                    </div>
                  </div>

                  {selectedTaskDetail.error ? (
                    <div className='w-full rounded-2xl border border-[var(--semi-color-danger-light-default)] bg-[var(--semi-color-danger-light-default)] p-4'>
                      <Text strong>错误信息</Text>
                      <div className='mt-2 whitespace-pre-wrap text-sm'>
                        {selectedTaskDetail.error}
                      </div>
                    </div>
                  ) : null}

                  {selectedTaskDetail.image_url ? (
                    <div style={{ width: '100%' }}>
                      <img
                        src={selectedTaskDetail.image_url}
                        alt='生成结果'
                        style={{ width: '100%', borderRadius: 16, display: 'block' }}
                      />
                    </div>
                  ) : (
                    <Text type='tertiary'>当前还没有结果图片。</Text>
                  )}

                  <div style={{ width: '100%' }}>
                    <Text strong>原始返回</Text>
                    <pre className='overflow-auto rounded-2xl bg-slate-900 p-4 text-xs text-slate-100'>
                      {prettyJson(selectedTaskDetail.response_raw || selectedTaskDetail)}
                    </pre>
                  </div>
                </Space>
              )}
            </Space>
          </Card>
        </Space>
      </div>
    </div>
  );
}

export default OnlineImageStudio;
