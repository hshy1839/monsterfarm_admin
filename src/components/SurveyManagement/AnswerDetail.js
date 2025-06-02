import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../Header';
import '../../css/SurveyManagement/AnswerDetail.css';

const AnswerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [answer, setAnswer] = useState(null);
  const [userMap, setUserMap] = useState({});
  const [enrichedAnswers, setEnrichedAnswers] = useState([]);
  const [groupedAnswers, setGroupedAnswers] = useState([]);

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
  
        const enriched = Array.isArray(answerData.answers)
          ? await Promise.all(
              answerData.answers.map(async (a) => {
                try {
                  const surveyRes = await axios.get(
                    `http://localhost:7777/api/survey/${a.surveyId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  const survey = surveyRes.data?.survey;
                  const surveyName = survey?.name || '';
                  const question = survey.questions.find(q => q.questionText === a.name);
                  const options = question?.options || [];
  
                  return {
                    ...a,
                    surveyName,
                    options,
                  };
                } catch (err) {
                  return { ...a, surveyName: '설문 정보 없음', options: [] };
                }
              })
            )
          : [];
  
        setAnswer(answerData);
        if (answerData.userId) {
          fetchUserName(answerData.userId);
        }
  
        const grouped = {};
  
        enriched.forEach((item) => {
          const key = `${item.surveyId}-${item.name}`;
          if (!grouped[key]) {
            grouped[key] = {
              surveyId: item.surveyId,
              name: item.name,
              type: item.type,
              surveyName: item.surveyName,
              options: item.options || [],
              selectedOptions: [],
              writtenAnswers: [],
            };
          }
  
          if (item.type === '객관식') {
            grouped[key].selectedOptions.push(item.selectedOption);
          } else {
            grouped[key].writtenAnswers.push(item.writtenAnswer);
          }
        });
  
        setGroupedAnswers(Object.values(grouped));
  
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
    <div className="answer-detail-container">
      <Header />
      <h1 className="answer-title">설문 응답 정보</h1>
  
      <p className="answer-meta">
        {userMap[answer.userId] || '불러오는 중...'}<strong> 님의 응답 정보</strong>
      </p>
  
      {/* ✅ 여기 groupedAnswers 렌더링 코드 삽입 */}
      {groupedAnswers.map((item, idx) => {
        const selectedList = item.selectedOptions
          .flatMap(opt => opt.split(','))
          .map(o => o.trim());
  
        return (
          <div className="answer-card" key={idx}>
            <p className="survey-name">{item.surveyName}</p>
            <p className="answer-question">{item.name}</p>
            <p className="answer-type"><strong>유형:</strong> {item.type}</p>
  
            {item.type === '객관식' ? (
              <div className="option-list">
                {item.options.map((opt, i) => {
                  const isEtcOption = opt === '기타';
                  let isSelected = false;
                  let etcContent = '';
  
                  if (isEtcOption) {
                    const etcItem = selectedList.find(sel => sel.startsWith('기타-'));
                    if (etcItem) {
                      isSelected = true;
                      etcContent = etcItem.replace('기타-', '').trim();
                    }
                  } else {
                    isSelected = selectedList.includes(opt);
                  }
  
                  return (
                    <div key={i} className={`option-item ${isSelected ? 'selected' : ''}`}>
                      <input type="checkbox" checked={isSelected} readOnly />
                      <label>{opt}</label>
                      {isEtcOption && isSelected && etcContent && (
                        <div className="etc-content">: {etcContent}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="written-answer">
                {item.writtenAnswers.filter(Boolean).join(', ') || '미작성'}
              </p>
            )}
          </div>
        );
      })}
  
      <div className="answerDetail-button-container">
        <button className="edit-button" onClick={() => navigate('/survey/answerlists')}>
          목록으로
        </button>
      </div>
    </div>
  );
  
};

export default AnswerDetail;
