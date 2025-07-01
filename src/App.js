import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Main from './components/Main';
import Loading from './components/Loading';
import Users from './components/EmployManagement/Users';
import Login from './components/Login';
import Survey from './components/SurveyManagement/Survey';
import { jwtDecode } from 'jwt-decode';
import SurveyCreate from './components/SurveyManagement/SurveyCreate';
import SurveyDetail from './components/SurveyManagement/SurveyDetail';
import SurveyUpdate from './components/SurveyManagement/SurveyUpdate';
import HeaderPhone from './components/HeaderPhone';
import SurveyAnswerList from './components/SurveyManagement/SurveyAnswerList';
import AnswerDetail from './components/SurveyManagement/AnswerDetail';
import Signup from './components/Signup';
import UserDetail from './components/EmployManagement/UserDetail';
import EstimateUpload from './components/SurveyManagement/EstimateUpload';
import EstimateList from './components/EstimateList';
import EstimateListDetail from './components/EstimateListDetail';
import ReservationList from './components/SurveyManagement/Reservation';
import SurveyClosedAnswerList from './components/SurveyManagement/SurveyClosedAnswerList';
import MyInfo from './components/Myinfo';
import ChangePassword from './components/ChangePassword';

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
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} /> 
      
        <Route path="/" element={<PrivateRoute><><Header /><Main /></></PrivateRoute>} />
        <Route path="/headerphone" element={<PrivateRoute><HeaderPhone /></PrivateRoute>} />
        <Route path="/employeeManagement/users" element={<PrivateRoute><Users /></PrivateRoute>} />
        <Route path="/survey" element={<PrivateRoute><><Header /><Survey /></></PrivateRoute>} />
        <Route path="/survey/create" element={<PrivateRoute><><Header /><SurveyCreate /></></PrivateRoute>} />
        <Route path="/survey/detail/:id" element={<PrivateRoute><><Header /><SurveyDetail /></></PrivateRoute>} />
        <Route path="/survey/answerlists" element={<PrivateRoute><><Header /><SurveyAnswerList /></></PrivateRoute>} />
        <Route path="/survey/closed/answerlists" element={<PrivateRoute><><Header /><SurveyClosedAnswerList /></></PrivateRoute>} />
        <Route path="/survey/answer/detail/:id" element={<PrivateRoute><><Header /><AnswerDetail /></></PrivateRoute>} />
        <Route path="/survey/detail/:id/update" element={<PrivateRoute><><Header /><SurveyUpdate /></></PrivateRoute>} />
        <Route path="/user/:id" element={<PrivateRoute><><Header /><UserDetail /></></PrivateRoute>} />
        <Route path="/estimate/:id" element={<PrivateRoute><><Header /><EstimateUpload /></></PrivateRoute>} />
        <Route path="/estimate/list" element={<PrivateRoute><><Header /><EstimateList /></></PrivateRoute>} />
        <Route path="/estimate/detail/:id" element={<PrivateRoute><><Header /><EstimateListDetail /></></PrivateRoute>} />
        <Route path="/reservation/:id" element={<PrivateRoute><><Header /><ReservationList /></></PrivateRoute>} />
        <Route path="/reservation/list" element={<PrivateRoute><><Header /><ReservationList /></></PrivateRoute>} />
        <Route path="/reservation/detail/:id" element={<PrivateRoute><><Header /><EstimateListDetail /></></PrivateRoute>} />
         <Route path="/userinfo" element={<PrivateRoute><><Header /><MyInfo /></></PrivateRoute>} />
          <Route path="/change-password" element={<PrivateRoute><><Header /><ChangePassword /></></PrivateRoute>} />
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