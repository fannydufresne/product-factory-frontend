import React, {useEffect, useState} from 'react';
import '../../../../styles/Profile.module.less';
import {Col, Layout, Radio, Row, Spin, Table, Typography} from "antd";
import Header from "../../../../components/Header";
import ContainerFlex from "../../../../components/ContainerFlex";
import {getProp} from "../../../../utilities/filters";
import {formatDate} from "../../../../utilities/utils";
import Link from 'next/link';
import {useQuery} from "@apollo/react-hooks";
import {GET_PERSON_PROFILE, GET_REVIEW_BY_ID, GET_TASKS_BY_PRODUCT} from "../../../../graphql/queries";
import {useRouter} from "next/router";
import {CustomAvatar, StarScore} from "../../../../components";
import ReactPlayer from "react-player";
import ProfileTop from "../../../../components/Profile/ProfileTop";
import {RadioChangeEvent} from "antd/es";

const {Content} = Layout;


const ProfileItem: React.FunctionComponent = () => {
    const router = useRouter()
    const {personSlug, profileItemId} = router.query

    const [mode, setMode] = useState('received');
    const [dataSource, setDataSource] = useState<any>([]);

    const {
        data: person,
        error: personError,
        loading: personLoading
    } = useQuery(GET_PERSON_PROFILE, {
        variables: {personSlug}
    });

    const {
        data: review,
        error: reviewError,
        loading: reviewLoading
    } = useQuery(GET_REVIEW_BY_ID, {
        variables: {
            reviewId: parseInt(profileItemId as string),
            personSlug
        }
    });

    const {
        data: tasks,
        error: tasksError,
        loading: tasksLoading
    } = useQuery(GET_TASKS_BY_PRODUCT, {
        variables: {productId: profileItemId, status: 3}
    });

    console.log(tasks);

    const filterReviews = (type: string) => {
        const newReviews = getProp(review, 'review.productReviews', []);
        return type === "given"
            ? newReviews.filter(
                (item: any) => item.createdBy.slug === profileItemId
            )
            : newReviews.filter(
                (item: any) => item.createdBy.slug !== profileItemId
            )
    }

    const fetchData = () => {
        const source: any = getProp(tasks, 'tasks', []).map((task: any, index: number) => {
            return {
                key: `task-${index}`,
                task: task,
                description: task.description
            }
        });

        setDataSource(source);
    }

    useEffect(() => {
        if (review) {
            fetchData();
        }
    }, [review]);

    const columns = [
        {
            title: 'Tasks',
            dataIndex: 'task',
            key: 'task',
            render: (task: any) => (
                <div style={{width: 200}}>
                    {/*<div>*/}
                    {/*    <Link href={`/products/${getProp(review, 'review.review.product.id', '')}/tasks/${task.id}`}>*/}
                    {/*        {task.title}*/}
                    {/*    </Link>*/}
                    {/*</div>*/}
                    {/*<div className="text-grey">{formatDate(task.createdAt)}</div>*/}
                    {/*{*/}
                    {/*    task.detailUrl ? (*/}
                    {/*        <a href={task.detailUrl} target="_blank">*/}
                    {/*            Link to the work on GitHub*/}
                    {/*        </a>*/}
                    {/*    ) : null*/}
                    {/*}*/}
                </div>
            )
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (description: string) => (
                <>
                    <span>{description}</span>
                </>
            )
        }
    ];

    const productReviews = filterReviews(mode);
    const initiatives = getProp(review, 'review.review.product.initiatives', []);
    const initiative = initiatives.length > 0 ? initiatives[0] : null;
    const attachment = getProp(review, 'review.review.product.attachment', []);
    const videUrl = getProp(review, 'review.review.product.videoUrl', '');

    return (
        <ContainerFlex>
            <Layout>
                <Header/>
                <Content className="container main-page">
                    <ProfileTop/>
                    <>
                        <div className="profile-section">
                            <h3 className="section-title">Portfolio item</h3>
                            <div className="mb-15">
                                <Row>
                                    <Col span={17}>
                                        <p style={{marginBottom: 5}}>
                                            <Typography.Text strong>Product: </Typography.Text>
                                            <Link
                                                href={`/products/${getProp(review, 'review.review.product.id', '')}/summary`}
                                            >
                                                <a className="text-black">{getProp(review, 'review.review.product.name', '')}</a>
                                            </Link>
                                        </p>
                                        {initiative && (
                                            <p className="text-sm" style={{marginBottom: 5}}>
                                                <Typography.Text strong>Initiative: </Typography.Text>
                                                <Link
                                                    href={`/products/${getProp(review, 'review.review.product.id', '')}/initiatives/${initiative.id}`}
                                                >
                                                    <a className="text-black">{initiative.name}</a>
                                                </Link>
                                            </p>
                                        )}
                                        <p className="text-sm" style={{marginBottom: 5}}>
                                            <Typography.Text strong>Summary: </Typography.Text>
                                            <span className="text-grey">
                                                {getProp(review, 'review.review.product.shortDescription', '')}
                                            </span>
                                        </p>
                                        {attachment && attachment.length > 0 && (
                                            <div>
                                                <Typography.Text strong>Attachments: </Typography.Text>
                                            </div>
                                        )}
                                    </Col>
                                    <Col span={7}>
                                        <ReactPlayer
                                            width={"100%"}
                                            height="160px"
                                            url={videUrl}
                                        />
                                    </Col>
                                </Row>
                            </div>

                            <Typography.Text style={{fontSize: '1.4rem'}}>Reviews:</Typography.Text>
                            <div className="mb-15" style={{marginTop: 10}}>
                                <Radio.Group
                                    onChange={(e: RadioChangeEvent) => setMode(e.target.value)}
                                    value={mode}
                                    style={{marginBottom: 10}}
                                >
                                    <Radio.Button value="received"
                                                  style={{borderRadius: '5px 0 0 5px'}}>Received</Radio.Button>
                                    <Radio.Button value="given"
                                                  style={{borderRadius: '0 5px 5px 0'}}>Given</Radio.Button>
                                </Radio.Group>

                                {
                                    reviewLoading ? (
                                        <Spin size="large"/>
                                    ) : !reviewError && (
                                        <div style={{marginTop: 15}}>
                                            {productReviews.map((item: any, index: number) => (
                                                <div key={`received-${index}`} style={{marginBottom: 15}}>
                                                    <Row style={{marginBottom: 25}}>
                                                        <Col xs={24} lg={18}>
                                                            <Row>
                                                                <Row>
                                                                    {CustomAvatar(item.createdBy, 'fullName', 40)}
                                                                    <Typography.Text
                                                                        strong
                                                                        style={{fontSize: 12}}
                                                                    >{getProp(item, 'createdBy.fullName', '')}</Typography.Text>
                                                                </Row>
                                                                <StarScore
                                                                    score={getProp(item, 'score', 0)}
                                                                    className="review-star"
                                                                />
                                                            </Row>
                                                            <p
                                                                className="text-sm"
                                                                style={{marginTop: 10}}
                                                            >
                                                                <strong>Review: </strong>
                                                                <span className="text-grey font-sm">
                                                                {getProp(item, 'text', '')}
                                                            </span>
                                                            </p>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                            </div>

                            {
                                reviewLoading && personLoading ? (
                                    <Spin size="large"/>
                                ) : !reviewError && !personError && (
                                    <div className="completed-task-section">
                                        <Typography.Text strong>
                                            Stories done by {getProp(person, 'personProfile.person.fullName', '').split(' ')[0]}
                                        </Typography.Text>
                                        <Table
                                            dataSource={dataSource}
                                            columns={columns}
                                        />
                                    </div>
                                )
                            }

                        </div>
                    </>
                </Content>
            </Layout>
        </ContainerFlex>
    )
}

export default ProfileItem;