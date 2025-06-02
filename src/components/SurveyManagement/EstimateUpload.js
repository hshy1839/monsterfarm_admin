import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../../css/SurveyManagement/Estimate.css';

const manufacturerOptions = ['DJI', 'XAG(지페이)', 'IN TO SKY(인투스카이)', 'AFI', 'EFT', '천풍', '헬셀', '조립드론', '직접입력'];
const itemOptions = ['액제살포장치', '입제살포장치', '조종기', '배터리', '발전기', '직접입력'];

const EstimateUpload = () => {
  const [manufacturer, setManufacturer] = useState('');
  const [customManufacturer, setCustomManufacturer] = useState('');
  const [price, setPrice] = useState('');
  const [droneBaseName, setDroneBaseName] = useState('');
  const [items, setItems] = useState([{ category: '', customCategory: '', quantity: '', note: '' }]);
  const [uploading, setUploading] = useState(false);
  const { id: answerId } = useParams();
  const navigate = useNavigate();
  const handleItemChange = (index, key, value) => {
    const updated = [...items];
    updated[index][key] = value;
    setItems(updated);
  };

  const addItem = () =>
    setItems([...items, { category: '', customCategory: '', quantity: '', note: '' }]);

  const removeItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const handleUpload = async () => {
    // 유효성 검사
    if (
      (manufacturer === '' || (manufacturer === '직접입력' && customManufacturer.trim() === '')) ||
      price.trim() === '' ||
      droneBaseName.trim() === ''
    ) {
      alert('드론 제조 회사명, 견적 금액, 드론 기종명은 모두 입력해야 합니다.');
      return;
    }
  
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const category = item.category === '직접입력' ? item.customCategory.trim() : item.category;
      if (!category || item.quantity.trim() === '') {
        alert(`항목 ${i + 1}의 카테고리와 수량을 모두 입력해 주세요.`);
        return;
      }
    }
  
    const token = localStorage.getItem('token');
  
    const processedItems = items.map((item) => ({
      category: item.category === '직접입력' ? item.customCategory : item.category,
      quantity: item.quantity,
      note: item.note,
    }));
  
    const formData = new FormData();
    formData.append('answerId', answerId);
    formData.append('manufacturer', manufacturer === '직접입력' ? customManufacturer : manufacturer);
    formData.append('price', price);
    formData.append('droneBaseName', droneBaseName);
    formData.append('items', JSON.stringify(processedItems));
  
    try {
      setUploading(true);
      await axios.post('http://52.79.251.176:7777/api/estimates', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('견적서 업로드 성공!');
      navigate('/survey/answerlists');
    } catch (error) {
      console.error('업로드 실패:', error);
      alert('업로드 실패');
    } finally {
      setUploading(false);
    }
  };
  

  return (
    <div className="estimate-upload-container">
      <h2>견적서 업로드</h2>

      <label>드론 제조 회사명:</label>
      <select value={manufacturer} onChange={(e) => setManufacturer(e.target.value)}>
        <option value="">선택하세요</option>
        {manufacturerOptions.map((opt, idx) => (
          <option key={idx} value={opt}>{opt}</option>
        ))}
      </select>

      {manufacturer === '직접입력' && (
        <input
          type="text"
          placeholder="제조사 입력"
          value={customManufacturer}
          onChange={(e) => setCustomManufacturer(e.target.value)}
          style={{ marginTop: '0.5em' }}
        />
      )}

      <label>견적 금액 (원):</label>
      <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />

      <label>드론 기종명:</label>
      <input type="text" value={droneBaseName} onChange={(e) => setDroneBaseName(e.target.value)} />

      <h4>항목 리스트</h4>
      {items.map((item, idx) => (
        <div key={idx} className="item-row-wrapper">
          <div className="item-row">
            <select
              value={item.category}
              onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
            >
              <option value="">선택</option>
              {itemOptions.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>

            {item.category === '직접입력' && (
              <input
                type="text"
                placeholder="항목 직접입력"
                value={item.customCategory}
                onChange={(e) => handleItemChange(idx, 'customCategory', e.target.value)}
                style={{ marginLeft: '0.5em' }}
              />
            )}

            <input
              type="number"
              placeholder="수량"
              value={item.quantity}
              onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
            />
            <input
              type="text"
              placeholder="비고"
              value={item.note}
              onChange={(e) => handleItemChange(idx, 'note', e.target.value)}
            />
          </div>

          {idx > 0 && (
            <button
              type="button"
              className="remove-item-btn"
              onClick={() => removeItem(idx)}
            >
              ×
            </button>
          )}
        </div>
      ))}

      <div className="estimate-upload-btn-container">
        <button className="estimate-upload-add-btn" onClick={addItem}>항목 추가</button>
        <button className="estimate-upload-upload-btn" onClick={handleUpload} disabled={uploading}>
          {uploading ? '업로드 중...' : '업로드'}
        </button>
      </div>
    </div>
  );
};

export default EstimateUpload;
