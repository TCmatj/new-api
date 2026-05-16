import React from 'react';
import { Empty, Button } from '@douyinfe/semi-ui';
import {
  IllustrationFailure,
  IllustrationFailureDark,
} from '@douyinfe/semi-illustrations';
import { withTranslation } from 'react-i18next';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '', componentStack: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.stack || error?.message || String(error || ''),
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
    this.setState({
      errorMessage: error?.stack || error?.message || String(error || ''),
      componentStack: errorInfo?.componentStack || '',
    });
  }

  render() {
    if (this.state.hasError) {
      const { t } = this.props;
      return (
        <div className='flex flex-col justify-center items-center h-screen p-8'>
          <Empty
            image={
              <IllustrationFailure style={{ width: 250, height: 250 }} />
            }
            darkModeImage={
              <IllustrationFailureDark style={{ width: 250, height: 250 }} />
            }
            description={t('页面渲染出错，请刷新页面重试')}
          />
          {(this.state.errorMessage || this.state.componentStack) ? (
            <div
              style={{
                marginTop: 16,
                maxWidth: 960,
                width: '100%',
                textAlign: 'left',
                background: '#0f172a',
                color: '#e2e8f0',
                borderRadius: 12,
                padding: 16,
                overflow: 'auto',
                fontSize: 12,
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
              }}
            >
              {this.state.errorMessage}
              {this.state.componentStack
                ? `\n\nComponent stack:${this.state.componentStack}`
                : ''}
            </div>
          ) : null}
          <Button
            theme='solid'
            type='primary'
            style={{ marginTop: 16 }}
            onClick={() => window.location.reload()}
          >
            {t('刷新页面')}
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary);
