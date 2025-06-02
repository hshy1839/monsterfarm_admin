import React, { useState, useEffect } from 'react';
import '../../css/SurveyManagement/Survey.css';
import Header from '../Header.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Survey = () => {
    const [surveys, setSurveys] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const navigate = useNavigate();

    const moveSurvey = (fromIndex, toIndex) => {
        if (toIndex < 0 || toIndex >= surveys.length) return;
      
        const updated = [...surveys];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        setSurveys(updated);
      
        // 🔥 서버에 저장
        updateSurveyOrder(updated);
      };

      
      const updateSurveyOrder = async (updatedSurveys) => {
        try {
          const token = localStorage.getItem('token');
          await axios.patch(
            'http://52.79.251.176:7777/api/survey/order',
            { surveys: updatedSurveys.map((survey, index) => ({ id: survey._id, order: index })) },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log("✅ 서버에 순서 저장 완료");
        } catch (error) {
          console.error("❌ 서버에 순서 저장 실패", error);
        }
      };

    const fetchSurveys = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('로그인 정보가 없습니다.');
                return;
            }
    
            const response = await axios.get('http://52.79.251.176:7777/api/survey', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            console.log("서버 응답 데이터:", response.data); // ✅ 응답 데이터 확인
    
            // surveys -> survey (올바른 키 값으로 수정)
            if (response.data.success && Array.isArray(response.data.survey)) {
                let filteredSurveys = response.data.survey;
            
                filteredSurveys = filteredSurveys.filter((survey) => {
                    if (searchCategory === 'all') {
                        return survey.name.includes(searchTerm) || survey.type.includes(searchTerm);
                    } else if (searchCategory === 'name') {
                        return survey.name.includes(searchTerm);
                    } else if (searchCategory === 'type') {
                        return survey.type.includes(searchTerm);
                    }
                    return true;
                });
            
                setSurveys(filteredSurveys);
            }
            else {
                console.error('서버 응답이 예상과 다릅니다:', response.data);
            }
        } catch (error) {
            console.error('설문 정보를 가져오는데 실패했습니다.', error);
        }
    };
    
    

    useEffect(() => {
        fetchSurveys();
    }, []);

    const handleSearch = async () => {
        if (searchTerm === '') {
            fetchSurveys();
        } else {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log('로그인 정보가 없습니다.');
                    return;
                }
    
                const response = await axios.get('http://52.79.251.176:7777/api/survey', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                // ✅ 이 부분 수정
                if (response.data.success && Array.isArray(response.data.survey)) {
                    let filteredSurveys = response.data.survey;
    
                    filteredSurveys = filteredSurveys.filter((survey) => {
                        const name = survey.name.toLowerCase();
                        const type = survey.type.toLowerCase();
                        const term = searchTerm.toLowerCase();
    
                        if (searchCategory === 'all') {
                            return name.includes(term) || type.includes(term);
                        } else if (searchCategory === 'name') {
                            return name.includes(term);
                        } else if (searchCategory === 'type') {
                            return type.includes(term);
                        }
                        return true;
                    });
    
                    setSurveys(filteredSurveys);
                } else {
                    console.error('올바르지 않은 데이터 형식:', response.data);
                }
            } catch (error) {
                console.error('설문 정보를 가져오는데 실패했습니다.', error);
            }
        }
    };
    

    const handleSurveyClick = (id) => {
        navigate(`/survey/detail/${id}`);
    };

    const indexOfLastSurvey = currentPage * itemsPerPage;
    const indexOfFirstSurvey = indexOfLastSurvey - itemsPerPage;
    const currentSurveys = surveys.slice(indexOfFirstSurvey, indexOfLastSurvey);
    const totalPages = Math.ceil(surveys.length / itemsPerPage);

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
                            <option value="name">설문 이름</option>
                            <option value="type">유형</option>
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
                                <th>설문 이름</th>
                                <th>유형</th>
                                <th>생성 날짜</th>
                                <th>순서</th>
                            </tr>
                        </thead>
                        <tbody>
  {currentSurveys.length > 0 ? (
    currentSurveys.map((survey, index) => {
      const globalIndex = index + (currentPage - 1) * itemsPerPage;

      return (
        <tr key={survey._id}>
          <td>{globalIndex + 1}</td>
          <td
            onClick={() => handleSurveyClick(survey._id)}
            className='product-title'
          >
            {survey.name || 'Unknown Survey'}
          </td>
          <td>{survey.type || 'Unknown Type'}</td>
          <td>{new Date(survey.createdAt).toISOString().split('T')[0] || 'Unknown date'}</td>
          <td>
            <button onClick={() => moveSurvey(globalIndex, globalIndex - 1)}>▲</button>
            <button onClick={() => moveSurvey(globalIndex, globalIndex + 1)}>▼</button>
          </td>
        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan="4" className="no-results">데이터가 없습니다.</td>
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
                <div className="write-btn-container">
                    <button className="write-btn" onClick={handleWriteClick}>
                        설문추가
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Survey;
