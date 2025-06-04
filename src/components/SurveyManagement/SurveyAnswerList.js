import React, { useState, useEffect } from 'react';
import '../../css/SurveyManagement/Survey.css';
import Header from '../Header.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SurveyAnswerList = () => {
    const [answers, setAnswers] = useState([]);
    const [userMap, setUserMap] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [firstAnswerMap, setFirstAnswerMap] = useState({});
    const [userType, setUserType] = useState(null);
    const [estimateCountMap, setEstimateCountMap] = useState({});


useEffect(() => {
  const storedType = localStorage.getItem('user_type');
  if (storedType) {
    setUserType(storedType);
  }
}, []);

    const itemsPerPage = 10;

    const navigate = useNavigate();

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

    const fetchAnswers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:7777/api/answers', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success && Array.isArray(res.data.answer)) {
              const sorted = res.data.answer.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // ✅ 내림차순 (최신순)

            
              setAnswers(sorted);

              sorted.forEach(answer => {
                fetchEstimateCount(answer._id);
              });
              
            
              // ✅ 각 userId의 가장 첫 응답 ID 저장
              const firstMap = {};
              for (const answer of sorted) {
                if (!firstMap[answer.userId]) {
                  firstMap[answer.userId] = answer._id;
                }
              }
              setFirstAnswerMap(firstMap);
            
              const userIds = [...new Set(sorted.map(a => a.userId))];
              userIds.forEach(uid => fetchUserName(uid));
            }
            
        } catch (e) {
            console.error('응답 목록 불러오기 실패:', e);
        }
    };

    useEffect(() => {
        fetchAnswers();
    }, []);



    useEffect(() => {
        fetchAnswers();
    }, []);

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('정말 이 응답을 삭제하시겠습니까?');
        if (!confirmDelete) return;
      
        try {
          const token = localStorage.getItem('token');
          const res = await axios.delete(`http://localhost:7777/api/answers/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
      
          if (res.data.success) {
            alert('응답이 삭제되었습니다.');
            fetchAnswers(); // 목록 새로고침
          } else {
            alert('삭제 실패: ' + res.data.message);
          }
        } catch (err) {
          console.error('삭제 중 오류:', err);
          alert('서버 오류로 삭제에 실패했습니다.');
        }
      };

      const fetchEstimateCount = async (answerId) => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`http://localhost:7777/api/estimates/my/count/${answerId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
      
          if (res.data.success) {
            setEstimateCountMap(prev => ({ ...prev, [answerId]: res.data.count }));
          }
        } catch (e) {
          console.error(`견적 횟수 조회 실패 (answerId: ${answerId}):`, e);
          setEstimateCountMap(prev => ({ ...prev, [answerId]: 0 }));
        }
      };

      const getUserIdFromToken = (token) => {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
      };

      const handleSearch = async () => {
        if (searchTerm === '') {
            fetchAnswers();
        } else {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log('로그인 정보가 없습니다.');
                    return;
                }
    
                const response = await axios.get('http://localhost:7777/api/answers', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                if (response.data.success && Array.isArray(response.data.answer)) {
                    let filteredAnswers = response.data.answer;
    
                    // 🔥 유저 이름 기반 필터링 (userMap은 useEffect로 채워졌다고 가정)
                    filteredAnswers = filteredAnswers.filter((answer) => {
                        const username = userMap[answer.userId] || '';
                        const answerYear = new Date(answer.createdAt).getFullYear().toString();
                        const term = searchTerm.toLowerCase();
                      
                        if (searchCategory === 'all') {
                          return (
                            username.toLowerCase().includes(term) ||
                            answerYear.includes(term)
                          );
                        }
                      
                        if (searchCategory === 'name') {
                          return username.toLowerCase().includes(term);
                        }
                      
                        if (searchCategory === 'year') {
                          return answerYear.includes(term);
                        }
                      
                        return true;
                      });
                      
                    
    
                    setAnswers(filteredAnswers);
    
                    // 🔄 필터링 후 누락된 유저 정보가 있을 수 있으니 다시 불러오기
                    const userIds = [...new Set(filteredAnswers.map(a => a.userId))];
                    userIds.forEach(uid => fetchUserName(uid));
                } else {
                    console.error('올바르지 않은 데이터 형식:', response.data);
                }
            } catch (error) {
                console.error('설문 정보를 가져오는데 실패했습니다.', error);
            }
        }
    };
    

    const handleSurveyClick = (id) => {
        navigate(`/survey/answer/detail/${id}`);
    };

    const indexOfLastSurvey = currentPage * itemsPerPage;
    const indexOfFirstSurvey = indexOfLastSurvey - itemsPerPage;
    const currentAnswers = answers.slice(indexOfFirstSurvey, indexOfLastSurvey);
    const totalPages = Math.ceil(answers.length / itemsPerPage);

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleWriteClick = () => {
        navigate('/survey/create');
    };

    return (
        <div className="product-management-container">
            <Header />
            <div className="product-management-container-container">
                <div className="product-top-container-container">
                    <h1>설문조사 관리</h1>
                    <div className="product-search-box">
                        <select
                            className="search-category"
                            value={searchCategory}
                            onChange={(e) => setSearchCategory(e.target.value)}
                        >
                            <option value="all">전체</option>
                            <option value="name">사용자 이름</option>
                            <option value="year">연도</option>
                        </select>
                        <input
                            type="text"
                            placeholder="검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="search-button" onClick={handleSearch}>
                            검색
                        </button>
                    </div>

                    <table className="product-table">
                    <thead>
  <tr>
    <th>번호</th>
    <th>사용자 이름</th>
    <th>생성 날짜</th>
    <th>신규 여부</th> {/* ✅ 추가 */}
    {userType !== '2' && <th>삭제</th>}
    <th>견적서</th>
    <th>견적 횟수</th>
  </tr>
</thead>

<tbody>
  {currentAnswers.length > 0 ? (
    (() => {
      const seenUserIds = new Set();

      return currentAnswers.map((answer, index) => {
        const userId = answer.userId;
        const username = userMap[userId] || '불러오는 중...';
        const isFirst = !seenUserIds.has(userId);
        seenUserIds.add(userId);

        return (
          <tr key={answer._id}>
            <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
            <td
              onClick={() => handleSurveyClick(answer._id)}
              style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
            >
              {username}
            </td>
            <td>{new Date(answer.createdAt).toISOString().split('T')[0]}</td>
            <td>{firstAnswerMap[answer.userId] === answer._id ? '신규' : '추가 설문'}</td>
            {userType !== '2' &&<td>
              <button
                onClick={() => handleDelete(answer._id)}
                style={{ color: 'red', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                삭제
              </button>
            </td>}
            <td>
  <button
    style={{
      color: 'black',
      cursor: 'pointer',
      background: 'whitesmoke',
      border: '1px solid black',
      borderRadius: '5px',
      width: '50%',
    }}
    onClick={() => {
      if ((estimateCountMap[answer._id] ?? 0) >= 2) {
        alert('견적서는 최대 2번까지 보낼 수 있습니다.');
        return; // 이동 차단
      }
      navigate(`/estimate/${answer._id}`);
    }}
  >
    보내기
  </button>
</td>
            <td>{estimateCountMap[answer._id] ?? '...'}</td>
          </tr>
        );
      });
    })()
  ) : (
    <tr>
      <td colSpan="5" className="no-results">데이터가 없습니다.</td>
    </tr>
  )}
</tbody>


                    </table>

                    <div className="pagination">
                        <button className='prev-page-btn' onClick={handlePreviousPage} disabled={currentPage === 1}>
                            이전
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => handlePageChange(i + 1)}
                                className={currentPage === i + 1 ? 'active' : ''}
                                id='page-number-btn'
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button className="next-page-btn" onClick={handleNextPage} disabled={currentPage === totalPages}>
                            다음
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SurveyAnswerList;
