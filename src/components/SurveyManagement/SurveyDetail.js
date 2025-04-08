import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import '../../css/SurveyManagement/SurveyDetail.css';

const SurveyDetail = () => {
  const [survey, setSurvey] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSurveyDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await axios.get(`http://3.36.70.200:7777/api/survey/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setSurvey(res.data.survey);
        }
      } catch (error) {
        console.error('설문 상세 정보를 불러오지 못했습니다.', error);
      }
    };

    fetchSurveyDetail();
  }, [id]);

  const handleEdit = () => navigate(`/survey/detail/${id}/update`);

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`http://3.36.70.200:7777/api/survey/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        alert('삭제 완료');
        navigate('/survey');
      }
    } catch (error) {
      console.error('삭제 실패', error);
    }
  };

  if (!survey) return <div>로딩 중...</div>;

  return (
    <div className="surveyDetail-detail-container">
      <Header />
      <h1 className="surveyDetail-title">설문 상세 정보</h1>

      <div className="surveyDetail-card">
        <p className="surveyDetail-name">{survey.name}</p>
     

        <div className="surveyDetail-questions">
          {survey.questions && survey.questions.length > 0 ? (
            <ul>
              {survey.questions.map((question, idx) => (
                <li key={idx}>
                  <p className="surveyDetail-question">{question.questionText}</p>
                  {question.options && question.options.length > 0 && (
                    <div className="option-list">
                      {question.options.map((opt, i) => (
                        <div key={i} className="option-item">
                          <input type="checkbox" disabled />
                          <label>{opt}</label>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="surveyDetail-meta">등록된 질문이 없습니다.</p>
          )}
        </div>
        <p className="surveyDetail-type"><strong>유형:</strong> {survey.type}</p>
        <p className="surveyDetail-type">
          <strong>생성일:</strong> {new Date(survey.createdAt).toISOString().split('T')[0]}
        </p>
      </div>

      <div className="surveyDetail-button-container">
        <button className="surveyDetail-edit-button" onClick={handleEdit}>수정</button>
        <button className="surveyDetail-delete-button" onClick={handleDelete}>삭제</button>
      </div>
    </div>
  );
};

export default SurveyDetail;
