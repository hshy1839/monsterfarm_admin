import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/MyInfo.css';
import { useNavigate } from 'react-router-dom'; 

const Myinfo = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();   

  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://52.79.251.176:7777/api/users/userinfoget', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (e) {
        alert('내 정보 불러오기 실패');
      } finally {
        setLoading(false);
      }
    };
    fetchMyInfo();
  }, []);

  if (loading) return <div className="myinfo-loading">로딩 중...</div>;
  if (!user) return <div className="myinfo-error">내 정보를 불러오지 못했습니다.</div>;

  return (
    <div className="myinfo-wrapper">
      <h2 className="myinfo-title">내 정보</h2>
      <table className="myinfo-table">
        <tbody>
          <tr>
            <th className="myinfo-label">이름</th>
            <td className="myinfo-value">{user.name}</td>
          </tr>
          <tr>
            <th className="myinfo-label">아이디</th>
            <td className="myinfo-value">{user.username}</td>
          </tr>
          <tr>
            <th className="myinfo-label">전화번호</th>
            <td className="myinfo-value">{user.phoneNumber}</td>
          </tr>
          <tr>
            <th className="myinfo-label">이메일</th>
            <td className="myinfo-value">{user.email || '-'}</td>
          </tr>
          <tr>
            <th className="myinfo-label">주소</th>
            <td className="myinfo-value">{user.address}</td>
          </tr>
          <tr>
            <th className="myinfo-label">회사명</th>
            <td className="myinfo-value">{user.companyName || '-'}</td>
          </tr>
          <tr>
            <th className="myinfo-label">사업자번호</th>
            <td className="myinfo-value">{user.businessNumber || '-'}</td>
          </tr>
         
          <tr>
            <th className="myinfo-label">계정 활성</th>
            <td className="myinfo-value">{user.is_active ? '활성' : '비활성'}</td>
          </tr>
        </tbody>
      </table>
      <div className="myinfo-btn-area">
        <button
          className="myinfo-password-btn"
          onClick={() => navigate('/change-password')}
        >
          비밀번호 변경
        </button>
      </div>
    </div>
  );
};

export default Myinfo;
