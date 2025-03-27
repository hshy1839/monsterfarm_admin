import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/Main.css';

const Main = () => {
  const [surveyStats, setSurveyStats] = useState([]);

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('토큰이 없습니다.');
          return;
        }

        const res = await axios.get('http://localhost:7777/api/answers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.data.success) {
          const rawStats = processSurveyStats(res.data.answer);
          const surveyMeta = await fetchSurveyMeta(rawStats.map(stat => stat.surveyId), token);
        
          const statsWithMeta = rawStats.map(stat => ({
            ...stat,
            surveyName: surveyMeta[stat.surveyId]?.name || '제목 없음',
            surveyQuestions: surveyMeta[stat.surveyId]?.questions || [],
          }));
        
          setSurveyStats(statsWithMeta);
        }
         else {
          console.error('응답 로드 실패');
        }
      } catch (err) {
        console.error('데이터 로드 실패:', err);
      }
    };

    fetchAnswers();
  }, []);

  const fetchSurveyMeta = async (surveyIds, token) => {
    const metaMap = {};
    const uniqueIds = [...new Set(surveyIds)];
  
    await Promise.all(
      uniqueIds.map(async (id) => {
        try {
          const res = await axios.get(`http://localhost:7777/api/survey/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.data.success && res.data.survey) {
            metaMap[id] = {
              name: res.data.survey.name || '제목 없음',
              questions: res.data.survey.questions || [],
            };
          }
        } catch (error) {
          console.error(`설문 ${id} 메타 정보 불러오기 실패:`, error);
        }
      })
    );
  
    return metaMap;
  };
  

  const processSurveyStats = (answerList) => {
    const statsMap = {};

    answerList.forEach((response) => {
      response.answers.forEach((ans) => {
        const surveyId = ans.surveyId;
        const question = ans.name;
        const type = ans.type;
        const selectedOption = ans.selectedOption;
        const writtenAnswer = ans.writtenAnswer;

        if (!statsMap[surveyId]) {
          statsMap[surveyId] = {
            totalResponses: 0,
            questions: {},
          };
        }

        statsMap[surveyId].totalResponses += 1;

        if (!statsMap[surveyId].questions[question]) {
          statsMap[surveyId].questions[question] = {
            type,
            responses: {},
          };
        }

        if (type === '객관식') {
          const options = selectedOption.split(',').map((opt) => opt.trim());
          options.forEach((opt) => {
            if (!statsMap[surveyId].questions[question].responses[opt]) {
              statsMap[surveyId].questions[question].responses[opt] = 0;
            }
            statsMap[surveyId].questions[question].responses[opt] += 1;
          });
        } else if (type === '주관식') {
          if (!statsMap[surveyId].questions[question].responses[writtenAnswer]) {
            statsMap[surveyId].questions[question].responses[writtenAnswer] = 0;
          }
          statsMap[surveyId].questions[question].responses[writtenAnswer] += 1;
        }
      });
    });

    return Object.entries(statsMap).map(([surveyId, data]) => ({
      surveyId,
      ...data,
    }));
  };

  return (
    <div className="main-container">
      <div className="main-container-header">
        <h1>전체 설문 응답 통계</h1>
      </div>
      <div className="main-container-container">
      {surveyStats.map((survey) => (
  <div key={survey.surveyId} className="main-section1">
    <div className="main-section1-item-container">
      {/* 설문 제목 */}
      <div className="main-section1-item">
        <div className="main-section1-item-text">설문 제목</div>
        <div className="main-section1-item-detail">{survey.surveyName}</div>

        {/* 설문에 등록된 질문 목록 */}
        <div className="main-section1-question-list">
          {survey.surveyQuestions.map((q, idx) => (
            <div key={idx} className="main-section1-question-text">
              질문 {idx + 1}: {q.questionText}
            </div>
          ))}
        </div>
      </div>

      {/* 총 응답 수를 아래로 */}
      <div className="main-section1-item">
        <div className="main-section1-item-text">총 응답 수</div>
        <div className="main-section1-item-detail">{survey.totalResponses} 개</div>
      </div>
    </div>

    {/* 질문별 응답 통계 */}
    <div className="main-section1-item-container">
      {Object.entries(survey.questions).map(([question, qData], idx) => (
        <div key={idx} className="main-section1-item">
          <div className="main-section1-item-text">{question}</div>
          <div className="main-section1-item-percent">
            {Object.entries(qData.responses).map(([resp, count], rIdx) => (
              <div key={rIdx} className="main-section1-item-detail">
                {resp}: {count}명
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
))}

      </div>
    </div>
  );
};

export default Main;
