import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/EstimateList.css';
import { useNavigate } from 'react-router-dom';

const EstimateList = () => {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [filter, setFilter] = useState({
    isApproved: 'all',
    isSelected: 'all',
    manufacturer: 'all',
    region: 'all',
    city: 'all',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('user_type');
        let url = 'http://52.79.251.176:7777/api/estimates/all';
        if (userType === '2') {
          url = 'http://52.79.251.176:7777/api/estimates';
        }

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success && Array.isArray(res.data.estimates)) {
          const enrichedEstimates = res.data.estimates.map(est => {
            const answers = est.answerId?.answers;

            const regionAnswer = answers?.find(ans =>
              ans.selectedOption && /[시군도구]$/.test(ans.selectedOption.trim())
            );

            const cityAnswer = answers?.find(ans =>
              ans.writtenAnswer &&
              (ans.name?.includes('예산군') || /EX|\(예:/.test(ans.name))
            );

            return {
              ...est,
              region: regionAnswer?.selectedOption?.trim() || '미입력',
              city: cityAnswer?.writtenAnswer?.trim() || '미입력',
            };
          });

          setEstimates(enrichedEstimates);
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
      await axios.patch(
        `http://52.79.251.176:7777/api/estimates/${id}/approve`,
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

  const filteredEstimates = estimates.filter(est => {
    const matchApproved =
      filter.isApproved === 'all' ||
      (filter.isApproved === 'approved' && est.is_approved) ||
      (filter.isApproved === 'unapproved' && !est.is_approved);

    const matchSelected =
      filter.isSelected === 'all' ||
      (filter.isSelected === 'selected' && est.is_selected) ||
      (filter.isSelected === 'unselected' && !est.is_selected);

    const matchManufacturer =
      filter.manufacturer === 'all' || est.manufacturer === filter.manufacturer;

    const matchRegion =
      filter.region === 'all' || est.region?.trim() === filter.region.trim();

    const matchCity =
      filter.city === 'all' || est.city?.trim() === filter.city.trim();

    return matchApproved && matchSelected && matchManufacturer && matchRegion && matchCity;
  });

  const totalPages = Math.ceil(filteredEstimates.length / itemsPerPage);
  const pagedUsers = filteredEstimates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handlePageChange = (pageNum) => setCurrentPage(pageNum);

  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="estimate-table-wrapper">
      <h2>견적서 리스트</h2>

      <div className="filter-bar" style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '20px' }}>
          승인 여부:
          <select
            value={filter.isApproved}
            onChange={(e) => setFilter({ ...filter, isApproved: e.target.value })}
            style={{ marginLeft: '8px' }}>
            <option value="all">전체</option>
            <option value="approved">승인됨</option>
            <option value="unapproved">미승인</option>
          </select>
        </label>

        <label style={{ marginRight: '20px' }}>
          선택 여부:
          <select
            value={filter.isSelected}
            onChange={(e) => setFilter({ ...filter, isSelected: e.target.value })}
            style={{ marginLeft: '8px' }}>
            <option value="all">전체</option>
            <option value="selected">선택됨</option>
            <option value="unselected">미선택</option>
          </select>
        </label>

        <label style={{ marginRight: '20px' }}>
          제조사:
          <select
            value={filter.manufacturer}
            onChange={(e) => setFilter({ ...filter, manufacturer: e.target.value })}
            style={{ marginLeft: '8px' }}>
            <option value="all">전체</option>
            {Array.from(new Set(estimates.map(e => e.manufacturer))).filter(Boolean).map((m, i) => (
              <option key={i} value={m}>{m}</option>
            ))}
          </select>
        </label>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
  <label>
    지역 (도):
    <select
      value={filter.region}
      onChange={(e) => setFilter({ ...filter, region: e.target.value })}
      style={{ marginLeft: '8px' }}>
      <option value="all">전체</option>
      {Array.from(new Set(estimates.map(e => e.region))).filter(Boolean).map((r, i) => (
        <option key={i} value={r}>{r}</option>
      ))}
    </select>
  </label>

  <label>
    시/군:
    <select
      value={filter.city}
      onChange={(e) => setFilter({ ...filter, city: e.target.value })}
      style={{ marginLeft: '8px' }}>
      <option value="all">전체</option>
      {Array.from(new Set(estimates.map(e => e.city))).filter(Boolean).map((c, i) => (
        <option key={i} value={c}>{c}</option>
      ))}
    </select>
  </label>
</div>

      </div>

      <table className="simple-estimate-table">
        <thead>
          <tr>
            <th>#</th>
            <th>작성자</th>
            <th>견적 대상</th>
            <th>제조사</th>
            <th>지역</th>
            <th>시/군</th>
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
              <td>{est.region}</td>
              <td>{est.city}</td>
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
                  <button onClick={() => handleApprove(est._id, est.is_approved)}>승인</button>
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
