import React, { useState, useEffect } from 'react';
import '../css/Main.css';
import axios from 'axios';

const Main = () => {
  // const [activeCouponsCount, setActiveCouponsCount] = useState(0);
  const [totalProductsCount, setTotalProductsCount] = useState(0); // 상품 개수 상태 변수
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);

  useEffect(() => {
    const fetchPendingApprovalCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('토큰이 없습니다. 로그인 후 다시 시도하세요.');
          return;  // 토큰이 없으면 요청을 보내지 않음
        }
    
        const response = await axios.get('http://localhost:7777/api/users/userinfo', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        if (response.data.success && Array.isArray(response.data.users)) {
          const inactiveUsers = response.data.users.filter(user => !user.is_active);
          setPendingApprovalCount(inactiveUsers.length);
        } else {
          console.error('가입 승인 대기 유저 수 가져오기 실패');
        }
      } catch (error) {
        console.error('가입 승인 대기 유저 수 가져오기 실패:', error);
      }
    };
    fetchPendingApprovalCount();
  }, []);

  useEffect(() => {
    const fetchTotalProductsCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:7777/api/products/allProduct', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.success && Array.isArray(response.data.products)) {
          setTotalProductsCount(response.data.products.length); // 상품 개수 저장
        } else {
          console.error('상품 데이터 로드 실패');
        }
      } catch (error) {
        console.error('상품 개수 가져오기 실패:', error);
      }
    };

    fetchTotalProductsCount();
  }, []);

  // useEffect(() => {
  //   const fetchActiveCouponsCount = async () => {
  //     try {
  //       const token = localStorage.getItem('token');
  //       const response = await axios.get('http://localhost:7777/api/coupons', {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });
  //       if (response.data.success) {
  //         const activeCoupons = response.data.coupons.filter(coupon => coupon.isActive);
  //         setActiveCouponsCount(activeCoupons.length);
  //       } else {
  //         console.error('활성화된 쿠폰 수 가져오기 실패');
  //       }
  //     } catch (error) {
  //       console.error('활성화된 쿠폰 수 가져오기 실패:', error);
  //     }
  //   };

  //   fetchActiveCouponsCount();
  // }, []);

  return (
    <div className="main-container">
      <div className='main-container-header'>
      <h1>몬스터팜 <br />관리자 페이지</h1>
      </div>
      <div className="main-container-container">
        <div className="main-section1">
          <div className="main-section1-item-container">
            {/* <div className="main-section1-item">
              <div className="main-section1-item-text">활성화된 쿠폰</div>
              <div className="main-section1-item-percent">
                <div className="main-section1-item-detail">{activeCouponsCount} 개</div>
              </div>
            </div> */}
            <div className="main-section1-item">
              <div className="main-section1-item-text">상품 개수</div>
              <div className="main-section1-item-percent">
                <div className="main-section1-item-detail">{totalProductsCount} 개</div>
              </div>
            </div>
            <div className="main-section1-item">
              <div className="main-section1-item-text">가입 승인 대기</div>
              <div className="main-section1-item-percent">
                <div className="main-section1-item-detail">{pendingApprovalCount} 명</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
