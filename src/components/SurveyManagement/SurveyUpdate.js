import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import '../../css/SurveyManagement/SurveyUpdate.css';

const SurveyUpdate = () => {
    const [survey, setSurvey] = useState(null);
    const [updatedSurvey, setUpdatedSurvey] = useState({
        name: '',
        type: '',
        description: '',
        questions: []
    });

    const { id } = useParams();
    const navigate = useNavigate();

    const surveyTypes = ["객관식", "주관식"];

    useEffect(() => {
        const fetchSurveyDetail = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log('로그인 정보가 없습니다.');
                    return;
                }

                const response = await axios.get(
                    `http://3.36.70.200:7777/api/survey/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data && response.data.success) {
                    setSurvey(response.data.survey);
                    setUpdatedSurvey({
                        name: response.data.survey.name,
                        type: response.data.survey.type,
                        description: response.data.survey.description || '',
                        questions: response.data.survey.questions || [],
                    });
                } else {
                    console.log('설문 상세 데이터 로드 실패');
                }
            } catch (error) {
                console.error('설문 상세 정보를 가져오는데 실패했습니다.', error);
            }
        };

        fetchSurveyDetail();
    }, [id]);

    // 입력 값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUpdatedSurvey(prev => ({ ...prev, [name]: value }));
    };

    // 설문 유형 변경 시 초기화
    const handleTypeChange = (e) => {
        const newType = e.target.value;
        setUpdatedSurvey({
            ...updatedSurvey,
            type: newType,
            questions: newType === "객관식" ? [] : [{ questionText: '', options: [] }]
        });
    };

    // 질문 텍스트 변경 핸들러
    const handleQuestionChange = (index, value) => {
        const updatedQuestions = [...updatedSurvey.questions];
        updatedQuestions[index].questionText = value;
        setUpdatedSurvey(prev => ({ ...prev, questions: updatedQuestions }));
    };

    // 객관식 선택지 추가 핸들러
    const addOption = (index) => {
        const updatedQuestions = [...updatedSurvey.questions];
        updatedQuestions[index].options.push('');
        setUpdatedSurvey(prev => ({ ...prev, questions: updatedQuestions }));
    };

    // 객관식 선택지 변경 핸들러
    const handleOptionChange = (qIndex, oIndex, value) => {
        const updatedQuestions = [...updatedSurvey.questions];
        updatedQuestions[qIndex].options[oIndex] = value;
        setUpdatedSurvey(prev => ({ ...prev, questions: updatedQuestions }));
    };

    // 설문 저장 핸들러
    const handleSave = async (e) => {
        e.preventDefault();
        const confirmation = window.confirm('수정사항을 저장하시겠습니까?');
        if (!confirmation) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('로그인 정보가 없습니다.');
                return;
            }

            const response = await axios.put(
                `http://3.36.70.200:7777/api/survey/${id}`,
                updatedSurvey,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data && response.data.success) {
                alert('설문이 수정되었습니다.');
                navigate(`/survey`);
            } else {
                alert('설문 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('설문 수정 중 오류가 발생했습니다.', error);
            alert('서버와의 연결에 문제가 발생했습니다. 다시 시도해주세요.');
        }
    };

    if (!survey) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className="product-update-container">
            <h2 className="product-update-title">설문 수정</h2>
            <form className="product-update-form" onSubmit={handleSave}>
                {/* Survey Name */}
                <div className="product-update-field">
                    <label className="product-update-label" htmlFor="name">설문 이름</label>
                    <input
                        className="product-update-input"
                        type="text"
                        id="name"
                        name="name"
                        value={updatedSurvey.name}
                        onChange={handleChange}
                        placeholder="설문 이름을 입력하세요"
                        required
                    />
                </div>

                {/* Survey Type */}
                <div className="product-update-field">
                    <label className="product-update-label" htmlFor="type">설문 유형</label>
                    <select
                        className="product-update-input"
                        id="type"
                        name="type"
                        value={updatedSurvey.type}
                        onChange={handleTypeChange}
                        required
                    >
                        <option value="">설문 유형을 선택하세요</option>
                        {surveyTypes.map(type => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Questions */}
                <div className="product-update-field">
                    <label className="product-update-label">질문 목록</label>
                    {updatedSurvey.questions.map((question, qIndex) => (
                        <div key={qIndex} className="survey-question">
                            <input
                                type="text"
                                placeholder={`질문 ${qIndex + 1}`}
                                value={question.questionText}
                                onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                                required
                            />
                            {updatedSurvey.type === "객관식" && (
                                <div className="survey-options">
                                    {question.options.map((option, oIndex) => (
                                        <input
                                            key={oIndex}
                                            type="text"
                                            placeholder={`선택지 ${oIndex + 1}`}
                                            value={option}
                                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                            required
                                        />
                                    ))}
                                    <button type="button" onClick={() => addOption(qIndex)}>+ 선택지 추가</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

       
                

                <button type="submit" className="product-update-button">수정 저장</button>
            </form>
        </div>
    );
};

export default SurveyUpdate;
