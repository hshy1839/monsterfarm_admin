import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Main from './components/Main';
import Loading from './components/Loading';
import Users from './components/EmployManagement/Users';
import Notice from './components/NoticeManagement/Notice';
import Login from './components/Login';
import NoticeCreate from './components/NoticeManagement/NoticeCreate';
import NoticeDetail from './components/NoticeManagement/NoticeDetail';
import Survey from './components/SurveyManagement/Survey';
import { jwtDecode } from 'jwt-decode';
import SurveyCreate from './components/SurveyManagement/SurveyCreate';
import SurveyDetail from './components/SurveyManagement/SurveyDetail';
import SurveyUpdate from './components/SurveyManagement/SurveyUpdate';
import Setting from './components/Setting';
import HeaderPhone from './components/HeaderPhone';
import SurveyAnswerList from './components/SurveyManagement/SurveyAnswerList';
import AnswerDetail from './components/SurveyManagement/AnswerDetail';

function App() {
  const [loading, setLoading] = useState(true); // 초기 로딩 상태를 true로 설정
  const location = useLocation(); // URL 추적

  useEffect(() => {
    const handleLoad = () => {
      setLoading(false); // 로딩 완료
    };
  
    setLoading(true); // 로딩 시작
  
    if (document.readyState === 'complete') {
      handleLoad(); // 이미 로드된 경우 바로 종료
    } else {
      window.addEventListener('load', handleLoad);
    }
  
    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, [location]);
  

  return (
    <div className="App">
      {loading ? (
        <Loading /> // 로딩 중일 때 로딩 페이지 표시
      ) : (
        <Routes>
        <Route path="/login" element={<Login />} /> {/* 로그인은 제외 */}
      
        <Route path="/" element={<PrivateRoute><><Header /><Main /></></PrivateRoute>} />
        <Route path="/headerphone" element={<PrivateRoute><HeaderPhone /></PrivateRoute>} />
        <Route path="/employeeManagement/users" element={<PrivateRoute><Users /></PrivateRoute>} />
        <Route path="/notice" element={<PrivateRoute><><Header /><Notice /></></PrivateRoute>} />
        <Route path="/notice/noticeCreate" element={<PrivateRoute><><Header /><NoticeCreate /></></PrivateRoute>} />
        <Route path="/notice/noticeDetail/:id" element={<PrivateRoute><NoticeDetail /></PrivateRoute>} />
        <Route path="/survey" element={<PrivateRoute><><Header /><Survey /></></PrivateRoute>} />
        <Route path="/survey/create" element={<PrivateRoute><><Header /><SurveyCreate /></></PrivateRoute>} />
        <Route path="/survey/detail/:id" element={<PrivateRoute><><Header /><SurveyDetail /></></PrivateRoute>} />
        <Route path="/survey/answerlists" element={<PrivateRoute><><Header /><SurveyAnswerList /></></PrivateRoute>} />
        <Route path="/survey/answer/detail/:id" element={<PrivateRoute><><Header /><AnswerDetail /></></PrivateRoute>} />
        <Route path="/survey/detail/:id/update" element={<PrivateRoute><><Header /><SurveyUpdate /></></PrivateRoute>} />
        <Route path="/setting" element={<PrivateRoute><><Header /><Setting /></></PrivateRoute>} />
      </Routes>
      
      )}
    </div>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

const PrivateRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } catch (error) {
      console.error('토큰 디코딩 오류:', error);
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [token, navigate]);

  return <>{children}</>;
};


export default AppWrapper;