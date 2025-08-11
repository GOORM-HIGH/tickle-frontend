import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PerformanceFormData, PerformanceRequestDto } from '../../types/performance';
import { PERFORMANCE_GENRES, HALL_TYPES, VENUE_LOCATIONS } from '../../constants/performance';
import { useAuth } from '../../../hooks/useAuth';
import { performanceService } from '../../api/performanceService';
import Layout from '../../../components/layout/Layout';
import Cookies from 'js-cookie';
import '../../styles/PerformanceCreatePage.css';

const PerformanceCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, currentUser } = useAuth();
  
  const [formData, setFormData] = useState<PerformanceFormData>({
    title: '',
    genreId: 0,
    date: '',
    runtime: 0,
    hallType: '',
    hallAddress: '',
    startDate: '',
    endDate: '',
    isEvent: false,
    img: '',
  });
  

  const [selectedVenue, setSelectedVenue] = useState<string>('');
  const [customAddress, setCustomAddress] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 디버깅 정보 출력
  useEffect(() => {
    console.log('🔍 인증 상태:', {
      isLoggedIn,
      currentUser,
      token: Cookies.get('accessToken')
    });
  }, [isLoggedIn, currentUser]);
  
  // 권한이 없으면 홈페이지로 리다이렉트
  useEffect(() => {
    console.log('🔍 권한 확인 useEffect 실행:', {
      isLoggedIn,
      currentUser,
      hasToken: !!Cookies.get('accessToken')
    });
    
    // 토큰이 있는데 아직 로그인 상태가 초기화되지 않았으면 대기
    const hasToken = !!Cookies.get('accessToken');
    if (hasToken && !isLoggedIn) {
      console.log('⏳ 토큰은 있지만 로그인 상태 초기화 대기 중...');
      return;
    }
    
    // 로딩 중이거나 아직 사용자 정보가 로드되지 않았으면 대기
    if (isLoggedIn && !currentUser) {
      console.log('⏳ 사용자 정보 로드 대기 중...');
      return;
    }
    
    if (!isLoggedIn) {
      console.log('❌ 로그인되지 않음');
      alert('로그인이 필요합니다.');
      navigate('/');
      return;
    }
    
    console.log('✅ 권한 확인 완료 - 공연 생성 페이지 접근 가능');
  }, [isLoggedIn, currentUser, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
               type === 'number' ? Number(value) :
               name === 'genreId' ? Number(value) : value
    }));
  };



  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, img: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // 날짜를 ISO 8601 형식으로 변환하는 함수 (한국시간 -> UTC)
  const formatDateToISO = (dateString: string, isEndDate: boolean = false): string => {
    if (!dateString) return '';
    
    // 날짜 문자열을 파싱
    const [year, month, day] = dateString.split('-').map(Number);
    
    let result: string;
    
    if (isEndDate) {
      // 예매 종료일: 해당 날짜의 한국시간 23:59:59 -> UTC로 변환
      // 한국시간 23:59:59 = UTC 14:59:59 (같은 날)
      result = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T14:59:59.999Z`;
    } else {
      // 예매 시작일: 해당 날짜의 한국시간 18:00:00 -> UTC로 변환
      // 한국시간 18:00:00 = UTC 09:00:00 (같은 날)
      result = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T09:00:00.000Z`;
    }
    
    console.log(`🔍 ${isEndDate ? '예매종료일' : '예매시작일'} 변환:`, {
      원본날짜: dateString,
      변환결과: result
    });
    
    return result;
  };

  // 공연 날짜를 한국시간 기준으로 변환하는 함수 (한국시간 -> UTC)
  const formatPerformanceDateToISO = (dateString: string): string => {
    if (!dateString) return '';
    
    // 날짜 문자열을 파싱
    const [year, month, day] = dateString.split('-').map(Number);
    
    // 공연 날짜: 해당 날짜의 한국시간 18:00:00 -> UTC로 변환
    // 한국시간 18:00:00 = UTC 09:00:00 (같은 날)
    const result = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T09:00:00.000Z`;
    
    console.log(`🎭 공연날짜 변환:`, {
      원본날짜: dateString,
      변환결과: result
    });
    
    return result;
  };
    const nowISO = new Date().toISOString();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 백엔드 API 형식에 맞게 데이터 변환
      const requestData: PerformanceRequestDto = {
        title: formData.title,
        genreId: formData.genreId,
        date: formatPerformanceDateToISO(formData.date),
        runtime: formData.runtime,
        hallType: formData.hallType,
        hallAddress: formData.hallAddress,
        startDate: formatDateToISO(formData.startDate),
        endDate: formatDateToISO(formData.endDate, true),
        isEvent: formData.isEvent,
        img: imagePreview || ''
      };
      
      console.log('=== 공연 생성 요청 데이터 ===');
      console.log('전체 요청 데이터:', requestData);
      console.log('공연 날짜 (date):', requestData.date);
      console.log('예매 시작일 (startDate):', requestData.startDate);
      console.log('예매 종료일 (endDate):', requestData.endDate);
      
      // API 호출
      const response = await performanceService.createPerformance(requestData);
      console.log('공연 생성 응답:', response);
      
      alert('공연이 성공적으로 생성되었습니다!');
      navigate('/'); // 홈페이지로 이동
      
    } catch (error: any) {
      console.error('공연 생성 실패:', error);
      
      if (error.response?.status === 401) {
        alert('인증이 필요합니다. 다시 로그인해주세요.');
        navigate('/');
      } else if (error.response?.status === 403) {
        alert('호스트 권한이 필요합니다.');
        navigate('/');
      } else {
        alert(`공연 생성에 실패했습니다: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  // 로딩 중이거나 권한이 없으면 로딩 화면 표시
  const hasToken = !!Cookies.get('accessToken');
  if (!isLoggedIn || (hasToken && !isLoggedIn) || (isLoggedIn && !currentUser)) {
    return (
      <Layout>
        <div className="performance-create-page">
          <div className="page-container">
            <div className="main-content">
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <h2>권한 확인 중...</h2>
                <p>잠시만 기다려주세요.</p>
                <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                  {!isLoggedIn && hasToken && '토큰 확인 중...'}
                  {!isLoggedIn && !hasToken && '로그인 상태 확인 중...'}
                  {isLoggedIn && !currentUser && '사용자 정보 로드 중...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="performance-create-page">
        <div className="page-container">
          {/* 사이드바 */}
          <div className="sidebar">
            <div className="sidebar-content">
              <h3>마이페이지</h3>
              <ul className="sidebar-menu">
                <li onClick={() => navigate('/mypage')}>내정보</li>
                <li onClick={() => navigate('/mypage/reservations')}>예매/취소 내역</li>
                <li onClick={() => navigate('/mypage/tickets')}>예매권</li>
                <li onClick={() => navigate('/mypage/coupons')}>쿠폰</li>
                <li onClick={() => navigate('/performance/scraps')}>스크랩한 공연</li>
                <li className="active" onClick={() => navigate('/performance/host')}>공연관리</li>
                <li onClick={() => navigate('/mypage/settlements')}>정산내역</li>
              </ul>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="main-content">
            <h2 className="page-title">공연생성</h2>
            
            <div className="form-layout">
              {/* 이미지 업로드 섹션 */}
              <div className={`image-upload-section ${imagePreview ? 'has-image' : ''}`}>
                <div className="image-performance-upload-area" onClick={triggerFileInput}>
                  {!imagePreview && (
                    <div className="performance-image-placeholder">
                      공연 이미지를 업로드해주세요
                    </div>
                  )}
                  {imagePreview && (
                    <img 
                      src={imagePreview} 
                      alt="공연 이미지 미리보기" 
                      className="image-preview"
                    />
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />

              </div>
              
              {/* 폼 필드들 */}
              <form onSubmit={handleSubmit} className="performance-form">
              <div className="form-fields">
                <div className="form-group">
                  <label htmlFor="title">공연명</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="genreId">공연장르</label>
                  <select
                    id="genreId"
                    name="genreId"
                    value={formData.genreId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">장르를 선택해주세요</option>
                    {PERFORMANCE_GENRES.map(genre => (
                      <option key={genre.id} value={genre.id}>
                        {genre.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="date">공연날짜</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={nowISO}
                    required
                    className="date-input"
                  />
                  <small style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                    오늘 이후의 날짜를 선택해주세요 (공연시간: 오후 6시)
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="runtime">공연상영시간 (분)</label>
                  <input
                    type="number"
                    id="runtime"
                    name="runtime"
                    value={formData.runtime}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="hallType">공연장 유형</label>
                  <select
                    id="hallType"
                    name="hallType"
                    value={formData.hallType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">공연장 유형을 선택해주세요</option>
                    {HALL_TYPES.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="venue">공연 장소</label>
                  <select
                    id="venue"
                    value={selectedVenue}
                    onChange={(e) => {
                      const venueId = e.target.value;
                      setSelectedVenue(venueId);
                      
                      if (venueId === 'custom') {
                        setFormData(prev => ({ ...prev, hallAddress: customAddress }));
                      } else {
                        const venue = VENUE_LOCATIONS.find(v => v.id === venueId);
                        if (venue) {
                          setFormData(prev => ({ ...prev, hallAddress: venue.address }));
                        }
                      }
                    }}
                    required
                  >
                    <option value="">장소를 선택해주세요</option>
                    {VENUE_LOCATIONS.map(venue => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name}
                      </option>
                    ))}
                  </select>
                  
                  {selectedVenue === 'custom' && (
                    <input
                      type="text"
                      placeholder="공연 장소를 직접 입력해주세요"
                      value={customAddress}
                      onChange={(e) => {
                        setCustomAddress(e.target.value);
                        setFormData(prev => ({ ...prev, hallAddress: e.target.value }));
                      }}
                      style={{ marginTop: '8px' }}
                      required
                    />
                  )}
                  
                  {selectedVenue && selectedVenue !== 'custom' && (
                    <div style={{ 
                      marginTop: '8px', 
                      padding: '8px 12px', 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#666'
                    }}>
                      📍 {formData.hallAddress}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <div className="date-range">
                    <div className='date-input-container'>
                      <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>예매 시작일</label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        min={nowISO}
                        required
                        className="date-input"
                      />
                      <small style={{ color: '#666', fontSize: '11px', marginTop: '2px' }}>
                        해당 날짜의 18:00으로 설정됩니다
                      </small>
                    </div>
                    <div className='date-input-container'>
                      <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>예매 종료일</label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        min={formData.startDate || nowISO}
                        required
                        className="date-input"
                      />
                      <small style={{ color: '#666', fontSize: '11px', marginTop: '2px' }}>
                        해당 날짜의 23:59로 설정됩니다
                      </small>
                    </div>
                  </div>
                  <small style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                    예매 시작일은 오늘 이후, 종료일은 시작일 이후로 설정해주세요
                  </small>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isEvent"
                      checked={formData.isEvent}
                      onChange={handleInputChange}
                    />
                    <span className="checkbox-text">
                      이벤트 참여 계약을 맺었을 때 체크해주세요!
                    </span>
                  </label>
                </div>
              </div>

              <div className="submit-section">
                <button type="submit" className="submit-button">
                  생성하기
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PerformanceCreatePage; 