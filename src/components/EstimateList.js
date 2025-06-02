import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/EstimateList.css';

import { useNavigate } from 'react-router-dom';

const EstimateList = () => {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

    const navigate = useNavigate();

    const handlePreviousPage = () => {
      if (currentPage > 1) setCurrentPage(currentPage - 1);
    };
    const totalPages = Math.ceil(estimates.length / itemsPerPage);
  const pagedUsers = estimates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (pageNum) => setCurrentPage(pageNum);
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));


    useEffect(() => {
      const fetchEstimates = async () => {
        try {
          const token = localStorage.getItem('token');
          const userType = localStorage.getItem('user_type'); // '1' 또는 '2'
    
          let url = 'http://52.79.251.176:7777/api/estimates/all';
          if (userType === '2') {
            url = 'http://52.79.251.176:7777/api/estimates';
          }
    
          const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
    
          if (res.data.success && Array.isArray(res.data.estimates)) {
            setEstimates(res.data.estimates);
          } else {
            console.error('데이터 불러오기 실패');
          }
        } catch (err) {
          console.error('견적서 목록 불러오기 오류:', err);
        } finally {
          setLoading(false);
        }
      };
    
      fetchEstimates();
    }, []);

    const handleApprove = async (id, currentApprovedStatus) => {
      try {
        const token = localStorage.getItem('token');
        const newStatus = !currentApprovedStatus;
        await axios.patch(`http://52.79.251.176:7777/api/estimates/${id}/approve`, 
          { is_approved: newStatus }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
    
        alert(newStatus ? '승인되었습니다.' : '승인 취소되었습니다.');
        setEstimates(prev =>
          prev.map(est => est._id === id ? { ...est, is_approved: newStatus } : est)
        );
      } catch (error) {
        console.error('승인 상태 변경 오류:', error);
        alert('승인 상태 변경 중 오류가 발생했습니다.');
      }
    };
    
    const handleDelete = async (id) => {
      if (!window.confirm('정말 삭제하시겠습니까?')) return;
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://52.79.251.176:7777/api/estimates/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('삭제되었습니다.');
        setEstimates(prev => prev.filter(est => est._id !== id));
      } catch (error) {
        console.error('삭제 오류:', error);
        alert('삭제 중 오류가 발생했습니다.');
      }
    };
    
    

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="estimate-table-wrapper">
      <h2>견적서 리스트</h2>
      <table className="simple-estimate-table">
        <thead>
          <tr>
            <th>#</th>
            <th>작성자</th>
            <th>견적 대상</th>
            <th>제조사</th>
            <th>가격</th>
            <th>업로드일</th>
            <th>선택됨</th>
            <th>승인 여부</th>
            <th>상세보기</th>
            {localStorage.getItem('user_type') === '1' && <th>액션</th>}
          </tr>
        </thead>
        <tbody>
          {pagedUsers.map((est, index) => (
            <tr key={est._id}>
              <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
              <td>{est.uploadedBy?.name || '알 수 없음'}</td>
              <td>{est.answerId?.userId?.name || '알 수 없음'}</td>
              <td>{est.manufacturer}</td>
              <td>{Number(est.price).toLocaleString()} 원</td>
              <td>{new Date(est.createdAt).toLocaleDateString()}</td>
              <td>{est.is_selected ? 'O' : '-'}</td>
              <td>{est.is_approved ? '승인됨' : '미승인'}</td>
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
                  onClick={() => navigate(`/estimate/detail/${est._id}`)}
                >
                  확인
                </button>
              </td>
              {localStorage.getItem('user_type') === '1' && (
                <td>
                  <button onClick={() => handleApprove(est._id)}>승인</button>
                  <button onClick={() => handleDelete(est._id)}>삭제</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button className='prev-page-btn' onClick={handlePreviousPage} disabled={currentPage === 1}>이전</button>
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
        <button className="next-page-btn" onClick={handleNextPage} disabled={currentPage === totalPages}>다음</button>
      </div>
    </div>
  );

};

export default EstimateList;
