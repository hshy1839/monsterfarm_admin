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
                const sorted = res.data.answer.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setAnswers(sorted);

                // 🔥 사용자 이름 미리 요청
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

                const response = await axios.get('http://localhost:7777/api/survey', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data.success && Array.isArray(response.data.answer)) {
                    let filteredAnswers = response.data.answer;

                    filteredAnswers = filteredAnswers.filter((survey) => {
                        if (searchCategory === 'all') {
                            return survey.name.includes(searchTerm) || survey.type.includes(searchTerm);
                        } else if (searchCategory === 'name') {
                            return survey.name.includes(searchTerm);
                        } else if (searchCategory === 'type') {
                            return survey.type.includes(searchTerm);
                        }
                        return true;
                    });

                    setAnswers(filteredAnswers);
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
                                <th>사용자 이름</th>
                                <th>유형</th>
                                <th>생성 날짜</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentAnswers.length > 0 ? (
                                currentAnswers.map((answer, index) => (
                                    <tr key={answer._id}>
                                        <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                                        <td
                                            onClick={() => handleSurveyClick(answer._id)}
                                            style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
                                        >
                                            {userMap[answer.userId] || '불러오는 중...'}
                                        </td>

                                        <td>
                                            {answer.answers.map((a, idx) => (
                                                <div key={idx}>{a.type}</div>
                                            ))}
                                        </td>
                                        <td>{new Date(answer.createdAt).toISOString().split('T')[0]}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="no-results">
                                        데이터가 없습니다.
                                    </td>
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

export default SurveyAnswerList;
