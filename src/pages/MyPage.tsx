// import React, { useState } from 'react';
// import { useAuth } from '../hooks/useAuth';
// import './MyPage.css';

// // 탭 타입 정의
// type TabType = 'profile' | 'event-create' | 'coupon-issue';

// export const MyPage: React.FC = () => {
//   const { currentUser, logout } = useAuth();
//   const [activeTab, setActiveTab] = useState<TabType>('profile');

//   const handleLogout = () => {
//     logout();
//   };

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case 'profile':
//         return <ProfileTab currentUser={currentUser} />;
//       case 'event-create':
//         return <EventCreateTab />;
//       case 'coupon-issue':
//         return <CouponIssueTab />;
//       default:
//         return <ProfileTab currentUser={currentUser} />;
//     }
//   };

//   return (
//     <div className="mypage-container">
//       <div className="mypage-header">
//         <h1>마이페이지</h1>
//         <button onClick={handleLogout} className="logout-button">
//           로그아웃
//         </button>
//       </div>

//       <div className="mypage-tabs">
//         <button
//           className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
//           onClick={() => setActiveTab('profile')}
//         >
//           프로필
//         </button>
//         <button
//           className={`tab-button ${activeTab === 'event-create' ? 'active' : ''}`}
//           onClick={() => setActiveTab('event-create')}
//         >
//           이벤트 생성
//         </button>
//         <button
//           className={`tab-button ${activeTab === 'coupon-issue' ? 'active' : ''}`}
//           onClick={() => setActiveTab('coupon-issue')}
//         >
//           쿠폰 발급
//         </button>
//       </div>

//       <div className="tab-content">
//         {renderTabContent()}
//       </div>
//     </div>
//   );
// };

// // 프로필 탭 컴포넌트
// const ProfileTab: React.FC<{ currentUser: any }> = ({ currentUser }) => {
//   return (
//     <div className="profile-tab">
//       <div className="profile-info">
//         <div className="profile-avatar">
//           <img 
//           src="/logo.png" 
//           alt="프로필" 
//           style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//           onError={(e) => {
//             console.error('프로필 이미지 로드 실패:', e);
//             e.currentTarget.style.display = 'none';
//           }}
//         />
//         </div>
//         <div className="profile-details">
//           <h2>{currentUser?.username || '사용자'}</h2>
//           <p>{currentUser?.email || '이메일 정보 없음'}</p>
//         </div>
//       </div>
      
//       <div className="profile-stats">
//         <div className="stat-item">
//           <span className="stat-number">12</span>
//           <span className="stat-label">참여한 이벤트</span>
//         </div>
//         <div className="stat-item">
//           <span className="stat-number">5</span>
//           <span className="stat-label">보유 쿠폰</span>
//         </div>
//         <div className="stat-item">
//           <span className="stat-number">1,250</span>
//           <span className="stat-label">포인트</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// // 이벤트 생성 탭 컴포넌트
// const EventCreateTab: React.FC = () => {
//   const [eventForm, setEventForm] = useState({
//     title: '',
//     description: '',
//     startDate: '',
//     endDate: '',
//     location: '',
//     maxParticipants: '',
//     eventType: 'concert'
//   });

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setEventForm(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log('이벤트 생성:', eventForm);
//     // TODO: API 호출 로직 추가
//     alert('이벤트가 생성되었습니다!');
//   };

//   return (
//     <div className="event-create-tab">
//       <h2>새 이벤트 생성</h2>
//       <form onSubmit={handleSubmit} className="event-form">
//         <div className="form-group">
//           <label htmlFor="title">이벤트 제목 *</label>
//           <input
//             type="text"
//             id="title"
//             name="title"
//             value={eventForm.title}
//             onChange={handleInputChange}
//             required
//             placeholder="이벤트 제목을 입력하세요"
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="description">이벤트 설명</label>
//           <textarea
//             id="description"
//             name="description"
//             value={eventForm.description}
//             onChange={handleInputChange}
//             rows={4}
//             placeholder="이벤트에 대한 상세 설명을 입력하세요"
//           />
//         </div>

//         <div className="form-row">
//           <div className="form-group">
//             <label htmlFor="startDate">시작일 *</label>
//             <input
//               type="datetime-local"
//               id="startDate"
//               name="startDate"
//               value={eventForm.startDate}
//               onChange={handleInputChange}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="endDate">종료일 *</label>
//             <input
//               type="datetime-local"
//               id="endDate"
//               name="endDate"
//               value={eventForm.endDate}
//               onChange={handleInputChange}
//               required
//             />
//           </div>
//         </div>

//         <div className="form-group">
//           <label htmlFor="location">장소</label>
//           <input
//             type="text"
//             id="location"
//             name="location"
//             value={eventForm.location}
//             onChange={handleInputChange}
//             placeholder="이벤트 장소를 입력하세요"
//           />
//         </div>

//         <div className="form-row">
//           <div className="form-group">
//             <label htmlFor="maxParticipants">최대 참가자 수</label>
//             <input
//               type="number"
//               id="maxParticipants"
//               name="maxParticipants"
//               value={eventForm.maxParticipants}
//               onChange={handleInputChange}
//               min="1"
//               placeholder="최대 참가자 수"
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="eventType">이벤트 유형</label>
//             <select
//               id="eventType"
//               name="eventType"
//               value={eventForm.eventType}
//               onChange={handleInputChange}
//             >
//               <option value="concert">콘서트</option>
//               <option value="musical">뮤지컬</option>
//               <option value="play">연극</option>
//               <option value="exhibition">전시회</option>
//               <option value="festival">페스티벌</option>
//             </select>
//           </div>
//         </div>

//         <div className="form-actions">
//           <button type="submit" className="submit-button">
//             이벤트 생성
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// // 쿠폰 발급 탭 컴포넌트
// const CouponIssueTab: React.FC = () => {
//   const [couponForm, setCouponForm] = useState({
//     name: '',
//     description: '',
//     discountType: 'percentage',
//     discountValue: '',
//     minAmount: '',
//     maxDiscount: '',
//     validFrom: '',
//     validTo: '',
//     quantity: '',
//     couponType: 'discount'
//   });

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setCouponForm(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log('쿠폰 발급:', couponForm);
//     // TODO: API 호출 로직 추가
//     alert('쿠폰이 발급되었습니다!');
//   };

//   return (
//     <div className="coupon-issue-tab">
//       <h2>쿠폰 발급</h2>
//       <form onSubmit={handleSubmit} className="coupon-form">
//         <div className="form-group">
//           <label htmlFor="name">쿠폰명 *</label>
//           <input
//             type="text"
//             id="name"
//             name="name"
//             value={couponForm.name}
//             onChange={handleInputChange}
//             required
//             placeholder="쿠폰 이름을 입력하세요"
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="description">쿠폰 설명</label>
//           <textarea
//             id="description"
//             name="description"
//             value={couponForm.description}
//             onChange={handleInputChange}
//             rows={3}
//             placeholder="쿠폰에 대한 설명을 입력하세요"
//           />
//         </div>

//         <div className="form-row">
//           <div className="form-group">
//             <label htmlFor="couponType">쿠폰 유형</label>
//             <select
//               id="couponType"
//               name="couponType"
//               value={couponForm.couponType}
//               onChange={handleInputChange}
//             >
//               <option value="discount">할인 쿠폰</option>
//               <option value="cashback">캐시백 쿠폰</option>
//               <option value="free">무료 쿠폰</option>
//             </select>
//           </div>

//           <div className="form-group">
//             <label htmlFor="discountType">할인 유형</label>
//             <select
//               id="discountType"
//               name="discountType"
//               value={couponForm.discountType}
//               onChange={handleInputChange}
//             >
//               <option value="percentage">퍼센트 할인</option>
//               <option value="fixed">정액 할인</option>
//             </select>
//           </div>
//         </div>

//         <div className="form-row">
//           <div className="form-group">
//             <label htmlFor="discountValue">할인 값 *</label>
//             <input
//               type="number"
//               id="discountValue"
//               name="discountValue"
//               value={couponForm.discountValue}
//               onChange={handleInputChange}
//               required
//               placeholder={couponForm.discountType === 'percentage' ? '할인율 (%)' : '할인 금액 (원)'}
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="minAmount">최소 사용 금액</label>
//             <input
//               type="number"
//               id="minAmount"
//               name="minAmount"
//               value={couponForm.minAmount}
//               onChange={handleInputChange}
//               placeholder="최소 사용 금액 (원)"
//             />
//           </div>
//         </div>

//         <div className="form-row">
//           <div className="form-group">
//             <label htmlFor="maxDiscount">최대 할인 금액</label>
//             <input
//               type="number"
//               id="maxDiscount"
//               name="maxDiscount"
//               value={couponForm.maxDiscount}
//               onChange={handleInputChange}
//               placeholder="최대 할인 금액 (원)"
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="quantity">발급 수량</label>
//             <input
//               type="number"
//               id="quantity"
//               name="quantity"
//               value={couponForm.quantity}
//               onChange={handleInputChange}
//               min="1"
//               placeholder="발급할 쿠폰 수량"
//             />
//           </div>
//         </div>

//         <div className="form-row">
//           <div className="form-group">
//             <label htmlFor="validFrom">유효 시작일 *</label>
//             <input
//               type="datetime-local"
//               id="validFrom"
//               name="validFrom"
//               value={couponForm.validFrom}
//               onChange={handleInputChange}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="validTo">유효 종료일 *</label>
//             <input
//               type="datetime-local"
//               id="validTo"
//               name="validTo"
//               value={couponForm.validTo}
//               onChange={handleInputChange}
//               required
//             />
//           </div>
//         </div>

//         <div className="form-actions">
//           <button type="submit" className="submit-button">
//             쿠폰 발급
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default MyPage; 