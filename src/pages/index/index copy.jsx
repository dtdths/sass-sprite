import { Upload, Input, Form, Select } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import './index.scss';
import { memo, useCallback, useMemo, useState } from 'react';
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
  });
  const [spriteImg, setSpriteImg] = useState(null);

  const [setting, setSetting] = useState(() => ({
    prefix: 'icon',
    spacing: 10,
    codeLanguage: 'scss',
  }), []);

  const spriteLayout = useCallback((imgList) => {
     // 二叉树布局
     const layer = layout('binary-tree');
     imgList.forEach(item => {
       layer.addItem({
         height: item.img.height,
         width: item.img.width,
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
     setImgData(info2);
     setSpriteImg(url);
  }, []);

  const props = useMemo(() => ({
    multiple: true,
    customRequest(e) {
      // console.log(e, 11)
      // e.onSuccess();
    },
    showUploadList: false,
    async onChange(info) {
      // const { status } = info.file;
      // console.log(info, 22)
      const _imgList = await Promise.all(info.fileList.map(async item => {
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
          originFileObj: item.originFileObj,
          oImg,
          img: {
            width: oImg.width,
            height: oImg.height,
            url: url,
          }
        }
      }))

      spriteLayout(_imgList);
    },
  }), [spriteLayout]);

  const handleChange = useCallback(() => { }, []);

  /**
   * 生成单个图标代码
   * @param {*} item 单个图标数据
   */
  const renderItemCode = useCallback((item) => {
    return (`.${utils.fileName2ClassName(item.meta.name)}{
  width: ${item.meta.img.width}px;
  height: ${item.meta.img.height}px;
  background-position: -${item.x}px -${item.y}px;
}`)
  }, []);

  console.log(imgData);

  // console.log(imgList, 123123);

  return (
    <div className="index-page">
      <div className="index-header">
        <Dragger {...props}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽图片到此处</p>
          <p className="ant-upload-hint">支持多图片上传</p>
        </Dragger>
      </div>
      <div className="index-form">
        <Form layout="inline">
          <Form.Item label="前缀">
            <Input value={setting.prefix} />
          </Form.Item>
          <Form.Item label="图标间距">
            <Input value={setting.spacing} type="number" />
          </Form.Item>
          <Form.Item label="输出语言">
            <Select value={setting.codeLanguage} style={{ width: 120 }} onChange={handleChange}>
              <Option value="css">css</Option>
              <Option value="scss">scss</Option>
            </Select>
          </Form.Item>
        </Form>
      </div>
      <div className="index-content">
        <div className="content-item">
          <div>
            {imgData?.items?.map(item => (<div className="item" key={item.meta.originFileObj.uid}>
              <div className="item-header">
                <div className="item-thumbnail">
                  <img src={item.meta.img.url} alt={item.meta.name} />
                </div>
                <span className="item-name">{item.meta.name}</span>
                <DeleteTwoTone className="item-del" twoToneColor="#f81d22" />
              </div>
              <div className="code-box">
                <pre>
                  <code>
                    {renderItemCode(item)}
                    {/* {`.${utils.fileName2ClassName(item.meta.name)}{
  width: ${item.meta.img.width}px;
  height: ${item.meta.img.height}px;
  background-position: -${item.x}px -${item.y}px;
}`} */}
                  </code>
                </pre>
              </div>
            </div>))}
          </div>
        </div>
        <div className="content-item">
          {spriteImg && <div>
            <img className="sprite-img" src={spriteImg} alt="sprite" />
            <div className="code-box">
              <pre>
                <code>
                  {`.icon{
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
          {/* <canvas id="sprite-canvas" className='sprite-canvas'></canvas> */}
        </div>
      </div>
    </div>
  );
}

export default memo(Index);
