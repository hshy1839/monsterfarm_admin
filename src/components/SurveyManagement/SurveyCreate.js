import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/SurveyManagement/SurveyCreate.css';

const SurveyCreate = () => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([]); // 객관식 선택지
  const navigate = useNavigate();

  // 설문 타입 변경 핸들러
  const handleTypeChange = (e) => {
    setType(e.target.value);
    setOptions([]); // 타입 변경 시 선택지 초기화
  };

  // 객관식 선택지 추가
  const addOption = () => {
    setOptions([...options, '']); // 빈 선택지 추가
  };

  // 선택지 입력 핸들러
  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  // 설문 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !type || !questionText) {
      alert('모든 필수 입력란을 작성해주세요.');
      return;
    }

    if (type === "객관식" && (options.length === 0 || options.some(opt => opt.trim() === ''))) {
      alert('객관식 질문은 최소 하나의 선택지를 가져야 합니다.');
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(
        'http://localhost:7777/api/survey/create',
        {
          name,
          type,
          questions: [
            {
              questionText,
              options: type === "객관식" ? options : [],
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        alert('설문이 성공적으로 등록되었습니다.');
        navigate('/survey');
      } else {
        alert('설문 등록 실패: ' + response.data.message);
      }
    } catch (error) {
      console.error('설문 등록 실패:', error.message);
      alert('설문 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="survey-create-container">
      <h2 className="survey-create-title">설문 등록</h2>
      <form className="survey-create-form" onSubmit={handleSubmit}>
        {/* 설문 이름 */}
        <div className="survey-create-field">
          <label htmlFor="name">설문 이름</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="설문 이름을 입력하세요"
            required
          />
        </div>

        {/* 설문 타입 */}
        <div className="survey-create-field">
          <label htmlFor="type">타입</label>
          <select id="type" value={type} onChange={handleTypeChange} required>
            <option value="">설문 타입을 선택하세요</option>
            <option value="주관식">주관식</option>
            <option value="객관식">객관식</option>
          </select>
        </div>

        {/* 질문 입력 */}
        <div className="survey-create-field">
          <label htmlFor="question">질문</label>
          <input
            type="text"
            id="question"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="질문을 입력하세요"
            required
          />
        </div>

        {/* 객관식 선택지 입력 (타입이 객관식일 때만) */}
        {type === "객관식" && (
          <div className="survey-options">
            <h3>선택지 추가</h3>
            {options.map((option, index) => (
              <input
                key={index}
                type="text"
                placeholder={`선택지 ${index + 1}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                required
              />
            ))}
            <button type="button" onClick={addOption}>+ 선택지 추가</button>
          </div>
        )}

        <button type="submit" className="survey-create-button">등록</button>
      </form>
    </div>
  );
};

export default SurveyCreate;
