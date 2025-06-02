import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [businessRegFile, setBusinessRegFile] = useState(null);
    const [bankCopyFile, setBankCopyFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [email, setEmail] = useState('');


    const handleFileChange = (e, setter) => {
        if (e.target.files.length > 0) {
            setter(e.target.files[0]);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username) return alert('아이디를 입력해 주세요.');
        if (!password) return alert('비밀번호를 입력해 주세요.');
        if (!name) return alert('이름을 입력해 주세요.');
        if (!phoneNumber) return alert('전화번호를 입력해 주세요.');
        if (!address) return alert('주소를 입력해 주세요.');
        if (!birthdate) return alert('생년월일을 입력해 주세요.');
        if (!businessRegFile) return alert('사업자등록증을 첨부해 주세요.');
        if (!bankCopyFile) return alert('사업자 통장사본을 첨부해 주세요.');
        if (!email) return alert('이메일을 입력해 주세요.');


        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        formData.append('name', name);
        formData.append('phoneNumber', phoneNumber);
        formData.append('address', address);
        formData.append('birthdate', birthdate);
        formData.append('businessRegFile', businessRegFile);
        formData.append('bankCopyFile', bankCopyFile);
        formData.append('email', email);


        try {
            const response = await fetch('http://localhost:7777/api/users/signup/admin', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorMessage(data.message || '회원가입 실패');
                return;
            }

            setUsername('');
            setPassword('');
            setName('');
            setPhoneNumber('');
            setEmail('');
            setAddress('');
            setBirthdate('');
            setBusinessRegFile(null);
            setBankCopyFile(null);

            // ✅ 알림 후 로그인 페이지로 이동
            alert('회원가입 신청이 완료되었습니다. 관리자의 승인 후 사용하실 수 있습니다.');
            navigate('/login');

        } catch (error) {
            console.error('회원가입 오류:', error);
            alert('회원가입 중 오류가 발생했습니다.');
        }
    }


    return (
        <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px' }}>
            <h1>회원가입 신청</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>아이디</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    />
                </div>
                <div>
                    <label>비밀번호</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    />
                </div>
                <div>
                    <label>이름</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    />
                </div>
                <div>
                    <label>전화번호</label>
                    <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    />
                </div>
                <div>
                    <label>이메일</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    />
                </div>

                <div>
                    <label>주소</label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    />
                </div>
                <div>
                    <label>생년월일</label>
                    <input
                        type="date"
                        value={birthdate}
                        onChange={(e) => setBirthdate(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    />
                </div>
                <div>
                    <label>사업자등록증 첨부</label>
                    <input
                        type="file"
                        accept=".pdf,.jpg,.png"
                        onChange={(e) => handleFileChange(e, setBusinessRegFile)}
                        required
                        style={{ marginBottom: '10px' }}
                    />
                </div>
                <div>
                    <label>사업자 통장사본 첨부</label>
                    <input
                        type="file"
                        accept=".pdf,.jpg,.png"
                        onChange={(e) => handleFileChange(e, setBankCopyFile)}
                        required
                        style={{ marginBottom: '10px' }}
                    />
                </div>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
                <button type="submit" style={{ width: '100%', padding: '10px' }}>가입 신청</button>
            </form>
        </div>
    );
};

export default Signup;