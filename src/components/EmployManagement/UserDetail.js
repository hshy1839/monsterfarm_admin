import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/UserDetail.css';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const handleDownload = (filePath, fileName) => {
    const link = document.createElement('a');
    link.href = filePath;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://52.79.251.176:7777/api/users/userinfo/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error('유저 상세 정보 불러오기 실패', err);
      }
    };

    fetchUser();
  }, [id]);

  if (!user) return <p>로딩 중...</p>;

  return (
    <div className="user-detail-container">
      <h1>회원 상세 정보</h1>
      <table className="user-detail-table">
        <tbody>
          <tr><th>아이디</th><td>{user.username}</td></tr>
          <tr><th>이름</th><td>{user.name}</td></tr>
          <tr><th>이메일</th><td>{user.email || '-'}</td></tr>
          <tr><th>연락처</th><td>{user.phoneNumber}</td></tr>
          <tr><th>주소</th><td>{user.address}</td></tr>
  
          {user.user_type === '2' || user.user_type === '1' ? (
            <>
              <tr><th>사업자 등록번호</th><td>{user.businessNumber || '-'}</td></tr>
  
              <tr>
        <th>사업자등록증</th>
        <td>
          {user.businessRegistrationFile ? (
        <a
        href={`http://52.79.251.176:7777/api/users/download/business/${user.businessRegistrationFile?.split('/').pop()}`}
      >
        사업자등록증 다운로드
      </a>
      
          ) : '없음'}
        </td>
      </tr>

      <tr>
        <th>사업자 통장 사본</th>
        <td>
          {user.bankbookFile ? (
          <a
          href={`http://52.79.251.176:7777/api/users/download/bank/${user.bankbookFile?.split('/').pop()}`}
        >
          통장사본 다운로드
        </a>
          ) : '없음'}
        </td>
      </tr>
            </>
          ) : (
            <>
              <tr><th>생년월일</th><td>{new Date(user.birthdate).toLocaleDateString()}</td></tr>
              <tr><th>작물 종류</th><td>{user.cropType}</td></tr>
              {user.customCrop?.trim() && <tr><th>세부 작물</th><td>{user.customCrop}</td></tr>}
            </>
          )}
  
          <tr><th>가입일</th><td>{new Date(user.createdAt).toLocaleString()}</td></tr>
        </tbody>
      </table>
    </div>
  );
  
};

export default UserDetail;
