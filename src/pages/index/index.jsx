import { Upload, Input, Form, Select } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import './index.scss';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import layout from 'layout';
import { DeleteTwoTone } from '@ant-design/icons';
import utils from '../../utils';

const { Option } = Select;

const { Dragger } = Upload;


function Index() {
  const [imgData, setImgData] = useState({
    items: [],
    width: 0,
    height: 0,
    spriteImg: null
  });

  const [fileList, setFileList] = useState([]);

  const [setting, setSetting] = useState(() => ({
    prefix: 'icon',
    spacing: 10,
    codeLanguage: 'scss',
  }), []);

  // 获得布局和雪碧图url
  const spriteLayout = useCallback((list = []) => {
    if (!list?.length) {
      return [
        {
          items: [],
          width: 0,
          height: 0,
        }, null]
    }
    // 二叉树布局
    const layer = layout('binary-tree');
    list.forEach(item => {
      layer.addItem({
        height: item.height,
        width: item.width,
        meta: item,
      });
    })
    const info2 = layer['export']();
    const nodeCanvas = utils.createCanvas(info2.width, info2.height);
    const oCtx = nodeCanvas.getContext('2d');
    // 渲染canvas
    info2.items.forEach(item => {
      oCtx.drawImage(item.meta.oImg, item.x, item.y, item.width, item.height);
    });

    const url = nodeCanvas.toDataURL();
    return [info2, url]
  }, []);

  // 获得各个图片尺寸
  const getImgCanvas = useCallback(async (list = []) => {
    return await Promise.all(list.map(async item => {
      // 获取图片文件
      const readerData = await utils.readFileAsDataUri(item.originFileObj)
      // 生成image对象
      const oImg = await utils.loadImage(readerData);
      const { width, height } = oImg;
      // canvas渲染image对象
      const nodeCanvas = utils.createCanvas(width, height);
      const oCtx = nodeCanvas.getContext('2d');
      oCtx.drawImage(oImg, 0, 0, width, height);
      const url = nodeCanvas.toDataURL();
      return {
        name: item.name,
        uid: item.originFileObj.uid,
        oImg: oImg,
        width: oImg.width,
        height: oImg.height,
        url: url,
      }
    }))
  }, []);

  // 根据uid删除图标
  const onDel = useCallback((uid) => {
    setFileList(list => {
      return list.filter(item => item.uid !== uid);
    });
  }, []);

  const onSettingChange = useCallback((key, value) => {
    setSetting(obj => ({
      ...obj,
      [key]: value,
    }));
  }, []);

  const props = useMemo(() => ({
    multiple: true,
    customRequest(e) {

    },
    fileList,
    showUploadList: false,
    async onChange(info) {
      setFileList(info.fileList);
    },
  }), [fileList]);

  /**
   * 生成单个图标代码
   * @param {*} item 单个图标数据
   */
  const renderItemCode = useCallback((item) => {
    return (`.${utils.fileName2ClassName(item.meta.name)}{
  width: ${item.meta.width}px;
  height: ${item.meta.height}px;
  background-position: -${item.x}px -${item.y}px;
}`)
  }, []);

  useEffect(() => {
    (async () => {
      const imgList = await getImgCanvas(fileList);
      const [layoutData, spriteImg] = spriteLayout(imgList);
      setImgData({ ...layoutData, spriteImg });
    })()
  }, [fileList, getImgCanvas, spriteLayout]);

  return (
    <div className="index-page">
      <div className="index-header">
        <Dragger {...props}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">Support for a single or bulk upload. </p>
        </Dragger>
      </div>
      <div className="index-form">
        <Form layout="inline">
          <Form.Item label="prefix">
            <Input value={setting.prefix} onChange={(e) => onSettingChange('prefix', e.target.value)} />
          </Form.Item>
          <Form.Item label="spacing">
            <Input value={setting.spacing} onChange={(e) => onSettingChange('spacing', e.target.value)} type="number" />
          </Form.Item>
          <Form.Item label="export language">
            <Select value={setting.codeLanguage} style={{ width: 120 }} onChange={(e) => onSettingChange('codeLanguage', e)}>
              <Option value="css">css</Option>
              <Option value="scss">scss</Option>
            </Select>
          </Form.Item>
        </Form>
      </div>
      <div className="index-content">
        <div className="content-item">
          <div>
            {imgData?.items?.map(item => (<div className="item" key={item.meta.uid}>
              <div className="item-header">
                <div className="item-thumbnail">
                  <img src={item.meta.url} alt={item.meta.name} />
                </div>
                <span className="item-name">{item.meta.name}</span>
                <DeleteTwoTone className="item-del" onClick={() => onDel(item.meta.uid)} twoToneColor="#f81d22" />
              </div>
              <div className="code-box">
                <pre>
                  <code>
                    {renderItemCode(item)}
                  </code>
                </pre>
              </div>
            </div>))}
          </div>
        </div>
        <div className="content-item">
          {imgData.spriteImg && <div>
            <div className="sprite-box">
              <img className="sprite-img" src={imgData.spriteImg} alt="sprite" />
            </div>
            <div className="code-box">
              <pre>
                <code>
                  {`.${setting.prefix}{
  background-image: url(//img10.360buyimg.com/ppershou/s100x100_jfs/t1/159572/8/19730/4560/607971f4E4faf8a7c/4a561c184f08eb25.jpg);
  background-repeat: no-repeat;
  background-size: ${imgData.width}px ${imgData.height}px;
  ${imgData?.items?.map(item => `
&${renderItemCode(item)}
  `).join('')}
}`}
                </code>
              </pre>
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
}

export default memo(Index);
