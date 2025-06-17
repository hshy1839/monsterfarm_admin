import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/EstimateList.css';
import { useNavigate } from 'react-router-dom';

const ReservationList = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [expanded, setExpanded] = useState({});
  const [dealersMap, setDealersMap] = useState({});
  const [estimateMap, setEstimateMap] = useState({});
  const [expandedIndex, setExpandedIndex] = useState(null);


  const itemsPerPage = 10;

  const filteredReservations = yearFilter === 'all'
    ? reservations
    : reservations.filter(
      r => new Date(r.requestedAt).getFullYear().toString() === yearFilter
    );

  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchEstimates = async (reservationsList) => {
    const newEstimateMap = {};
    const newDealersMap = {};
  
    for (const resv of reservationsList) {
      const answerId = resv.answer?._id;
      if (!answerId) continue;
  
      try {
        const res = await axios.get(`http://52.79.251.176:7777/api/estimates/by-answer/${answerId}`);
        if (res.data.success) {
          const estimates = res.data.estimates;
          const dealerNames = estimates
            .map(e => e.uploadedBy?.companyName)
            .filter((companyName, idx, arr) => companyName && arr.indexOf(companyName) === idx); // 중복 제거
  
          newEstimateMap[answerId] = estimates;
          newDealersMap[answerId] = dealerNames;
        }
      } catch (err) {
        console.error(`입찰 정보 조회 실패 (answerId: ${answerId}):`, err);
      }
    }
  
    setEstimateMap(newEstimateMap);
    setDealersMap(newDealersMap);
  };
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://52.79.251.176:7777/api/reservation', {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        if (Array.isArray(res.data)) {
          const sortedData = res.data.sort(
            (a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)
          );
          setReservations(sortedData);
          await fetchEstimates(sortedData); // 🔥 추가
        } else {
          console.error('데이터 형식 오류');
        }
      } catch (err) {
        console.error('예약 목록 불러오기 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);


  const handleStatusChange = async (id, newStatus, currentStatus) => {
    if (newStatus === currentStatus) return;

    const confirmText =
      newStatus === 'completed'
        ? '해당 예약을 완료됨으로 바꾸시겠습니까?'
        : '해당 예약을 대기 중으로 되돌리시겠습니까?';

    if (!window.confirm(confirmText)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://52.79.251.176:7777/api/reservation/${id}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setReservations(prev =>
        prev.map(resv =>
          resv._id === id ? { ...resv, status: newStatus } : resv
        )
      );
    } catch (error) {
      console.error('상태 업데이트 실패:', error);
      alert('상태 업데이트에 실패했습니다.');
    }
  };
  const toggleDetail = (index) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };
  
  



  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="estimate-table-wrapper">
      <h2>상담 예약 리스트</h2>
      <div style={{ margin: '20px 0' }}>
        <label style={{ fontWeight: 'bold', marginRight: '10px' }}>
          연도별 필터:
        </label>
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        >
          <option value="all">전체</option>
          {Array.from(
            new Set(reservations.map(r => new Date(r.requestedAt).getFullYear()))
          )
            .filter(Boolean)
            .sort((a, b) => b - a)
            .map((y, i) => (
              <option key={i} value={y}>{y}년</option>
            ))}
        </select>
      </div>
      <table className="simple-estimate-table">
        <thead>
          <tr>
            <th>#</th>
            <th>예약자 이름</th>
            <th>전화번호</th>
            <th>설문내용</th>
            <th>입찰내용</th>
            <th>입찰 대리점</th>
            <th>요청일</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
  {paginatedReservations.map((resv, index) => {
    const answerId = resv.answer?._id;

    return (
      <React.Fragment key={resv._id}>
        <tr>
          <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
          <td>
            {resv.user?._id ? (
              <span
                style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                onClick={() => navigate(`/user/${resv.user._id}`)}
              >
                {resv.user.username}
              </span>
            ) : '알 수 없음'}
          </td>
          <td>{resv.user?.phoneNumber || '-'}</td>
          <td>
            {answerId ? (
              <span
                style={{ color: 'green', textDecoration: 'underline', cursor: 'pointer' }}
                onClick={() => navigate(`/survey/answer/detail/${answerId}`)}
              >
                보기
              </span>
            ) : '없음'}
          </td>
          <td>
            {answerId ? (
              <span
                style={{ color: 'green', textDecoration: 'underline', cursor: 'pointer' }}
                onClick={() => toggleDetail(index)}
              >
                보기 ▼
              </span>
            ) : '없음'}
          </td>
          <td>{dealersMap[answerId]?.join(', ') || '없음'}</td>
          <td>{new Date(resv.requestedAt).toLocaleString()}</td>
          <td>
            <select
              value={resv.status}
              onChange={(e) =>
                handleStatusChange(resv._id, e.target.value, resv.status)
              }
            >
              <option value="pending">대기 중</option>
              <option value="completed">완료됨</option>
            </select>
          </td>
        </tr>

        {expandedIndex === index && estimateMap[answerId] && (
  <tr>
    <td colSpan="8">
      <div className="estimate-detail">
        {estimateMap[answerId].length > 0 ? (
          estimateMap[answerId].map((est) => (
            <table key={est._id} className="estimate-detail-table" style={{ width: '100%', marginBottom: '20px', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <th style={{ width: '150px', textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>업체명</th>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{est.manufacturer || '없음'}</td>
                </tr>
                <tr>
                  <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>입찰 대리점</th>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{est.uploadedBy?.companyName || '없음'}</td>
                </tr>
                <tr>
                  <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>드론 기종</th>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{est.droneBaseName || '없음'}</td>
                </tr>
                <tr>
                  <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>견적 금액</th>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{est.price ? `${est.price.toLocaleString()}원` : '없음'}</td>
                </tr>
                <tr>
                  <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>선택됨</th>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{est.is_selected ? '✅' : '❌'}</td>
                </tr>
                <tr>
                  <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>승인됨</th>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{est.is_approved ? '✅' : '❌'}</td>
                </tr>
                {Array.isArray(est.items) && est.items.length > 0 && (
                  <tr>
                    <th style={{ padding: '8px', verticalAlign: 'top' }}>견적 항목</th>
                    <td style={{ padding: '8px' }}>
                      <ul style={{ paddingLeft: '20px', margin: 0 }}>
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
        ) : (
          <div>입찰 내역이 없습니다.</div>
        )}
      </div>
    </td>
  </tr>
)}

      </React.Fragment>
    );
  })}
</tbody>




      </table>
      <div className="pagination">
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
          이전
        </button>

        {[...Array(totalPages)].map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentPage(idx + 1)}
            className={currentPage === idx + 1 ? 'active' : ''}
          >
            {idx + 1}
          </button>
        ))}

        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
          다음
        </button>
      </div>

    </div>
  );
};

export default ReservationList;
