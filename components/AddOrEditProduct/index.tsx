import React, {useEffect, useState} from 'react';
import {Row, message, Input, Button, Col} from 'antd';
import {useMutation} from '@apollo/react-hooks';
import {useRouter} from 'next/router';
import {CREATE_PRODUCT, DELETE_PRODUCT, UPDATE_PRODUCT} from '../../graphql/mutations';
import Loading from "../../components/Loading";
import RichTextEditor from "../../components/RichTextEditor";
import {getProp} from "../../utilities/filters";
import {Upload} from 'antd';
import ImgCrop from 'antd-img-crop';
import 'antd/es/modal/style';
import 'antd/es/slider/style';


const {TextArea} = Input;


interface IAddOrEditProductProps {
  isAdding?: boolean
  isEditing?: boolean
  productData?: any
  toUpdate?: number
  toDelete?: number
  closeModal?: Function
}

const AddOrEditProduct: React.FunctionComponent<IAddOrEditProductProps> = (
  {
    isAdding = false,
    isEditing = false,
    productData,
    toUpdate = 0,
    toDelete = 0
  }
) => {
  const router = useRouter();
  const {productSlug} = router.query;


  const [fileList, setFileList] = useState<any>([]);
  const [photo, setPhoto] = useState(isEditing ? getProp(productData, 'photo', null) : null);

  const productPhoto = getProp(productData, 'photo', null);

  useEffect(() => {
    if (productPhoto) {
      setFileList([{
        uid: '-1',
        url: productPhoto,
      }]);
    }
  }, [productPhoto]);


  const [name, setName] = useState(isEditing ? getProp(productData, 'name', '') : '');
  const [shortDescription, setShortDescription] = useState(isEditing ? getProp(productData, 'shortDescription', '') : '');
  const [fullDescription, setFullDescription] = useState(isEditing ? getProp(productData, 'fullDescription', '') : '');
  const [website, setWebsite] = useState(isEditing ? getProp(productData, 'website', '') : '');
  const [videoUrl, setVideoUrl] = useState(isEditing ? getProp(productData, 'videoUrl', '') : '');

  const [isShowLoading, setIsShowLoading] = useState(false);

  const [createProduct] = useMutation(CREATE_PRODUCT, {
    onCompleted(res) {
      const status = getProp(res, 'createProduct.status', false);
      const messageText = getProp(res, 'createProduct.message', '');

      if (status) {
        router.push('/').then(() => {
          message.success(messageText).then();
        });
      } else {
        message.error(messageText).then();
        setIsShowLoading(false);
      }
    },
    onError() {
      message.error('Error with product creation').then();
      setIsShowLoading(false);
    }
  });

  const [updateProduct] = useMutation(UPDATE_PRODUCT, {
    onCompleted(res) {
      const status = getProp(res, 'updateProduct.status', false);
      const messageText = getProp(res, 'updateProduct.message', '');

      if (status) {
        const newSlug = getProp(res, 'updateProduct.newSlug', '');
        const newLink = (newSlug ? `/products/${newSlug}/` : '/');
        router.push('/').then(() => {
          router.push(newLink).then(() => {
            message.success(messageText).then();
          });
        });
      } else {
        message.error(messageText).then();
        setIsShowLoading(false);
      }
    },
    onError() {
      message.error('Error with product updating').then();
      setIsShowLoading(false);
    }
  });

  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
    variables: {
      slug: productSlug
    },
    onCompleted(res) {
      const status = getProp(res, 'deleteProduct.status', false);
      const messageText = getProp(res, 'deleteProduct.message', '');

      if (status) {
        router.push('/').then(() => {
          message.success(messageText).then();
        });
      } else {
        message.error(messageText).then();
        setIsShowLoading(false);
      }
    },
    onError() {
      message.error('Error with product deletion').then();
      setIsShowLoading(false);
    }
  });

  const addNewProduct = () => {
    if (!name || !shortDescription || !website) {
      message.error("Please fill the form fields").then();
      return;
    }

    setIsShowLoading(true);

    createProduct({
      variables: {
        productInput: {
          name,
          shortDescription,
          fullDescription,
          website,
          videoUrl
        },
        file: photo
      }
    }).then();
  }

  const updateCurrentProduct = () => {
    if (!name || !shortDescription || !website) {
      message.error("Please fill the form fields").then();
      return;
    }

    setIsShowLoading(true);

    console.log(photo);

    updateProduct({
      variables: {
        productInput: {
          slug: getProp(productData, 'slug', ''),
          name,
          shortDescription,
          fullDescription,
          website,
          videoUrl
        },
        file: photo
      }
    }).then();
  }

  const onUploadChange = ({fileList: newFileList}: any) => {
    setFileList(newFileList);
  };

  // const onUploadRemove = ({fileList: newFileList}: any) => {
  //
  // }

  const onImagePreview = async (file: any) => {
    let src = file.url;
    if (!src) {
      src = await new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow && imgWindow.document.write(image.outerHTML);
  };

  useEffect(() => {
    if (toUpdate !== 0) {
      updateCurrentProduct();
    }
  }, [toUpdate]);

  useEffect(() => {
    if (toDelete !== 0) {
      deleteProduct().then();
    }
  }, [toDelete]);

  useEffect(() => {
    if (fileList.length > 0) {
      setPhoto(getProp(fileList[0], 'thumbUrl', null));
    } else if (!productPhoto) {
      setPhoto(null);
    }
  }, [fileList]);

  return (
    <>
      {
        isShowLoading ? <Loading/> :
          <>
            <Row style={{marginBottom: 25}}>
              <ImgCrop rotate>
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={onUploadChange}
                  onPreview={onImagePreview}
                >
                  {fileList.length < 1 && '+ Upload'}
                </Upload>
              </ImgCrop>
            </Row>
            <Row className="mb-15">
              <label>Product name*:</label>
              <Input
                placeholder="Product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Row>
            <Row style={{width: '100%'}} className='mb-15'>
              <Row style={{width: '100%'}}>
                <Col span={24}>
                  <label>Short description*:</label>
                </Col>
              </Row>
              <Row style={{width: '100%'}}>
                <Col span={24}>
                  <TextArea
                    placeholder="Short description"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    autoSize={{minRows: 3}}
                    maxLength={256}
                    showCount
                  />
                </Col>
              </Row>
            </Row>
            <Row>
              <label>Full description:</label>

              <RichTextEditor initialHTMLValue={fullDescription} onChangeHTML={setFullDescription}/>
            </Row>
            <Row className='mb-15'>
              <label>Website url *:</label>
              <Input
                placeholder="Website url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </Row>
            <Row className='mb-15'>
              <label>Video url (optional):</label>
              <Input
                placeholder="Video url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </Row>
            {
              isAdding &&
              <Row className='mt-15'>
                  <Button onClick={() => addNewProduct()} className='mr-15'>Add</Button>
                  <Button onClick={() => router.back()}>Back</Button>
              </Row>
            }
          </>
      }
    </>
  );
};

export default AddOrEditProduct;