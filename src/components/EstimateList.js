import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/EstimateList.css';

import { useNavigate } from 'react-router-dom';

const EstimateList = () => {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

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
            <th>견적서 선택</th>
            <th>상세보기</th>
          </tr>
        </thead>
        <tbody>
          {estimates.map((est, index) => (
            <tr key={est._id}>
              <td>{index + 1}</td>
              <td>{est.uploadedBy?.name || '알 수 없음'}</td>
              <td>{est.answerId?.userId?.name || '알 수 없음'}</td>
              <td>{est.manufacturer}</td>
              <td>{Number(est.price).toLocaleString()} 원</td>
              <td>{new Date(est.createdAt).toLocaleDateString()}</td>
              <td>{est.is_selected ? 'O' : '-'}</td>

              <td>
              <button
             style={{ color: 'black', cursor: 'pointer', background: 'whitesmoke', border: '1px solid black', borderRadius: '5px', width: '50%' }}
             onClick={() => navigate(`/estimate/detail/${est._id}`)}
              >
                확인
              </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EstimateList;
