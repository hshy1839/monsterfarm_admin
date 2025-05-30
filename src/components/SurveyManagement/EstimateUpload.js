import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../../css/SurveyManagement/Estimate.css';

const manufacturerOptions = ['DJI', 'XAG(지페이)', 'IN TO SKY(인투스카이)', 'AFI', 'EFT', '천풍', '헬셀', '조립드론', '직접입력'];
const itemOptions = ['액제살포장치', '입제살포장치', '조종기', '배터리', '발전기', '직접입력'];

const EstimateUpload = () => {
  const [manufacturer, setManufacturer] = useState('');
  const [price, setPrice] = useState('');
  const [droneBaseName, setDroneBaseName] = useState('');
  const [items, setItems] = useState([{ category: '', quantity: '', note: '' }]);
  const [uploading, setUploading] = useState(false);
  const { id: answerId } = useParams();




  const handleItemChange = (index, key, value) => {
    const updated = [...items];
    updated[index][key] = value;
    setItems(updated);
  };

  const addItem = () => setItems([...items, { category: '', quantity: '', note: '' }]);

  const handleUpload = async () => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('answerId', answerId); 
    formData.append('manufacturer', manufacturer);
    formData.append('price', price);
    formData.append('droneBaseName', droneBaseName);
    formData.append('items', JSON.stringify(items));

    try {
      setUploading(true);
      await axios.post('http://52.79.251.176:7777/api/estimates', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('견적서 업로드 성공!');
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

      <label>견적 금액 (원):</label>
      <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />

      <label>드론 기종명:</label>
      <input type="text" value={droneBaseName} onChange={(e) => setDroneBaseName(e.target.value)} />

      <h4>항목 리스트</h4>
      {items.map((item, idx) => (
        <div key={idx} className="item-row">
          <select value={item.category} onChange={(e) => handleItemChange(idx, 'category', e.target.value)}>
            <option value="">선택</option>
            {itemOptions.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
          <input type="number" placeholder="수량" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} />
          <input type="text" placeholder="비고" value={item.note} onChange={(e) => handleItemChange(idx, 'note', e.target.value)} />
        </div>
      ))}
      <div className='estimate-upload-btn-container'>
      <button className="estimate-upload-add-btn" onClick={addItem}>항목 추가</button>


      <button className="estimate-upload-upload-btn" onClick={handleUpload} disabled={uploading}>
        {uploading ? '업로드 중...' : '업로드  '}
      </button>
      </div>
      
    </div>
  );
};

export default EstimateUpload;
