import { memo, useCallback } from "react";
import { message } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './index.scss';

const Code = (props = {}) => {

  const { children } = props;

  const copyHandle = useCallback(() => {
    message.success('复制成功');
  }, []);

  return (
    <div className="code-box">
      <CopyToClipboard
        text={children}
        onCopy={copyHandle}
      >
        <button className="code-copy">复制</button>
      </CopyToClipboard>
      <pre>
        {/* TODO ref innerText */}
        <code>
          {children}
        </code>
      </pre>
    </div>
  )
};

export default memo(Code);
