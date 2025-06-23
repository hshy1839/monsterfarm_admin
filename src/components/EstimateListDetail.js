import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // ← navigate 추가
import axios from 'axios';
import '../css/EstimateListDetail.css';

const EstimateListDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // ← navigate 사용 선언
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstimateDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://52.79.251.176:7777/api/estimates/detail/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setEstimate(res.data.estimate);
        } else {
          console.error('상세 데이터 불러오기 실패');
        }
      } catch (err) {
        console.error('상세 데이터 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEstimateDetail();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://52.79.251.176:7777/api/estimates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('삭제되었습니다.');
      navigate('/estimate/list'); // ← 목록 페이지로 이동 (경로는 필요에 따라 수정)
    } catch (error) {
      console.error('삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (!estimate) return <div>견적서를 찾을 수 없습니다.</div>;

  return (
    <div className="estimate-detail-wrapper">
      <h2>견적서 상세 정보</h2>
      <table className="estimate-detail-table">
        <tbody>
          <tr>
            <th>견적 작성자</th>
            <td>{estimate.uploadedBy?.name || '알 수 없음'}</td>
          </tr>
          <tr>
            <th>견적 대상</th>
            <td>{estimate.answerId?.userId?.name || '알 수 없음'}</td>
          </tr>
          <tr>
            <th>제조사</th>
            <td>{estimate.manufacturer}</td>
          </tr>
          <tr>
            <th>견적 금액</th>
            <td>{Number(estimate.price).toLocaleString()} 원</td>
          </tr>
          <tr>
            <th>드론 기종명</th>
            <td>{estimate.droneBaseName}</td>
          </tr>
          <tr>
            <th>업로드일</th>
            <td>{new Date(estimate.createdAt).toLocaleString()}</td>
          </tr>
          <tr>
            <th>항목 리스트</th>
            <td>
              <ul>
                {estimate.items?.length > 0 ? (
                  estimate.items.map((item, idx) => (
                    <li key={idx}>
                      {item.category} - 수량: {item.quantity}, 비고: {item.note}
                    </li>
                  ))
                ) : (
                  <li>항목 정보 없음</li>
                )}
              </ul>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 삭제 버튼 */}
      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: '#d9534f',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
          onClick={handleDelete}
        >
          삭제하기
        </button>
      </div>
    </div>
  );
};

export default EstimateListDetail;
