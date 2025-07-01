// ✅ 수정된 SurveyClosedAnswerList.jsx (설문내용 보기 + 입찰내용 보기)

import React, { useState, useEffect } from 'react';
import '../../css/SurveyManagement/Survey.css';
import Header from '../Header.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SurveyClosedAnswerList = () => {
  const [answers, setAnswers] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [yearFilter, setYearFilter] = useState('all');
  const [firstAnswerMap, setFirstAnswerMap] = useState({});
  const [userType, setUserType] = useState(null);
  const [estimateMap, setEstimateMap] = useState({});
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [searchTrigger, setSearchTrigger] = useState(false);
  const [yearList, setYearList] = useState(['all']);

  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const storedType = localStorage.getItem('user_type');
    if (storedType) setUserType(storedType);
  }, []);

 const fetchUserName = async (userId) => {
  if (userMap[userId]) return;
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(`http://52.79.251.176:7777/api/users/userinfo/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data.success) {
      const name = res.data.user.username || res.data.user.name || '알 수 없음';
      setUserMap(prev => ({ ...prev, [userId]: name }));
    } else {
      setUserMap(prev => ({ ...prev, [userId]: '알 수 없음' }));
    }
  } catch {
    setUserMap(prev => ({ ...prev, [userId]: '오류' }));
  }
};


  const fetchEstimates = async (answerList) => {
    const newMap = {};
    for (const ans of answerList) {
      try {
        const res = await axios.get(`http://52.79.251.176:7777/api/estimates/by-answer/${ans._id}`);
        if (res.data.success) newMap[ans._id] = res.data.estimates;
      } catch (err) {
        console.error('입찰 정보 조회 실패:', err);
      }
    }
    setEstimateMap(newMap);
  };

const fetchAnswers = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://52.79.251.176:7777/api/answers', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data.success && Array.isArray(res.data.answer)) {
      const enriched = res.data.answer.map(answer => {
        const regionAnswer = answer.answers?.find(ans => ans.selectedOption && /[시군도구]$/.test(ans.selectedOption.trim()));
        const cityAnswer = answer.answers?.find(ans => ans.writtenAnswer && (ans.name?.includes('예산군') || /EX|\(예:/.test(ans.name)));
        return {
          ...answer,
          region: regionAnswer?.selectedOption?.trim() || '미입력',
          city: cityAnswer?.writtenAnswer?.trim() || '미입력',
        };
      });

      const sorted = enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const filtered = sorted.filter(answer => new Date() - new Date(answer.createdAt) > 7 * 24 * 60 * 60 * 1000);
      setAnswers(filtered);
      fetchEstimates(filtered);

      // 연도 리스트 뽑기
      const years = Array.from(
        new Set(filtered.map(a => new Date(a.createdAt).getFullYear().toString()))
      ).sort((a, b) => b - a);
      setYearList(['all', ...years]);

      const firstMap = {};
      const grouped = {};
      filtered.forEach(a => {
        if (!grouped[a.userId]) grouped[a.userId] = [];
        grouped[a.userId].push(a);
      });
      for (const [userId, list] of Object.entries(grouped)) {
        firstMap[userId] = list.reduce((a, b) => new Date(a.createdAt) < new Date(b.createdAt) ? a : b)._id;
      }
      setFirstAnswerMap(firstMap);

      const userIds = [...new Set(filtered.map(a => a.userId))];
      userIds.forEach(uid => fetchUserName(uid));
    }
  } catch (e) {
    console.error('응답 목록 불러오기 실패:', e);
  }
};


  useEffect(() => { fetchAnswers(); }, []);

  const handleSurveyClick = (id) => navigate(`/survey/answer/detail/${id}`);
  const toggleDetail = (index) => setExpandedIndex(prev => (prev === index ? null : index));

 const filteredAnswers = answers
  .filter(a => yearFilter === 'all' || new Date(a.createdAt).getFullYear().toString() === yearFilter)
  .filter(a => {
  if (!searchTrigger || !searchTerm.trim()) return true;
  const keyword = searchTerm.toLowerCase();
  const username = (userMap[a.userId]?.toLowerCase() || '');
  if (searchCategory === 'region') return a.region?.toLowerCase().includes(keyword);
  if (searchCategory === 'city') return a.city?.toLowerCase().includes(keyword);
  if (searchCategory === 'username') return username.includes(keyword);
  if (searchCategory === 'all') {
    return (
      a.region?.toLowerCase().includes(keyword) ||
      a.city?.toLowerCase().includes(keyword) ||
      username.includes(keyword)
    );
  }
  return true;
});

  const currentAnswers = filteredAnswers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredAnswers.length / itemsPerPage);

  return (
    <div className="product-management-container">
      <Header />
      <div className="product-management-container-container">
        <div className="product-top-container-container">
          <h1>입찰 마감 설문</h1>
    
<div  className="product-search-box" >
  <select  className="search-category" value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}>
    <option value="all">전체</option>
    <option value="region">도</option>
    <option value="city">시/군</option>
    <option value="username">사용자 이름</option>
  </select>
  <input
    type="text"
    placeholder="검색어 입력"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
  <button  className="search-button" onClick={() => setSearchTrigger(true)}>검색</button>
</div>
<div className="year-filter" style={{ margin: '10px 0' }}>
  <label htmlFor="yearFilter" style={{ marginRight: 8, fontWeight: 'bold' }}>연도</label>
  <select
    id="yearFilter"
    value={yearFilter}
    onChange={e => setYearFilter(e.target.value)}
    style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid #aaa', minWidth: 80 }}
  >
    {yearList.map(yr => (
      <option value={yr} key={yr}>{yr === 'all' ? '전체' : yr + '년'}</option>
    ))}
  </select>
</div>
          <table className="product-table">
            <thead>
              <tr>
                <th>번호</th>
                <th>사용자 이름</th>
                <th>생성 날짜</th>
                <th>도</th>
                <th>시/군</th>
                <th>설문내용</th>
                <th>입찰내용</th>
              </tr>
            </thead>
            <tbody>
              {currentAnswers.map((answer, index) => (
                <React.Fragment key={answer._id}>
                  <tr>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td onClick={() => navigate(`/user/${answer.userId}`)} style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>{userMap[answer.userId] || '로딩 중'}</td>
                    <td>{new Date(answer.createdAt).toISOString().split('T')[0]}</td>
                    <td>{answer.region}</td>
                    <td>{answer.city}</td>
                    <td><span style={{ color: 'green', cursor: 'pointer' }} onClick={() => handleSurveyClick(answer._id)}>보기</span></td>
                    <td><span style={{ color: 'green', cursor: 'pointer' }} onClick={() => toggleDetail(index)}>보기 ▼</span></td>
                  </tr>
                  {expandedIndex === index && estimateMap[answer._id] && (
                    <tr>
                      <td colSpan="7">
                        <div className="estimate-detail">
                          {estimateMap[answer._id].length > 0 ? (
                            estimateMap[answer._id].map(est => (
                <table key={est._id} className="estimate-detail-table" style={{ width: '100%' }}>
  <tbody>
    <tr>
      <th style={{ color: 'black', width: '160px', padding: '6px', lineHeight: '1.4' }}>업체명</th>
      <td style={{ padding: '6px', lineHeight: '1.4' }}>{est.manufacturer || '없음'}</td>
    </tr>
    <tr>
      <th style={{ color: 'black', width: '160px', padding: '6px', lineHeight: '1.4' }}>입찰 대리점</th>
      <td style={{ padding: '6px', lineHeight: '1.4' }}>{est.uploadedBy?.companyName || '없음'}</td>
    </tr>
    <tr>
      <th style={{ color: 'black', width: '160px', padding: '6px', lineHeight: '1.4' }}>드론 기종</th>
      <td style={{ padding: '6px', lineHeight: '1.4' }}>{est.droneBaseName || '없음'}</td>
    </tr>
    <tr>
      <th style={{ color: 'black', width: '160px', padding: '6px', lineHeight: '1.4' }}>견적 금액</th>
      <td style={{ padding: '6px', lineHeight: '1.4' }}>{est.price ? `${est.price.toLocaleString()}원` : '없음'}</td>
    </tr>
    {Array.isArray(est.items) && est.items.length > 0 && (
      <tr>
        <th style={{ color: 'black', width: '160px', padding: '6px', lineHeight: '1.4' }}>견적 항목</th>
        <td style={{ padding: '6px', lineHeight: '1.4' }}>
          <ul>
            {est.items.map((item, idx) => (
              <li key={idx}>
                {item.category} / {item.productName || '직접입력 없음'} / {item.quantity}개 / 비고: {item.note || '없음'}
              </li>
            ))}
          </ul>
        </td>
      </tr>
    )}
  </tbody>
</table>

                            ))
                          ) : <div>입찰 내역이 없습니다.</div>}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>이전</button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={currentPage === i + 1 ? 'active' : ''}>{i + 1}</button>
            ))}
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>다음</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyClosedAnswerList;
