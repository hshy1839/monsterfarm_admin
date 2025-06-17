import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faGauge, faUsers, faCalendarAlt, faSignOutAlt, faBars, faFile } from '@fortawesome/free-solid-svg-icons';
import '../css/Header.css';
import axios from 'axios';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userType, setUserType] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const type = localStorage.getItem('user_type');
    setUserType(type);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };
  useEffect(() => {
    const type = localStorage.getItem('user_type');
    setUserType(type);

    // 🔥 companyName 불러오기
    const fetchCompanyName = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://52.79.251.176:7777/api/users/userinfoget', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setCompanyName(res.data.user.companyName);
        }
      } catch (err) {
        console.error('회사명 조회 실패:', err);
      }
    };

    fetchCompanyName();
  }, []);


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('user_type');
    navigate('/login');
  };

  return (
    <header className='header-container'>
      <div className='header-container-container'>
        <div className='header-section1'>
          <div className='header-section1-logo'>System</div>
          <div className='header-section1-greeting'>안녕하세요 {companyName}님 </div>
        </div>

        <div className='header-section2'>
          <Link to="/" onClick={handleLinkClick}>
            <div className='header-section2-item'>
              <FontAwesomeIcon icon={faGauge} className='header-section2-item-icon' />
              <div className='header-section2-item-text'>통계</div>
            </div>
          </Link>

          <div className='header-section2-item-employee-container'>
  {userType === '2' ? (
    // userType이 '2'인 경우: 바로 이동
    <Link to="/survey/answerlists" onClick={handleLinkClick}>
      <div className='header-section2-item-employee'>
        <FontAwesomeIcon icon={faCalendarAlt} className='header-section2-item-employee-icon' />
        <div className='header-section2-item-text'>입찰 참여</div>
      </div>
    </Link>
  ) : (
    // 관리자(userType === '1')일 경우: 드롭다운 메뉴
    <>
      <Link to="#" onClick={toggleMenu}>
        <div className='header-section2-item-employee'>
          <FontAwesomeIcon icon={faCalendarAlt} className='header-section2-item-employee-icon' />
          <div className='header-section2-item-text'>입찰 참여</div>
        </div>
      </Link>
      <div className={`submenu-employee ${isOpen ? 'open' : ''}`}>
        <Link to="/survey" className='submenu-item-employee'>설문 문항</Link>
        <Link to="/survey/answerlists" className='submenu-item-employee'>입찰 참여</Link>
        <Link to="/survey/closed/answerlists" className='submenu-item-employee'>입찰마감설문</Link>
      </div>
    </>
  )}
</div>

          {/* user_type이 '1'일 경우에만 고객 관리 탭 표시 */}
          {userType === '1' && (
            <Link to="/employeeManagement/users" onClick={handleLinkClick}>
              <div className='header-section2-item'>
                <FontAwesomeIcon icon={faUsers} className='header-section2-item-icon' />
                <div className='header-section2-item-text'>고객 관리</div>
              </div>
            </Link>
          )}
          <Link to="/estimate/list" onClick={handleLinkClick}>
              <div className='header-section2-item'>
                <FontAwesomeIcon icon={faFile} className='header-section2-item-icon' />
                <div className='header-section2-item-text'>견적서 확인</div>
              </div>
            </Link>
            {userType === '1' && (
            <Link to="/reservation/list" onClick={handleLinkClick}>
              <div className='header-section2-item'>
                <FontAwesomeIcon icon={faFile} className='header-section2-item-icon' />
                <div className='header-section2-item-text'>상담 예약</div>
              </div>
            </Link>
            )}
        </div>

        <div className='header-section3'>
          <div className='header-section3-item' onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} className='header-section2-item-icon' />
            <div className='header-section2-item-text'>로그아웃</div>
          </div>
        </div>
      </div>

      <Link to="/headerphone" onClick={handleLinkClick}>
        <div className="burger-menu">
          <FontAwesomeIcon icon={faBars} className="burger-icon" />
        </div>
      </Link>
    </header>
  );
};

export default Header;
