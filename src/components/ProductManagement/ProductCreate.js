import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import heic2any from "heic2any";
import '../../css/ProductManagement/ProductCreate.css';

const ProductCreate = () => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [size, setSize] = useState([]);
  const [sizeStock, setSizeStock] = useState({});
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

const handleCategoryChange = (e) => {
    setCategory(e.target.value);
};


  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };
  
  
const handleSubmit = async (e) => {
  e.preventDefault();

  // 필수 필드 확인, 메인 이미지와 상세 이미지 포함
  if (!name || !category || !price  === 0) {
      alert('모든 입력란을 입력해주세요.');
      return;
  }



  const formData = new FormData();
  formData.append('name', name);
  formData.append('category', category);
  formData.append('price', price);
  formData.append('description', description);


  const token = localStorage.getItem('token');

  try {
      const response = await axios.post(
          'http://localhost:8866/api/products/productCreate',
          formData,
          {
              headers: {
                  'Authorization': `Bearer ${token}`,
              },
          }
      );

      if (response.status === 200) {
          alert('상품이 성공적으로 등록되었습니다.');
          navigate('/products');
      } else {
          alert('상품 등록 실패: ' + response.data.message);
      }
  } catch (error) {
      console.error('상품 등록 실패:', error.message);
      alert('상품 등록 중 오류가 발생했습니다.');
  }
};



  
  
  return (
    <div className="product-create-container">
      <h2 className="product-create-title">설문 등록</h2>
      <form className="product-create-form" onSubmit={handleSubmit}>
        {/* Product Name */}
        <div className="product-create-field">
          <label className="product-create-label" htmlFor="name">설문 이름</label>
          <input
            className="product-create-input"
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="상품 이름을 입력하세요"
            required
          />
        </div>

        {/* Category */}
        <div className="product-create-field">
    <label className="product-create-label" htmlFor="category">타입</label>
    <select
        className="product-create-input"
        id="category"
        value={category}
        onChange={handleCategoryChange}
        required
    >
        <option value="">설문 타입을 선택하세요</option>
        <option value="주관식">주관식</option>
        <option value="객관식">객관식</option>
    </select>
</div>

       
        {/* Price */}
        <div className="product-create-field">
          <label className="product-create-label" htmlFor="price">가격</label>
          <input
            className="product-create-input"
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="가격을 입력하세요"
            required
          />
        </div>

        {/* Product Description */}
        <div className="product-create-field">
          <label className="product-create-label" htmlFor="description">상품 설명</label>
          <textarea
            className="product-create-input"
            id="description"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="상품 설명을 입력하세요"
            required
          />
        </div>

        <button type="submit" className="product-create-button">등록</button>
      </form>
    </div>
  );
};

export default ProductCreate;
