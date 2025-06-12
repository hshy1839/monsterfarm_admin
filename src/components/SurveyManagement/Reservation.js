import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/EstimateList.css';
import { useNavigate } from 'react-router-dom';

const ReservationList = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://52.79.251.176:7777/api/reservation', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(res.data)) {
          setReservations(res.data);
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

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="estimate-table-wrapper">
      <h2>상담 예약 리스트</h2>

      <table className="simple-estimate-table">
        <thead>
          <tr>
            <th>#</th>
            <th>예약자 이름</th>
            <th>전화번호</th>
            <th>요청일</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((resv, index) => (
            <tr key={resv._id}>
              <td>{index + 1}</td>
              <td>{resv.user?.username || '알 수 없음'}</td>
              <td>{resv.user?.phoneNumber || '-'}</td>
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReservationList;
