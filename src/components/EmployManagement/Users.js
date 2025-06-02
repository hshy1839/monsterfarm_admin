import React, { useState, useEffect } from 'react';
import '../../css/Users.css';
import Header from '../Header';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const itemsPerPage = 10;

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://52.79.251.176:7777/api/users/userinfo', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setUsers(res.data.users.reverse());
        }
      } catch (err) {
        console.error('유저 정보 불러오기 실패', err);
      }
    };
    fetchUsers();
  }, []);

  const handleAction = async (userId, action) => {
    const token = localStorage.getItem('token');
    let method = 'put';
    let url = `http://52.79.251.176:7777/api/users/userinfo/${userId}`;
    let data = {};
    let message = '';

    if (action === 'delete') {
      method = 'delete';
      message = '해당 사용자를 삭제하시겠습니까?';
    } else if (action === 'activate') {
      data = { is_active: true };
      message = '해당 계정을 승인하시겠습니까?';
    } else if (action === 'deactivate') {
      data = { is_active: false };
      message = '해당 계정을 중지하시겠습니까?';
    } else {
      const roleMap = { '1': '관리자', '2': '부관리자' };
      data = { user_type: action };
      message = `해당 사용자를 ${roleMap[action]}로 변경하시겠습니까?`;
    }

    const confirmed = window.confirm(message);
    if (!confirmed) return;

    try {
      const res = await axios({
        method,
        url,
        data,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setUsers(prev =>
          prev.filter(user => !(action === 'delete' && user._id === userId)).map(user =>
            user._id === userId ? { ...user, ...data } : user
          )
        );
      } else {
        alert('처리에 실패했습니다.');
      }
    } catch (err) {
      console.error('액션 처리 실패', err);
    }
  };

  const totalPages = Math.ceil(users.length / itemsPerPage);
  const pagedUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (pageNum) => setCurrentPage(pageNum);
  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  return (
    <div className="users-management-container">
      <Header />
      <div className="users-container">
        <h1 className="users-title">회원 관리</h1>

        <table className="users-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>아이디</th>
              <th>이름</th>
              <th>연락처</th>
              <th>가입일</th>
              <th>유저 권한</th>
              <th>상세 정보</th>
              <th>회원 관리</th>
              <th>활성화 상태</th>

            </tr>
          </thead>
          <tbody>
            {pagedUsers.map((user, idx) => (
              <tr key={user._id}>
                <td>{users.length - ((currentPage - 1) * itemsPerPage + idx)}</td>
                <td>{user.username}</td>
                <td>{user.name}</td>
                <td>{user.phoneNumber}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  {user.user_type === '1'
                    ? '관리자'
                    : user.user_type === '2'
                      ? '부관리자'
                      : '일반 유저'}
                </td>

                <td>
                  <button
                    className="users-detail-btn"
                    onClick={() => navigate(`/user/${user._id}`)}
                  >
                    보기
                  </button>
                </td>
                <td>
                  <select
                    className="users-role-select"
                    defaultValue=""
                    onChange={(e) => handleAction(user._id, e.target.value)}
                  >
                    <option value="" disabled>선택</option>
                    <option value="1">관리자 임명</option>
                    <option value="2">부관리자 임명</option>
                    <option value="activate">계정 승인</option>
                    <option value="deactivate">계정 중지</option>
                    <option value="delete">계정 삭제</option>
                  </select>
                </td>
                <td>{user.is_active ? '활성화됨' : '비활성화됨'}</td>

              </tr>
            ))}
          </tbody>
        </table>

        {/* 페이지네이션 */}
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

        {/* 모달 */}
        {selectedUser && (
          <div className="users-modal-overlay" onClick={() => setSelectedUser(null)}>
            <div className="users-modal" onClick={(e) => e.stopPropagation()}>
              <h2>회원 상세 정보</h2>
              <p><strong>아이디:</strong> {selectedUser.username}</p>
              <p><strong>이름:</strong> {selectedUser.name}</p>
              <p><strong>연락처:</strong> {selectedUser.phoneNumber}</p>
              <p><strong>이메일:</strong> {selectedUser.email || '-'}</p>
              <p><strong>생년월일:</strong> {new Date(selectedUser.birthdate).toLocaleDateString()}</p>
              <p><strong>주소:</strong> {selectedUser.address}</p>
              <p><strong>작물 종류:</strong> {selectedUser.cropType}</p>
              {selectedUser.customCrop && selectedUser.customCrop.trim() !== '' && (
                <p><strong>세부 작물:</strong> {selectedUser.customCrop}</p>
              )}
              <p><strong>가입일:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>
              <button className="users-close-btn" onClick={() => setSelectedUser(null)}>닫기</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
