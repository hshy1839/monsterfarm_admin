import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/SurveyManagement/SurveyCreate.css';

const SurveyCreate = () => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [required, setRequired] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([]); // 객관식 선택지
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // 설문 타입 변경 핸들러
  const handleTypeChange = (e) => {
    setType(e.target.value);
    setOptions([]); // 타입 변경 시 선택지 초기화
  };

  const handleRemoveOption = (index) => {
    const updatedOptions = [...options];
    updatedOptions.splice(index, 1); // 해당 인덱스 삭제
    setOptions(updatedOptions);
  };
  
  const handleRequiredChange = (e) => {
    setRequired(e.target.value === "true"); // 🔥 문자열을 Boolean 값으로 변환
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
    if (isSubmitting) return; // 중복 제출 방지
    setIsSubmitting(true);
    if (!name || !type || !questionText || required === "") {
      alert('모든 필수 입력란을 작성해주세요.');
      return;
    }
  
    const token = localStorage.getItem('token');
  
    try {
      const response = await axios.post(
        'http://3.36.70.200:7777/api/survey',
        {
          name,
          type,
          isRequired: required, // 🔥 Boolean 값으로 변환 후 전송
          questions: [
            {
              questionText,
              type,
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
          <label htmlFor="name">설문 제목</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="설문 이름을 입력하세요"
            required
          />
        </div>
{/* 질문 입력 */}
<div className="survey-create-field">
          <label htmlFor="question">설문 설명</label>
          <input
            type="text"
            id="question"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="질문을 입력하세요"
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
        <div className="survey-create-field">
  <label htmlFor="required">필수사항 여부</label>
  <select id="required" value={required} onChange={handleRequiredChange} required>
    <option value="">필수사항 여부를 선택하세요</option>
    <option value="true">필수사항</option>
    <option value="false">선택사항</option>
  </select>
</div>

        

        {/* 객관식 선택지 입력 (타입이 객관식일 때만) */}
        {type === "객관식" && (
          <div className="survey-options">
            <h3>선택지 추가</h3>
            {options.map((option, index) => (
              <div key={index} className="option-item">
    <input
      type="text"
      placeholder={`선택지 ${index + 1}`}
      value={option}
      onChange={(e) => handleOptionChange(index, e.target.value)}
      required
    />
    <button
      type="button"
      onClick={() => handleRemoveOption(index)}
      className="option-remove-button"
    >
      ✕
    </button>
  </div>
            ))}
            <button type="button" onClick={addOption}>+ 선택지 추가</button>
          </div>
        )}

        <button type="submit" className="survey-create-button" disabled={isSubmitting}>등록</button>
      </form>
    </div>
  );
};

export default SurveyCreate;
