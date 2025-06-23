import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../css/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (username === '' || password === '') {
      setErrorMessage('아이디와 비밀번호를 모두 입력하세요.');
      return;
    }
  
    try {
      const response = await fetch('http://52.79.103.39:7777/api/users/loginAdmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json();
  
      if (!response.ok || !data.loginSuccess) {
        setErrorMessage(data.message || '로그인 실패');
        return;
      }
  
      localStorage.setItem('isLoggedIn', true);
      localStorage.setItem('token', data.token);
  
      // 토큰에서 user_type 추출 및 저장
      const decoded = JSON.parse(atob(data.token.split('.')[1]));
      localStorage.setItem('user_type', decoded.user_type);
  
      navigate('/');
    } catch (error) {
      console.error('로그인 오류:', error);
      setErrorMessage('로그인 중 오류가 발생했습니다. 서버에 연결할 수 없습니다.');
    }
  };
  



  return (
    <div className='login-container' style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <h1>MonsterFarm</h1>
      <h1>대리점 페이지</h1>
      <form onSubmit={handleSubmit}>
        <div className='login-username-container' style={{ marginBottom: '10px' }}>
          <label htmlFor="username">아이디</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="아이디를 입력하세요"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div className='login-password-container' style={{ marginBottom: '10px' }}>
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <div>
          <button className="login-button" type="submit" style={{ width: '100%', padding: '10px' }}>
            로그인
          </button>
        </div>
        <div>
          <button
            className="sign-button"
            type="button"
            onClick={() => navigate('/signup')}
          >
            회원가입
          </button>
        </div>

      </form>
    </div>
  );
};

export default Login;
