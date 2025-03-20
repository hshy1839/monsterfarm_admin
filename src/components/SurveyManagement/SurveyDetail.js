import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import '../../css/SurveyManagement/SurveyDetail.css'; // 스타일 시트 경로 유지

const SurveyDetail = () => {
    const [survey, setSurvey] = useState(null); // 설문 상세 정보 상태
    const { id } = useParams(); // URL에서 설문 ID를 가져옴
    const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅

    useEffect(() => {
        const fetchSurveyDetail = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log('로그인 정보가 없습니다.');
                    return;
                }

                const response = await axios.get(
                    `http://localhost:7777/api/survey/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data && response.data.success) {
                    setSurvey(response.data.survey);
                } else {
                    console.log('설문 상세 데이터 로드 실패');
                }
            } catch (error) {
                console.error('설문 상세 정보를 가져오는데 실패했습니다.', error);
            }
        };

        fetchSurveyDetail();
    }, [id]);

    // 수정 버튼 클릭 핸들러
    const handleEdit = () => {
        navigate(`/survey/detail/${id}/update`); // 수정 페이지로 이동
    };

    // 삭제 버튼 클릭 핸들러
    const handleDelete = async () => {
        const confirmation = window.confirm('이 설문을 삭제하시겠습니까?');
        if (!confirmation) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('로그인 정보가 없습니다.');
                return;
            }

            const response = await axios.delete(
                `http://localhost:7777/api/survey/${id}`, // URL 수정
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data && response.data.success) {
                alert('설문이 삭제되었습니다.');
                navigate('/survey'); // 설문 목록 페이지로 리디렉션
            } else {
                alert('설문 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('설문 삭제 중 오류가 발생했습니다.', error);
        }
    };

    if (!survey) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className="product-detail-container">
            <Header />
            <h1>설문 정보</h1>
            <div className="product-detail-content">
                <div className="product-info">
                    <h1 className="product-name">설문명: {survey.name}</h1>

                    {/* 설문 유형 표시 */}
                    <p className="product-category">
                        <strong>설문 유형:</strong> {survey.type}
                    </p>

                    {/* 설문 생성일 (YYYY-MM-DD 형식) */}
                    <p className="product-date">
                        <strong>생성일:</strong> {new Date(survey.createdAt).toISOString().split('T')[0]}
                    </p>

                    {/* 질문 목록 */}
                    <div className="survey-questions">
                        <h2>질문 목록</h2>
                        <ul>
                            {survey.questions && survey.questions.length > 0 ? (
                                survey.questions.map((question, index) => (
                                    <li key={index}>
                                        <strong>Q{index + 1}:</strong> {question.questionText}
                                        {question.options && question.options.length > 0 && (
                                            <ul>
                                                {question.options.map((option, optionIndex) => (
                                                    <li key={optionIndex}>{option}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))
                            ) : (
                                <p>등록된 질문이 없습니다.</p>
                            )}
                        </ul>
                    </div>

                    <div className="button-container">
                        <button className="edit-button" onClick={handleEdit}>수정</button>
                        <button className="delete-button" onClick={handleDelete}>삭제</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SurveyDetail;
