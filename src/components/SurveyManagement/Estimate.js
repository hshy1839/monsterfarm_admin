import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../../css/SurveyManagement/Estimate.css';

const Estimate = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const { id: answerId } = useParams();
  const [surveyId, setSurveyId] = useState(null);

  useEffect(() => {
    const fetchSurveyId = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:7777/api/answers/${answerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (res.data.success && res.data.answer.answers.length > 0) {
          setSurveyId(res.data.answer.answers[0].surveyId);
        } else {
          alert('설문 ID를 찾을 수 없습니다.');
        }
      } catch (e) {
        console.error('surveyId 불러오기 실패:', e);
      }
    };
  
    fetchSurveyId();
  }, [answerId]);

  if (!surveyId) {
    return <div>잘못된 접근입니다. 설문 ID가 없습니다.</div>;
  }

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleUpload = async () => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
  
    formData.append('surveyId', surveyId);
    files.forEach((file) => {
      formData.append('images', file); // ✅ 서버도 images[]로 받아야 함
    });
  
    try {
      setUploading(true);
      const response = await axios.post('http://localhost:7777/api/estimates', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // ❌ Content-Type 생략해야 FormData 처리 자동
        },
      });
  
      console.log('업로드 성공:', response.data);
      alert('업로드 성공!');
    } catch (error) {
      console.error('업로드 에러:', error);
      alert('업로드 실패: ' + error.response?.data?.message || '서버 오류');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="estimate-upload-container">
      <h2>견적서 이미지 업로드</h2>
      <input type="file" multiple onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? '업로드 중...' : '업로드'}
      </button>

      <div className="preview-container">
        {files.map((file, idx) => (
          <img
            key={idx}
            src={URL.createObjectURL(file)}
            alt={`preview-${idx}`}
            className="preview-image"
          />
        ))}
      </div>
    </div>
  );
};

export default Estimate;
