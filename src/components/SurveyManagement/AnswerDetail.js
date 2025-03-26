import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../Header';
import '../../css/SurveyManagement/SurveyDetail.css';

const AnswerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [answer, setAnswer] = useState(null);
  const [userMap, setUserMap] = useState({});
  const [enrichedAnswers, setEnrichedAnswers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // 1. 답변 데이터 가져오기
        const res = await axios.get(`http://localhost:7777/api/answers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.data.success) return;

        const answerData = res.data.answer;

        // 2. 각 질문에 해당하는 설문 제목 가져오기
        const enriched = Array.isArray(answerData.answers)
        ? await Promise.all(
            answerData.answers.map(async (a) => {
              try {
                const surveyRes = await axios.get(
                  `http://localhost:7777/api/survey/${a.surveyId}`,
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
                const surveyName = surveyRes.data?.survey?.name || '';

                return { ...a, surveyName };
              } catch (err) {
                return { ...a, surveyName: '설문 정보 없음' };
              }
            })
          )
        : [];
      

        setAnswer(answerData);
        if (answerData.userId) {
            fetchUserName(answerData.userId);
          }
        setEnrichedAnswers(enriched);
      } catch (err) {
        console.error('답변 상세 조회 중 오류:', err);
      }
    };

    fetchData();
  }, [id]);

  const fetchUserName = async (userId) => {
    if (userMap[userId]) return; // 이미 가져온 경우 skip

    try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:7777/api/users/userinfo/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
            setUserMap(prev => ({ ...prev, [userId]: res.data.user.username }));
        } else {
            setUserMap(prev => ({ ...prev, [userId]: '알 수 없음' }));
        }
    } catch (e) {
        console.error('유저 정보 불러오기 실패:', e);
        setUserMap(prev => ({ ...prev, [userId]: '오류' }));
    }
};

  if (!answer) return <div>로딩 중...</div>;

  return (
    <div className="product-detail-container">
      <Header />
      <h1>설문 응답 상세</h1>
      <div className="product-detail-content">
        <div className="product-info">
          <p><strong>응답 날짜:</strong> {answer.createdAt ? new Date(answer.createdAt).toISOString().split('T')[0] : '알 수 없음'}</p>
          <p>
  <strong>사용자 이름:</strong>{' '}
  {userMap[answer.userId] || '불러오는 중...'}
</p>
          <div className="survey-questions">
            <h2>답변 목록</h2>
            <ul>
              {enrichedAnswers.map((item, idx) => (
                <li key={idx}>
                  <strong>설문명:</strong> {item.surveyName}<br />
                  <strong>질문:</strong> {item.name}<br />
                  <strong>유형:</strong> {item.type}<br />
                  {item.type === '객관식' ? (
                    <p><strong>선택한 보기:</strong> {item.selectedOption || '선택 없음'}</p>
                  ) : (
                    <p><strong>작성한 답변:</strong> {item.writtenAnswer || '미작성'}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="button-container">
            <button className="edit-button" onClick={() => navigate('/answers')}>
              목록으로
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerDetail;
