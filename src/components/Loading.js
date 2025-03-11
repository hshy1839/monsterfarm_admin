import React from 'react';
import '../css/Loading.css'; // 스타일 시트 임포트

const Loading = () => {
    return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
        </div>
    );
};

export default Loading;
