import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

import { useAuth } from '../../../hooks/useAuth';
import { performanceService } from '../../api/performanceService';
import { PERFORMANCE_GENRES, HALL_TYPES, VENUE_LOCATIONS } from '../../constants/performance';
import { PerformanceFormData, PerformanceRequestDto } from '../../types/performance';

import '../../styles/PerformanceCreatePage.css';

const PerformanceCreateForm: React.FC = () => {
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

  useEffect(() => {
    console.log('🔍 인증 상태:', { isLoggedIn, currentUser, token: Cookies.get('accessToken') });
  }, [isLoggedIn, currentUser]);

  useEffect(() => {
    const hasToken = !!Cookies.get('accessToken');
    if (hasToken && !isLoggedIn) return;
    if (isLoggedIn && !currentUser) return;
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      navigate('/');
    }
  }, [isLoggedIn, currentUser, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : name === 'genreId' ? Number(value) : value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        const result = event.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, img: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const formatDateToISO = (dateString: string, isEndDate: boolean = false): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    if (isEndDate) {
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T14:59:59.999Z`;
    }
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T09:00:00.000Z`;
  };

  const formatPerformanceDateToISO = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T09:00:00.000Z`;
  };

  const nowISO = new Date().toISOString();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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
        img: imagePreview || '',
      };

      await performanceService.createPerformance(requestData);
      alert('공연이 성공적으로 생성되었습니다!');
      navigate('/');
    } catch (error: any) {
      console.error('공연 생성 실패:', error);
      if (error.response?.status === 401) navigate('/');
      else if (error.response?.status === 403) navigate('/');
      else alert(`공연 생성에 실패했습니다: ${error.response?.data?.message || error.message}`);
    }
  };

  const hasToken = !!Cookies.get('accessToken');
  if (!isLoggedIn || (hasToken && !isLoggedIn) || (isLoggedIn && !currentUser)) {
    return (
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
    );
  }

  return (
    <div className="performance-create-page">
      <div className="page-container">
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

        <div className="main-content">
          <h2 className="page-title">공연생성</h2>

          <div className="form-layout">
            <div className={`image-upload-section ${imagePreview ? 'has-image' : ''}`}>
              <div className="image-performance-upload-area" onClick={triggerFileInput}>
                {!imagePreview && <div className="performance-image-placeholder">공연 이미지를 업로드해주세요</div>}
                {imagePreview && <img src={imagePreview} alt="공연 이미지 미리보기" className="image-preview" />}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
            </div>

            <form onSubmit={handleSubmit} className="performance-form">
              <div className="form-fields">
                <div className="form-group">
                  <label htmlFor="title">공연명</label>
                  <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label htmlFor="genreId">공연장르</label>
                  <select id="genreId" name="genreId" value={formData.genreId} onChange={handleInputChange} required>
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
                  <input type="date" id="date" name="date" value={formData.date} onChange={handleInputChange} min={nowISO} required className="date-input" />
                  <small style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>오늘 이후의 날짜를 선택해주세요 (공연시간: 오후 6시)</small>
                </div>

                <div className="form-group">
                  <label htmlFor="runtime">공연상영시간 (분)</label>
                  <input type="number" id="runtime" name="runtime" value={formData.runtime} onChange={handleInputChange} min={1} required />
                </div>

                <div className="form-group">
                  <label htmlFor="hallType">공연장 유형</label>
                  <select id="hallType" name="hallType" value={formData.hallType} onChange={handleInputChange} required>
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
                    onChange={e => {
                      const venueId = e.target.value;
                      setSelectedVenue(venueId);
                      if (venueId === 'custom') {
                        setFormData(prev => ({ ...prev, hallAddress: customAddress }));
                      } else {
                        const venue = VENUE_LOCATIONS.find(v => v.id === venueId);
                        if (venue) setFormData(prev => ({ ...prev, hallAddress: venue.address }));
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
                      onChange={e => {
                        setCustomAddress(e.target.value);
                        setFormData(prev => ({ ...prev, hallAddress: e.target.value }));
                      }}
                      style={{ marginTop: '8px' }}
                      required
                    />
                  )}

                  {selectedVenue && selectedVenue !== 'custom' && (
                    <div
                      style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '6px',
                        fontSize: '14px',
                        color: '#666',
                      }}
                    >
                      📍 {formData.hallAddress}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <div className="date-range">
                    <div className="date-input-container">
                      <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>예매 시작일</label>
                      <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} min={nowISO} required className="date-input" />
                      <small style={{ color: '#666', fontSize: '11px', marginTop: '2px' }}>해당 날짜의 18:00으로 설정됩니다</small>
                    </div>
                    <div className="date-input-container">
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
                      <small style={{ color: '#666', fontSize: '11px', marginTop: '2px' }}>해당 날짜의 23:59로 설정됩니다</small>
                    </div>
                  </div>
                  <small style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>예매 시작일은 오늘 이후, 종료일은 시작일 이후로 설정해주세요</small>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" name="isEvent" checked={formData.isEvent} onChange={handleInputChange} />
                    <span className="checkbox-text">이벤트 참여 계약을 맺었을 때 체크해주세요!</span>
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
  );
};

export default PerformanceCreateForm;


