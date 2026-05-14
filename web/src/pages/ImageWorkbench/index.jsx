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

import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  Tabs,
  TabPane,
  Typography,
  Toast,
  Tag,
  Space,
} from '@douyinfe/semi-ui';

const { Title, Text } = Typography;

const STORAGE_KEYS = {
  token: 'new-api.imageWorkbench.token',
  baseUrl: 'new-api.imageWorkbench.baseUrl',
};

const DEFAULT_IMAGE_MODEL = 'gpt-image-2';
const DEFAULT_OPTIMIZE_MODEL = 'gpt-5.4';

const IMAGE_FORMAT_OPTIONS = ['png', 'jpeg', 'webp'];
const SIZE_OPTIONS = [
  'auto',
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

function defaultBaseUrl() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'https://newapi.matc2025.click';
}

function normalizeBaseUrl(value) {
  return String(value || '')
    .trim()
    .replace(/\/+$/, '');
}

function mimeFromFormat(format) {
  const value = (format || 'png').toLowerCase();
  if (value === 'jpg' || value === 'jpeg') return 'image/jpeg';
  if (value === 'webp') return 'image/webp';
  return 'image/png';
}

function extensionFromFormat(format) {
  return (format || 'png').toLowerCase() === 'jpeg'
    ? 'jpg'
    : (format || 'png').toLowerCase();
}

function prettyJson(value) {
  return JSON.stringify(value, null, 2);
}

async function parseJsonResponse(response) {
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch (error) {
    body = { raw: text };
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
  }
  return body;
}

function appendOptionalNumber(target, key, value) {
  if (value !== '' && value !== null && value !== undefined) {
    target[key] = Number(value);
  }
}

function getDecodedImageSrc(item, format) {
  if (item?.url) return item.url;
  if (item?.b64_json) {
    return `data:${mimeFromFormat(format)};base64,${item.b64_json}`;
  }
  return '';
}

function extractMessageContent(json) {
  const message = json?.choices?.[0]?.message;
  const content = message?.content;
  if (Array.isArray(content)) {
    return content
      .map((part) => part?.text || part?.content || '')
      .join('\n')
      .trim();
  }
  return String(content || '').trim();
}

function buildPromptOptimizeSystemPrompt() {
  return `Role: 新时代数字艺术策展人 & AI 绘画提示词专家

Task: 将用户的原始创意片段转化为富有艺术感染力且技术可实现的 AI 绘画提示词。

Workflow:

意境勾勒 (The Vision): 在生成提示词前，先用一段 100 字以内的优美中文，如散文般描绘出画面应有的氛围、情感和视觉冲击力。

提示词补全 (The Prompt):

忠于原意: 严格保留用户提到的核心元素，不随意增删主体。

专业修饰: 仅从艺术家的角度进行“保守补齐”，包括：

光影: 丁达尔效应、伦勃朗光、全局照明、环境光散射。

构图: 黄金分割、极简主义留白、深景深/浅景深、低角度仰拍。

材质: 细腻的皮肤纹理、丝绸质感、电影级颗粒感、高动态范围 (HDR)。

风格适配: 若用户指定了艺术风格，则深入挖掘该风格的标志性元素进行融合。

Output Format:
【画面意境描述】
[富有诗意的中文描述]

【优化后的提示词 (English)】
[Masterpiece, high-quality, professional prompt...]`;
}

function parsePromptOptimizeOutput(text) {
  const value = String(text || '').trim();
  const chineseTitle = '【画面意境描述】';
  const englishTitle = '【优化后的提示词 (English)】';
  const chineseIndex = value.indexOf(chineseTitle);
  const englishIndex = value.indexOf(englishTitle);
  if (chineseIndex >= 0 && englishIndex >= 0) {
    return {
      chinese: value.slice(chineseIndex + chineseTitle.length, englishIndex).trim(),
      english: value.slice(englishIndex + englishTitle.length).trim(),
    };
  }
  if (englishIndex >= 0) {
    return {
      chinese: '',
      english: value.slice(englishIndex + englishTitle.length).trim(),
    };
  }
  return { chinese: '', english: value };
}

function buildPromptOptimizeMeta(json) {
  const usage = json?.usage || {};
  const choice = json?.choices?.[0] || {};
  const promptDetails = usage.prompt_tokens_details || {};
  const completionDetails = usage.completion_tokens_details || {};
  return [
    `model: ${json?.model || '-'}`,
    `finish_reason: ${choice.finish_reason || choice.native_finish_reason || '-'}`,
    `prompt_tokens: ${usage.prompt_tokens ?? '-'}`,
    `completion_tokens: ${usage.completion_tokens ?? '-'}`,
    `total_tokens: ${usage.total_tokens ?? '-'}`,
    `cached_tokens: ${promptDetails.cached_tokens ?? '-'}`,
    `reasoning_tokens: ${completionDetails.reasoning_tokens ?? '-'}`,
  ].join('\n');
}

function PromptResult({ result, rawJson, onUse }) {
  if (!result && !rawJson) return null;

  const chinese = result?.chinese || '未解析到中文意境描述。';
  const english = result?.english || '未解析到英文优化提示词。';

  return (
    <div className='image-workbench-prompt-result'>
      <div className='image-workbench-prompt-box'>
        <div className='image-workbench-prompt-title'>响应信息</div>
        <pre>{buildPromptOptimizeMeta(rawJson)}</pre>
      </div>
      <div className='image-workbench-prompt-box'>
        <div className='image-workbench-prompt-title'>画面意境描述</div>
        <pre>{chinese}</pre>
      </div>
      <div className='image-workbench-prompt-box'>
        <div className='image-workbench-prompt-title'>优化后的提示词 (English)</div>
        <pre>{english}</pre>
      </div>
      <div className='image-workbench-actions'>
        <Button
          theme='outline'
          disabled={!result?.chinese}
          onClick={() => onUse(result?.chinese || '')}
        >
          使用中文意境描述
        </Button>
        <Button disabled={!result?.english} onClick={() => onUse(result?.english || '')}>
          使用英文优化提示词
        </Button>
        <Button
          theme='outline'
          disabled={!result?.english}
          onClick={async () => {
            if (!result?.english) return;
            try {
              await navigator.clipboard.writeText(result.english);
              Toast.success('已复制英文优化提示词');
            } catch (error) {
              Toast.error('复制失败，请手动复制');
            }
          }}
        >
          复制英文优化提示词
        </Button>
      </div>
    </div>
  );
}

function ParsedMeta({ response }) {
  const data = Array.isArray(response?.data) ? response.data : [];
  const fields = [
    ['图片数量', data.length],
    ['created', response?.created],
    ['output_format', response?.output_format],
    ['size', response?.size],
    ['quality', response?.quality],
    ['background', response?.background],
    ['usage', response?.usage ? JSON.stringify(response.usage) : undefined],
  ].filter(([, value]) => value !== undefined && value !== null && value !== '');

  if (fields.length === 0 && data.every((item) => !item?.revised_prompt)) {
    return <Text type='tertiary'>暂无解析结果</Text>;
  }

  return (
    <div className='image-workbench-meta-list'>
      {fields.map(([label, value]) => (
        <div key={label} className='image-workbench-meta-item'>
          <span className='image-workbench-meta-label'>{label}</span>
          <span className='image-workbench-meta-value'>{String(value)}</span>
        </div>
      ))}
      {data.map((item, index) => {
        if (!item?.revised_prompt) return null;
        return (
          <div key={`revised-${index}`} className='image-workbench-meta-item'>
            <span className='image-workbench-meta-label'>{`data[${index}].revised_prompt`}</span>
            <span className='image-workbench-meta-value'>{item.revised_prompt}</span>
          </div>
        );
      })}
    </div>
  );
}

function ImageGallery({ items, format, prefix, onPreview }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <Text type='tertiary'>暂无图片结果</Text>;
  }

  return (
    <div className='image-workbench-gallery'>
      {items.map((item, index) => {
        const src = getDecodedImageSrc(item, format);
        if (!src) return null;
        return (
          <div key={`${prefix}-${index}`} className='image-workbench-image-card'>
            <div className='image-workbench-image-topbar'>
              <Tag color='blue'>{`${prefix} #${index + 1}`}</Tag>
              {item?.revised_prompt ? <Tag color='cyan'>revised prompt</Tag> : null}
            </div>
            <button
              type='button'
              className='image-workbench-image-button'
              onClick={() => onPreview(src, `${prefix}-${index + 1}`)}
            >
              <img src={src} alt={`${prefix}-${index + 1}`} />
            </button>
            <div className='image-workbench-image-actions'>
              <a
                href={src}
                download={`${prefix}-${Date.now()}-${index + 1}.${extensionFromFormat(format)}`}
                className='image-workbench-download-link'
              >
                下载图片
              </a>
            </div>
            {item?.revised_prompt ? (
              <div className='image-workbench-revised-prompt'>
                <div className='image-workbench-section-title'>revised_prompt</div>
                <div>{item.revised_prompt}</div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

const ImageWorkbench = () => {
  const { t } = useTranslation();
  const [baseUrl, setBaseUrl] = useState(
    localStorage.getItem(STORAGE_KEYS.baseUrl) || defaultBaseUrl(),
  );
  const [token, setToken] = useState(localStorage.getItem(STORAGE_KEYS.token) || '');
  const [tokenStatus, setTokenStatus] = useState('');
  const [activeTab, setActiveTab] = useState('generate');
  const [preview, setPreview] = useState({ open: false, src: '', alt: '' });

  const [generateForm, setGenerateForm] = useState({
    model: DEFAULT_IMAGE_MODEL,
    prompt: '',
    output_format: 'png',
    size: 'auto',
    quality: 'auto',
    background: 'auto',
    output_compression: '',
    n: 1,
  });
  const [editForm, setEditForm] = useState({
    model: DEFAULT_IMAGE_MODEL,
    prompt: '',
    output_format: 'png',
    size: 'auto',
    quality: 'auto',
    background: 'auto',
    output_compression: '',
    n: 1,
  });

  const [generateOptimizeModel, setGenerateOptimizeModel] = useState(DEFAULT_OPTIMIZE_MODEL);
  const [editOptimizeModel, setEditOptimizeModel] = useState(DEFAULT_OPTIMIZE_MODEL);
  const [generateOptimizeStatus, setGenerateOptimizeStatus] = useState('');
  const [editOptimizeStatus, setEditOptimizeStatus] = useState('');
  const [generateOptimizeResult, setGenerateOptimizeResult] = useState(null);
  const [editOptimizeResult, setEditOptimizeResult] = useState(null);
  const [generateOptimizeRaw, setGenerateOptimizeRaw] = useState(null);
  const [editOptimizeRaw, setEditOptimizeRaw] = useState(null);

  const [generateLoading, setGenerateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [generateStatus, setGenerateStatus] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [generateRaw, setGenerateRaw] = useState('暂无响应');
  const [editRaw, setEditRaw] = useState('暂无响应');
  const [generateResponse, setGenerateResponse] = useState(null);
  const [editResponse, setEditResponse] = useState(null);
  const [editImages, setEditImages] = useState([]);
  const [editMask, setEditMask] = useState(null);

  const generateItems = useMemo(
    () => (Array.isArray(generateResponse?.data) ? generateResponse.data : []),
    [generateResponse],
  );
  const editItems = useMemo(
    () => (Array.isArray(editResponse?.data) ? editResponse.data : []),
    [editResponse],
  );

  const saveSettings = () => {
    localStorage.setItem(STORAGE_KEYS.baseUrl, normalizeBaseUrl(baseUrl));
    localStorage.setItem(STORAGE_KEYS.token, token.trim());
    setTokenStatus('配置已保存');
    Toast.success('配置已保存');
  };

  const clearToken = () => {
    localStorage.removeItem(STORAGE_KEYS.token);
    setToken('');
    setTokenStatus('Token 已清除');
    Toast.success('Token 已清除');
  };

  const getConfig = () => {
    const normalizedBaseUrl = normalizeBaseUrl(baseUrl || defaultBaseUrl());
    const trimmedToken = token.trim();
    if (!trimmedToken) {
      throw new Error('请先输入 token');
    }
    if (!normalizedBaseUrl) {
      throw new Error('请先输入 API Base URL');
    }
    localStorage.setItem(STORAGE_KEYS.baseUrl, normalizedBaseUrl);
    return { baseUrl: normalizedBaseUrl, token: trimmedToken };
  };

  const authHeaders = (authToken) => ({
    Authorization: `Bearer ${authToken}`,
  });

  const optimizePrompt = async ({ prompt, model, setStatus, setResult, setRaw, onUse }) => {
    if (!String(prompt || '').trim()) {
      setStatus('请先输入待优化提示词');
      return;
    }

    try {
      const { baseUrl: currentBaseUrl, token: currentToken } = getConfig();
      setStatus('提示词优化请求中...');
      setResult(null);
      setRaw(null);

      const response = await fetch(`${currentBaseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          ...authHeaders(currentToken),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || DEFAULT_OPTIMIZE_MODEL,
          stream: false,
          messages: [
            { role: 'system', content: buildPromptOptimizeSystemPrompt() },
            { role: 'user', content: `待优化的提示词：\n${prompt}` },
          ],
        }),
      });

      const json = await parseJsonResponse(response);
      const content = extractMessageContent(json);
      if (!content) {
        throw new Error('模型未返回可解析内容');
      }
      const parsed = parsePromptOptimizeOutput(content);
      setResult(parsed);
      setRaw(json);
      setStatus('提示词优化完成');
      if (typeof onUse === 'function') {
        onUse(parsed);
      }
    } catch (error) {
      setStatus(String(error.message || error));
    }
  };

  const handleGenerate = async (event) => {
    event.preventDefault();

    try {
      if (!generateForm.prompt.trim()) {
        throw new Error('请输入提示词');
      }

      const { baseUrl: currentBaseUrl, token: currentToken } = getConfig();
      const body = {
        model: generateForm.model.trim() || DEFAULT_IMAGE_MODEL,
        prompt: generateForm.prompt.trim(),
        response_format: 'b64_json',
        output_format: generateForm.output_format,
        size: generateForm.size,
        quality: generateForm.quality,
        background: generateForm.background,
        n: Number(generateForm.n) || 1,
      };
      appendOptionalNumber(body, 'output_compression', generateForm.output_compression);

      setGenerateLoading(true);
      setGenerateStatus('图片生成请求中...');
      setGenerateRaw('请求中...');
      setGenerateResponse(null);

      const response = await fetch(`${currentBaseUrl}/v1/images/generations`, {
        method: 'POST',
        headers: {
          ...authHeaders(currentToken),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const json = await parseJsonResponse(response);
      setGenerateRaw(prettyJson(json));
      setGenerateResponse(json);
      setGenerateStatus('图片生成完成');
    } catch (error) {
      setGenerateRaw(String(error.message || error));
      setGenerateStatus(String(error.message || error));
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleEdit = async (event) => {
    event.preventDefault();

    try {
      if (!editForm.prompt.trim()) {
        throw new Error('请输入提示词');
      }
      if (!editImages.length) {
        throw new Error('请选择至少一张待编辑图片');
      }

      const { baseUrl: currentBaseUrl, token: currentToken } = getConfig();
      const formData = new FormData();
      formData.append('model', editForm.model.trim() || DEFAULT_IMAGE_MODEL);
      formData.append('prompt', editForm.prompt.trim());
      formData.append('response_format', 'b64_json');
      formData.append('output_format', editForm.output_format);
      formData.append('size', editForm.size);
      formData.append('quality', editForm.quality);
      formData.append('background', editForm.background);
      formData.append('n', String(Number(editForm.n) || 1));
      if (editForm.output_compression !== '') {
        formData.append('output_compression', String(Number(editForm.output_compression)));
      }
      editImages.forEach((file) => formData.append('image', file));
      if (editMask) {
        formData.append('mask', editMask);
      }

      setEditLoading(true);
      setEditStatus('图片编辑请求中...');
      setEditRaw('请求中...');
      setEditResponse(null);

      const response = await fetch(`${currentBaseUrl}/v1/images/edits`, {
        method: 'POST',
        headers: authHeaders(currentToken),
        body: formData,
      });
      const json = await parseJsonResponse(response);
      setEditRaw(prettyJson(json));
      setEditResponse(json);
      setEditStatus('图片编辑完成');
    } catch (error) {
      setEditRaw(String(error.message || error));
      setEditStatus(String(error.message || error));
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className='image-workbench-page'>
      <style>{`
        .image-workbench-page {
          display: grid;
          gap: 20px;
        }
        .image-workbench-card {
          border-radius: 22px;
          overflow: hidden;
        }
        .image-workbench-toolbar,
        .image-workbench-form-grid,
        .image-workbench-row,
        .image-workbench-actions,
        .image-workbench-url-list,
        .image-workbench-image-actions,
        .image-workbench-image-topbar {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .image-workbench-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .image-workbench-field {
          display: grid;
          gap: 8px;
        }
        .image-workbench-field.full {
          grid-column: 1 / -1;
        }
        .image-workbench-label {
          font-size: 13px;
          font-weight: 700;
          color: var(--semi-color-text-1);
        }
        .image-workbench-input,
        .image-workbench-textarea,
        .image-workbench-select,
        .image-workbench-file {
          width: 100%;
          border: 1px solid var(--semi-color-border);
          border-radius: 14px;
          padding: 12px 14px;
          background: var(--semi-color-bg-0);
          color: var(--semi-color-text-0);
          font: inherit;
        }
        .image-workbench-textarea {
          min-height: 120px;
          resize: vertical;
        }
        .image-workbench-hint {
          font-size: 12px;
          color: var(--semi-color-text-2);
        }
        .image-workbench-status {
          min-height: 22px;
          font-size: 13px;
          color: var(--semi-color-text-2);
        }
        .image-workbench-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }
        .image-workbench-image-card {
          border: 1px solid var(--semi-color-border);
          border-radius: 18px;
          padding: 12px;
          background: linear-gradient(180deg, var(--semi-color-fill-0), var(--semi-color-bg-1));
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
          display: grid;
          gap: 10px;
        }
        .image-workbench-image-button {
          border: 0;
          padding: 0;
          background: transparent;
          cursor: zoom-in;
        }
        .image-workbench-image-button img {
          display: block;
          width: 100%;
          max-height: 72vh;
          object-fit: contain;
          border-radius: 14px;
          background: #fff;
        }
        .image-workbench-download-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          border-radius: 999px;
          border: 1px solid var(--semi-color-border);
          color: var(--semi-color-text-0);
          text-decoration: none;
          font-weight: 600;
        }
        .image-workbench-revised-prompt,
        .image-workbench-prompt-box,
        .image-workbench-raw,
        .image-workbench-config-box,
        .image-workbench-preview-backdrop {
          border: 1px solid var(--semi-color-border);
          border-radius: 16px;
          background: var(--semi-color-bg-0);
        }
        .image-workbench-revised-prompt,
        .image-workbench-prompt-box,
        .image-workbench-config-box {
          padding: 12px;
        }
        .image-workbench-section-title,
        .image-workbench-prompt-title {
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .image-workbench-prompt-result {
          display: grid;
          gap: 12px;
        }
        .image-workbench-prompt-box pre,
        .image-workbench-raw pre {
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
          overflow: auto;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 12px;
        }
        .image-workbench-raw {
          padding: 14px;
        }
        .image-workbench-meta-list {
          display: grid;
          gap: 10px;
        }
        .image-workbench-meta-item {
          border: 1px solid var(--semi-color-border);
          border-radius: 14px;
          padding: 10px 12px;
          background: var(--semi-color-fill-0);
          display: grid;
          gap: 4px;
        }
        .image-workbench-meta-label {
          font-size: 12px;
          color: var(--semi-color-text-2);
        }
        .image-workbench-meta-value {
          font-size: 13px;
          color: var(--semi-color-text-0);
          word-break: break-word;
        }
        .image-workbench-preview-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          border-radius: 0;
          background: rgba(2, 6, 23, 0.82);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .image-workbench-preview-content {
          position: relative;
          max-width: 96vw;
          max-height: 92vh;
        }
        .image-workbench-preview-content img {
          max-width: 96vw;
          max-height: 92vh;
          border-radius: 16px;
          background: #fff;
          display: block;
        }
        .image-workbench-preview-close {
          position: absolute;
          right: 0;
          top: -48px;
        }
        @media (max-width: 900px) {
          .image-workbench-form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <Card className='image-workbench-card' bodyStyle={{ padding: 20 }}>
        <Space vertical align='start' spacing='medium' style={{ width: '100%' }}>
          <div>
            <Title heading={3} style={{ marginBottom: 8 }}>
              {t('绘图工作台')}
            </Title>
            <Text type='tertiary'>
              {t(
                '集成文生图与图生图，调用方式参考你提供的静态页面；默认直接解码展示图片，并支持 n 参数批量出图。',
              )}
            </Text>
          </div>

          <div className='image-workbench-config-box' style={{ width: '100%' }}>
            <div className='image-workbench-form-grid'>
              <label className='image-workbench-field'>
                <span className='image-workbench-label'>API Base URL</span>
                <input
                  className='image-workbench-input'
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder='https://newapi.matc2025.click'
                />
                <span className='image-workbench-hint'>
                  默认已填充当前站点地址；如需调别的兼容接口，也可以手动改这里。
                </span>
              </label>

              <label className='image-workbench-field'>
                <span className='image-workbench-label'>API Token</span>
                <input
                  className='image-workbench-input'
                  type='password'
                  autoComplete='off'
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder='输入 Bearer Token'
                />
                <span className='image-workbench-hint'>
                  Token 仅保存在当前浏览器 localStorage，同源脚本可读取，请在可信环境使用。
                </span>
              </label>
            </div>

            <div className='image-workbench-actions' style={{ marginTop: 14 }}>
              <Button onClick={saveSettings}>保存配置</Button>
              <Button theme='outline' onClick={clearToken}>
                清除 token
              </Button>
              {tokenStatus ? <Tag color='green'>{tokenStatus}</Tag> : null}
            </div>
          </div>
        </Space>
      </Card>

      <Card className='image-workbench-card' bodyStyle={{ padding: 20 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} type='line'>
          <TabPane tab='文生图' itemKey='generate'>
            <form onSubmit={handleGenerate}>
              <div className='image-workbench-form-grid'>
                <label className='image-workbench-field full'>
                  <span className='image-workbench-label'>Prompt</span>
                  <textarea
                    className='image-workbench-textarea'
                    value={generateForm.prompt}
                    onChange={(e) =>
                      setGenerateForm((prev) => ({ ...prev, prompt: e.target.value }))
                    }
                    placeholder='例如：一只橘猫坐在赛博朋克风格咖啡馆里，电影光效'
                    required
                  />
                </label>

                <div className='image-workbench-field full'>
                  <span className='image-workbench-label'>提示词优化</span>
                  <div className='image-workbench-actions'>
                    <input
                      className='image-workbench-input'
                      style={{ maxWidth: 240 }}
                      value={generateOptimizeModel}
                      onChange={(e) => setGenerateOptimizeModel(e.target.value)}
                      placeholder='gpt-5.4'
                    />
                    <Button
                      theme='outline'
                      type='primary'
                      onClick={() =>
                        optimizePrompt({
                          prompt: generateForm.prompt,
                          model: generateOptimizeModel,
                          setStatus: setGenerateOptimizeStatus,
                          setResult: setGenerateOptimizeResult,
                          setRaw: setGenerateOptimizeRaw,
                          onUse: null,
                        })
                      }
                    >
                      优化生成提示词
                    </Button>
                  </div>
                  <div className='image-workbench-status'>{generateOptimizeStatus}</div>
                  <PromptResult
                    result={generateOptimizeResult}
                    rawJson={generateOptimizeRaw}
                    onUse={(value) =>
                      setGenerateForm((prev) => ({ ...prev, prompt: value }))
                    }
                  />
                </div>

                <label className='image-workbench-field'>
                  <span className='image-workbench-label'>模型</span>
                  <input
                    className='image-workbench-input'
                    value={generateForm.model}
                    onChange={(e) =>
                      setGenerateForm((prev) => ({ ...prev, model: e.target.value }))
                    }
                  />
                </label>
                <label className='image-workbench-field'>
                  <span className='image-workbench-label'>图片数量 n</span>
                  <select
                    className='image-workbench-select'
                    value={generateForm.n}
                    onChange={(e) =>
                      setGenerateForm((prev) => ({ ...prev, n: Number(e.target.value) }))
                    }
                  >
                    {COUNT_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className='image-workbench-field'>
                  <span className='image-workbench-label'>输出格式</span>
                  <select
                    className='image-workbench-select'
                    value={generateForm.output_format}
                    onChange={(e) =>
                      setGenerateForm((prev) => ({ ...prev, output_format: e.target.value }))
                    }
                  >
                    {IMAGE_FORMAT_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label className='image-workbench-field'>
                  <span className='image-workbench-label'>尺寸</span>
                  <select
                    className='image-workbench-select'
                    value={generateForm.size}
                    onChange={(e) =>
                      setGenerateForm((prev) => ({ ...prev, size: e.target.value }))
                    }
                  >
                    {SIZE_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className='image-workbench-field'>
                  <span className='image-workbench-label'>质量</span>
                  <select
                    className='image-workbench-select'
                    value={generateForm.quality}
                    onChange={(e) =>
                      setGenerateForm((prev) => ({ ...prev, quality: e.target.value }))
                    }
                  >
                    {QUALITY_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label className='image-workbench-field'>
                  <span className='image-workbench-label'>背景</span>
                  <select
                    className='image-workbench-select'
                    value={generateForm.background}
                    onChange={(e) =>
                      setGenerateForm((prev) => ({ ...prev, background: e.target.value }))
                    }
                  >
                    {BACKGROUND_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className='image-workbench-field full'>
                  <span className='image-workbench-label'>压缩率（仅 jpeg / webp 可用，可留空）</span>
                  <input
                    className='image-workbench-input'
                    type='number'
                    min='0'
                    max='100'
                    value={generateForm.output_compression}
                    onChange={(e) =>
                      setGenerateForm((prev) => ({
                        ...prev,
                        output_compression: e.target.value,
                      }))
                    }
                    placeholder='例如：80'
                  />
                </label>
              </div>

              <div className='image-workbench-actions' style={{ marginTop: 18 }}>
                <Button htmlType='submit' loading={generateLoading}>
                  调用图片生成
                </Button>
              </div>
              <div className='image-workbench-status'>{generateStatus}</div>
            </form>

            <div className='image-workbench-page' style={{ marginTop: 18 }}>
              <Card title='生成结果' bordered={false} bodyStyle={{ padding: 0 }}>
                <ImageGallery
                  items={generateItems}
                  format={generateForm.output_format}
                  prefix='generated-image'
                  onPreview={(src, alt) => setPreview({ open: true, src, alt })}
                />
              </Card>

              <Card title='生成接口解析结果' bordered={false} bodyStyle={{ padding: 0 }}>
                <ParsedMeta response={generateResponse} />
              </Card>

              <Card title='生成接口原始响应' bordered={false} bodyStyle={{ padding: 0 }}>
                <div className='image-workbench-raw'>
                  <pre>{generateRaw}</pre>
                </div>
              </Card>
            </div>
          </TabPane>

          <TabPane tab='图生图' itemKey='edit'>
            <form onSubmit={handleEdit}>
              <div className='image-workbench-form-grid'>
                <label className='image-workbench-field full'>
                  <span className='image-workbench-label'>Prompt</span>
                  <textarea
                    className='image-workbench-textarea'
                    value={editForm.prompt}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, prompt: e.target.value }))
                    }
                    placeholder='例如：把背景改成雪山，保留主体'
                    required
                  />
                </label>

                <div className='image-workbench-field full'>
                  <span className='image-workbench-label'>提示词优化</span>
                  <div className='image-workbench-actions'>
                    <input
                      className='image-workbench-input'
                      style={{ maxWidth: 240 }}
                      value={editOptimizeModel}
                      onChange={(e) => setEditOptimizeModel(e.target.value)}
                      placeholder='gpt-5.4'
                    />
                    <Button
                      theme='outline'
                      type='primary'
                      onClick={() =>
                        optimizePrompt({
                          prompt: editForm.prompt,
                          model: editOptimizeModel,
                          setStatus: setEditOptimizeStatus,
                          setResult: setEditOptimizeResult,
                          setRaw: setEditOptimizeRaw,
                          onUse: null,
                        })
                      }
                    >
                      优化编辑提示词
                    </Button>
                  </div>
                  <div className='image-workbench-status'>{editOptimizeStatus}</div>
                  <PromptResult
                    result={editOptimizeResult}
                    rawJson={editOptimizeRaw}
                    onUse={(value) => setEditForm((prev) => ({ ...prev, prompt: value }))}
                  />
                </div>

                <label className='image-workbench-field full'>
                  <span className='image-workbench-label'>待编辑图片（可多选）</span>
                  <input
                    className='image-workbench-file'
                    type='file'
                    accept='image/*'
                    multiple
                    onChange={(e) => setEditImages(Array.from(e.target.files || []))}
                  />
                  <span className='image-workbench-hint'>
                    已选择 {editImages.length} 张图片
                  </span>
                </label>

                <label className='image-workbench-field full'>
                  <span className='image-workbench-label'>Mask（可选）</span>
                  <input
                    className='image-workbench-file'
                    type='file'
                    accept='image/*'
                    onChange={(e) => setEditMask(e.target.files?.[0] || null)}
                  />
                  <span className='image-workbench-hint'>
                    {editMask ? `当前 mask：${editMask.name}` : '未选择 mask'}
                  </span>
                </label>

                <label className='image-workbench-field'>
                  <span className='image-workbench-label'>模型</span>
                  <input
                    className='image-workbench-input'
                    value={editForm.model}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, model: e.target.value }))
                    }
                  />
                </label>
                <label className='image-workbench-field'>
                  <span className='image-workbench-label'>图片数量 n</span>
                  <select
                    className='image-workbench-select'
                    value={editForm.n}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, n: Number(e.target.value) }))
                    }
                  >
                    {COUNT_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className='image-workbench-field'>
                  <span className='image-workbench-label'>输出格式</span>
                  <select
                    className='image-workbench-select'
                    value={editForm.output_format}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, output_format: e.target.value }))
                    }
                  >
                    {IMAGE_FORMAT_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label className='image-workbench-field'>
                  <span className='image-workbench-label'>尺寸</span>
                  <select
                    className='image-workbench-select'
                    value={editForm.size}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, size: e.target.value }))
                    }
                  >
                    {SIZE_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className='image-workbench-field'>
                  <span className='image-workbench-label'>质量</span>
                  <select
                    className='image-workbench-select'
                    value={editForm.quality}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, quality: e.target.value }))
                    }
                  >
                    {QUALITY_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label className='image-workbench-field'>
                  <span className='image-workbench-label'>背景</span>
                  <select
                    className='image-workbench-select'
                    value={editForm.background}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, background: e.target.value }))
                    }
                  >
                    {BACKGROUND_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className='image-workbench-field full'>
                  <span className='image-workbench-label'>压缩率（可留空）</span>
                  <input
                    className='image-workbench-input'
                    type='number'
                    min='0'
                    max='100'
                    value={editForm.output_compression}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        output_compression: e.target.value,
                      }))
                    }
                    placeholder='例如：80'
                  />
                </label>
              </div>

              <div className='image-workbench-actions' style={{ marginTop: 18 }}>
                <Button htmlType='submit' loading={editLoading}>
                  调用图片编辑
                </Button>
              </div>
              <div className='image-workbench-status'>{editStatus}</div>
            </form>

            <div className='image-workbench-page' style={{ marginTop: 18 }}>
              <Card title='编辑结果' bordered={false} bodyStyle={{ padding: 0 }}>
                <ImageGallery
                  items={editItems}
                  format={editForm.output_format}
                  prefix='edited-image'
                  onPreview={(src, alt) => setPreview({ open: true, src, alt })}
                />
              </Card>

              <Card title='编辑接口解析结果' bordered={false} bodyStyle={{ padding: 0 }}>
                <ParsedMeta response={editResponse} />
              </Card>

              <Card title='编辑接口原始响应' bordered={false} bodyStyle={{ padding: 0 }}>
                <div className='image-workbench-raw'>
                  <pre>{editRaw}</pre>
                </div>
              </Card>
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {preview.open ? (
        <div
          className='image-workbench-preview-backdrop'
          onClick={() => setPreview({ open: false, src: '', alt: '' })}
        >
          <div
            className='image-workbench-preview-content'
            onClick={(event) => event.stopPropagation()}
          >
            <Button
              className='image-workbench-preview-close'
              theme='solid'
              onClick={() => setPreview({ open: false, src: '', alt: '' })}
            >
              关闭
            </Button>
            <img src={preview.src} alt={preview.alt} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ImageWorkbench;
