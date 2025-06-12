import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faGauge, faUsers, faCalendarAlt, faSignOutAlt, faBars, faFile } from '@fortawesome/free-solid-svg-icons';
import '../css/Header.css';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userType, setUserType] = useState(null);
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
          <div className='header-section1-greeting'>안녕하세요 관리자님</div>
        </div>

        <div className='header-section2'>
          <Link to="/" onClick={handleLinkClick}>
            <div className='header-section2-item'>
              <FontAwesomeIcon icon={faGauge} className='header-section2-item-icon' />
              <div className='header-section2-item-text'>통계</div>
            </div>
          </Link>

          <div className='header-section2-item-employee-container'>
            <Link to="#" onClick={toggleMenu}>
              <div className='header-section2-item-employee'>
                <FontAwesomeIcon icon={faCalendarAlt} className='header-section2-item-employee-icon' />
                <div className='header-section2-item-text'>설문 관리</div>
              </div>
            </Link>
            <div className={`submenu-employee ${isOpen ? 'open' : ''}`}>
            {userType === '1' && (
              <Link to="/survey" className='submenu-item-employee'>문제 관리</Link>
            )}
              <Link to="/survey/answerlists" className='submenu-item-employee'>답변 관리</Link>
            </div>
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
            <Link to="/reservation/list" onClick={handleLinkClick}>
              <div className='header-section2-item'>
                <FontAwesomeIcon icon={faFile} className='header-section2-item-icon' />
                <div className='header-section2-item-text'>상담 예약</div>
              </div>
            </Link>
         
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
