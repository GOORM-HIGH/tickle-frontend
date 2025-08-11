import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';

import { useAuth } from '../../../hooks/useAuth';
import { PERFORMANCE_GENRES } from '../../constants/performance';
import { PerformanceFormData } from '../../types/performance';
import { performanceApi, UpdatePerformanceRequestDto } from '../../api/performanceApi';
import { useScrollToTop } from '../../../hooks/useScrollToTop';

import '../../styles/PerformanceCreatePage.css';

const PerformanceEditForm: React.FC = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const { performanceId } = useParams<{ performanceId: string }>();
  const { isLoggedIn, currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const hasToken = !!Cookies.get('accessToken');
    if (hasToken && !isLoggedIn) return;
    if (isLoggedIn && !currentUser) return;
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      navigate('/auth/sign-in');
    }
  }, [isLoggedIn, currentUser, navigate]);

  useEffect(() => {
    const fetchPerformance = async () => {
      if (!isLoggedIn || !performanceId) return;
      try {
        setLoading(true);
        const response = await performanceApi.getPerformanceDetail(+performanceId);
        const res = response.data;

        const genreTitle = res.genreTitle || '기타';
        const genre = PERFORMANCE_GENRES.find(g => g.name === genreTitle);
        const genreId = genre ? genre.id : 0;
        const hallType = res.hallType || 'A';

        setFormData({
          title: res.title,
          genreId,
          date: res.date?.split('T')[0] || '',
          runtime: res.runtime || 0,
          hallType,
          hallAddress: res.hallAddress || '',
          startDate: res.startDate?.split('T')[0] || '',
          endDate: res.endDate?.split('T')[0] || '',
          isEvent: Boolean(res.event),
          img: res.img || '',
        });

        if (res.img) setImagePreview(res.img);
      } catch (err: any) {
        console.error('공연 조회 실패:', err);
        setError('공연 정보를 불러오는데 실패했습니다.');
        if (err.response?.status === 401) navigate('/');
        else if (err.response?.status === 403) navigate('/');
        else if (err.response?.status === 404) navigate('/performance');
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [isLoggedIn, performanceId, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'genreId' || type === 'number' ? +value : value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        const result = ev.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, img: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDateToISO = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    return new Date(d.getTime() + 9 * 60 * 60 * 1000).toISOString().replace('Z', '+09:00');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!performanceId) return alert('공연 ID가 없습니다.');

    const requestData: UpdatePerformanceRequestDto = {
      title: formData.title,
      genreId: formData.genreId,
      date: formatDateToISO(formData.date),
      runtime: formData.runtime,
      hallType: formData.hallType,
      hallAddress: formData.hallAddress,
      startDate: formatDateToISO(formData.startDate),
      endDate: formatDateToISO(formData.endDate),
      isEvent: formData.isEvent,
      img: imagePreview === '/default-performance.png' ? '' : formData.img,
    };

    try {
      await performanceApi.updatePerformance(+performanceId, requestData);
      alert('공연이 성공적으로 수정되었습니다!');
      navigate('/mypage');
    } catch (err: any) {
      console.error('공연 수정 실패:', err);
      if (err.response?.status === 401 || err.response?.status === 403) navigate('/');
      else alert('공연 수정 실패: ' + (err.response?.data?.message || err.message));
    }
  };

  if (!isLoggedIn || loading || !currentUser) {
    return (
      <div className="performance-create-page">
        <div className="page-container">
          <div className="main-content" style={{ textAlign: 'center', padding: '50px' }}>
            <h2>{loading ? '공연 정보를 불러오는 중...' : '권한 확인 중...'}</h2>
            <p>잠시만 기다려주세요.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="performance-create-page">
        <div className="page-container">
          <div className="main-content" style={{ textAlign: 'center', padding: '50px' }}>
            <h2>오류 발생</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/performance/host')}>공연 관리로 돌아가기</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="performance-create-page">
      <div className="page-container">
        <div className="main-content">
          <h2 className="page-title">공연 수정</h2>
          <div className="form-layout">
            <div className={`image-upload-section ${imagePreview ? 'has-image' : ''}`}>
              <div className="image-upload-area" onClick={() => fileInputRef.current?.click()}>
                {imagePreview ? (
                  <img src={imagePreview} alt="공연 이미지" className="image-preview" />
                ) : (
                  <div className="performance-image-placeholder">공연 이미지를 업로드해주세요</div>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" hidden />
            </div>

            <form onSubmit={handleSubmit} className="performance-form">
              <div className="form-fields">
                <div className="form-group">
                  <label htmlFor="title">공연명</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label htmlFor="date">공연날짜</label>
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label htmlFor="runtime">상영시간 (분)</label>
                  <input type="number" name="runtime" value={formData.runtime} onChange={handleInputChange} min={1} required />
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" name="isEvent" checked={formData.isEvent} onChange={handleInputChange} />
                    <span className="checkbox-text">이벤트 참여 계약을 맺었을 때 체크해주세요!</span>
                  </label>
                </div>
              </div>

              <div className="submit-section">
                <button type="submit" className="submit-button">수정하기</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceEditForm;


