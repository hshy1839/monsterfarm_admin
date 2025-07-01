import React, { useState } from 'react';
import axios from 'axios';
import '../css/ChangePassword.css';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');

    if (!oldPassword || !newPassword || !confirm) {
      setMsg('모든 항목을 입력하세요.');
      return;
    }
    if (newPassword !== confirm) {
      setMsg('새 비밀번호가 서로 일치하지 않습니다.');
      return;
    }
    if (newPassword.length < 6) {
      setMsg('비밀번호는 최소 6자리 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // PUT 메서드 사용, 엔드포인트 수정!
      const res = await axios.put(
        'http://52.79.251.176:7777/api/users/changePassword',
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert('비밀번호가 성공적으로 변경되었습니다.');
        navigate('/userinfo'); // 비밀번호 변경 후 내 정보 페이지로 이동
      } else {
        setMsg(res.data.message || '비밀번호 변경 실패');
      }
    } catch (e) {
      setMsg(
        e.response?.data?.message
          ? e.response.data.message
          : '비밀번호 변경 중 오류가 발생했습니다.'
      );
    }
    setLoading(false);
  };

  return (
    <div className="change-password-wrapper">
      <h2 className="change-password-title">비밀번호 변경</h2>
      <form className="change-password-form" onSubmit={handleSubmit}>
        <label>
          <span>현재 비밀번호</span>
          <input
            type="password"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        <label>
          <span>새 비밀번호</span>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>
        <label>
          <span>새 비밀번호 확인</span>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </label>
        {msg && <div className="change-password-error">{msg}</div>}
        <button type="submit" disabled={loading}>
          {loading ? '저장 중...' : '저장'}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
