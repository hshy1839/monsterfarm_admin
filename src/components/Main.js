import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/Main.css';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Main = () => {
  const [surveyStats, setSurveyStats] = useState([]);
  const [allAnswers, setAllAnswers] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('토큰이 없습니다.');
          return;
        }

        const res = await axios.get('http://52.79.251.176:7777/api/answers', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          const answers = res.data.answer;

          // 가능한 연도 추출
          const years = [
            ...new Set(answers.map((ans) => new Date(ans.createdAt).getFullYear())),
          ];
          setAvailableYears(years.sort((a, b) => b - a));

          setAllAnswers(answers);
        } else {
          console.error('응답 로드 실패');
        }
      } catch (err) {
        console.error('데이터 로드 실패:', err);
      }
    };

    fetchAnswers();
  }, []);

  useEffect(() => {
    const filterAndProcess = async () => {
      const filtered = allAnswers.filter(
        (ans) => new Date(ans.createdAt).getFullYear() === Number(selectedYear)
      );

      const rawStats = processSurveyStats(filtered);
      const token = localStorage.getItem('token');
      const surveyMeta = await fetchSurveyMeta(rawStats.map(stat => stat.surveyId), token);

      const statsWithMeta = rawStats.map(stat => ({
        ...stat,
        surveyName: surveyMeta[stat.surveyId]?.name || '제목 없음',
        surveyQuestions: surveyMeta[stat.surveyId]?.questions || [],
      }));

      setSurveyStats(statsWithMeta);
    };

    if (allAnswers.length > 0) {
      filterAndProcess();
    }
  }, [selectedYear, allAnswers]);

  const fetchSurveyMeta = async (surveyIds, token) => {
    const metaMap = {};
    const uniqueIds = [...new Set(surveyIds)];

    await Promise.all(
      uniqueIds.map(async (id) => {
        try {
          const res = await axios.get(`http://52.79.251.176:7777/api/survey/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
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

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#f24b4b', '#00c49f', '#ff8042'];

  return (
    <div className="main-container">
      <div className="main-container-header">
        <h1>전체 설문 응답 통계</h1>

        {/* 연도 선택 드롭다운 */}
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="year-selector"
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}년
            </option>
          ))}
        </select>
      </div>

      <div className="main-container-container">
        {surveyStats.map((survey) => {
          const allSubjective =
            survey.surveyQuestions.length > 0 &&
            survey.surveyQuestions.every((q) => q.type === '주관식');
          if (allSubjective) return null;

          const chartData = [];
          Object.entries(survey.questions).forEach(([question, qData]) => {
            if (qData.type !== '객관식') return;

            const mergedResponses = {};
            Object.entries(qData.responses).forEach(([key, count]) => {
              if (key.startsWith('기타-')) {
                mergedResponses['기타'] = (mergedResponses['기타'] || 0) + count;
              } else {
                mergedResponses[key] = count;
              }
            });

            Object.entries(mergedResponses).forEach(([name, value]) => {
              const existing = chartData.find((d) => d.name === name);
              if (existing) {
                existing.value += value;
              } else {
                chartData.push({ name, value });
              }
            });
          });

          return (
            <div key={survey.surveyId} className="main-section1">
              <div className="main-section1-content">
                <div className="main-section1-left">
                  <div className="main-section1-item-text">설문 제목</div>
                  <div className="main-section1-item-detail">{survey.surveyName}</div>

                  <div className="main-section1-question-list">
                    {survey.surveyQuestions.map((q, idx) => (
                      <div key={idx} className="main-section1-question-text">
                        {q.questionText}
                      </div>
                    ))}
                  </div>

                  <div className="main-section1-item-text">총 응답 수</div>
                  <div className="main-section1-item-detail">{survey.totalResponses} 개</div>
                </div>

                <div className="main-section1-right">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Main;
