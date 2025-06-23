import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/EstimateList.css';
import { useNavigate } from 'react-router-dom';

const EstimateList = () => {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [resultMap, setResultMap] = useState({});

  const [filter, setFilter] = useState({
    isApproved: 'all',
    isSelected: 'all',
    manufacturer: 'all',
    region: 'all',
    city: 'all',
    year: 'all',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('user_type');
        let url = 'http://52.79.251.176:7777/api/estimates/all';
        if (userType === '2') url = 'http://52.79.251.176:7777/api/estimates';

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success && Array.isArray(res.data.estimates)) {
          const enrichedEstimates = res.data.estimates.map(est => {
            const answers = est.answerId?.answers;
            const regionAnswer = answers?.find(ans => ans.selectedOption && /[가-힣]$/.test(ans.selectedOption.trim()));
            const cityAnswer = answers?.find(ans => ans.writtenAnswer && (ans.name?.includes('예산군') || /EX|\(예:/.test(ans.name)));
            return {
              ...est,
              region: regionAnswer?.selectedOption?.trim() || '미입력',
              city: cityAnswer?.writtenAnswer?.trim() || '미입력',
            };
          });
          setEstimates(enrichedEstimates);
        }
      } catch (err) {
        console.error('견적서 목록 불러오기 오류:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEstimates();
  }, []);

  const handleToggleResult = async (index, answerId, estimateCreatedAt) => {
    const now = new Date();
    const created = new Date(estimateCreatedAt);
    const diffMs = now - created;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays < 7) {
      alert(`입찰 마감까지 ${6 - diffDays}일 ${23 - diffHours}시간이 남았습니다.`);
      return;
    }

    if (expandedIndex === index) {
      setExpandedIndex(null);
      return;
    }

    if (!resultMap[answerId]) {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://52.79.251.176:7777/api/estimates/by-answer/${answerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) setResultMap(prev => ({ ...prev, [answerId]: res.data.estimates }));
      } catch (e) {
        alert('결과 조회 실패');
        return;
      }
    }
    setExpandedIndex(index);
  };

  const filteredEstimates = estimates.filter(est => {
    const matchApproved = filter.isApproved === 'all' ||
      (filter.isApproved === 'approved' && est.is_approved) ||
      (filter.isApproved === 'unapproved' && !est.is_approved);
    const matchSelected = filter.isSelected === 'all' ||
      (filter.isSelected === 'selected' && est.is_selected) ||
      (filter.isSelected === 'unselected' && !est.is_selected);
    const matchManufacturer = filter.manufacturer === 'all' || est.manufacturer === filter.manufacturer;
    const matchRegion = filter.region === 'all' || est.region?.trim() === filter.region.trim();
    const matchCity = filter.city === 'all' || est.city?.trim() === filter.city.trim();
    return matchApproved && matchSelected && matchManufacturer && matchRegion && matchCity;
  });

  const totalPages = Math.ceil(filteredEstimates.length / itemsPerPage);
  const pagedUsers = filteredEstimates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handlePageChange = (pageNum) => setCurrentPage(pageNum);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
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
            <th>지역</th>
            <th>시/군</th>
            <th>가격</th>
            <th>업로드일</th>
            <th>선택됨</th>
            <th>승인 여부</th>
            <th>상세보기</th>
            <th>결과보기</th>
          </tr>
        </thead>
        <tbody>
          {pagedUsers.map((est, index) => (
            <React.Fragment key={est._id}>
              <tr>
                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td>{est.uploadedBy?.name || '알 수 없음'}</td>
                <td>{est.answerId?.userId?.name || '알 수 없음'}</td>
                <td>{est.manufacturer}</td>
                <td>{est.region}</td>
                <td>{est.city}</td>
                <td>{Number(est.price).toLocaleString()} 원</td>
                <td>{new Date(est.createdAt).toLocaleDateString()}</td>
                <td>{est.is_selected ? 'O' : 'X'}</td>
                <td>{est.is_approved ? '승인됨' : '미승인'}</td>
                <td>
                  <button onClick={() => navigate(`/estimate/detail/${est._id}`)}>확인</button>
                </td>
                <td>
                  <button onClick={() => handleToggleResult(index, est.answerId?._id, est.createdAt)}>
                    결과보기 ▼
                  </button>
                </td>
              </tr>
              {expandedIndex === index && resultMap[est.answerId?._id] && (
                <tr>
                  <td colSpan="12">
                    <div style={{ padding: '10px', background: '#f9f9f9' }}>
                      {resultMap[est.answerId._id].length === 0 ? (
                        <p>입찰 참여 내역이 없습니다.</p>
                      ) : (
                        resultMap[est.answerId._id]
                          .filter(r => r._id === est._id)
                          .map((r, i) => (
                            <div key={i} style={{ marginBottom: '15px' }}>
                              <table style={{ width: '100%', border: '1px solid #ccc' }}>
                                <tbody>
                                  <tr>
                                    <th>업체명</th>
                                    <td>{r.manufacturer || '없음'}</td>
                                  </tr>
                                  {localStorage.getItem('user_type') === '1' && (
                                    <tr>
                                      <th>입찰 대리점</th>
                                      <td>{r.uploadedBy?.companyName || '없음'}</td>
                                    </tr>
                                  )}
                                  <tr>
                                    <th>드론 기종</th>
                                    <td>{r.droneBaseName || '없음'}</td>
                                  </tr>
                                  <tr>
                                    <th>견적 금액</th>
                                    <td>{r.price?.toLocaleString()} 원</td>
                                  </tr>
                                  {localStorage.getItem('user_type') === '1' && (
                                    <tr>
                                      <th>견적 항목</th>
                                      <td>
                                        <ul>
                                          {r.items?.map((item, idx) => (
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
                            </div>
                          ))
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>이전</button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => handlePageChange(i + 1)}
            className={currentPage === i + 1 ? 'active' : ''}
          >
            {i + 1}
          </button>
        ))}
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>다음</button>
      </div>
    </div>
  );
};

export default EstimateList;
