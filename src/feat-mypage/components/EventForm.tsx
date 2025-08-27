import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Gift, Upload, Plus, Ticket, Search } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import styles from '../../styles/eventForm.module.css';
import { performanceApi, PerformanceHostDto, SeatDto, TicketEventCreateRequestDto } from '../../home/api/performanceApi';

interface EventFormData {
  performanceId: number;
  seatId: number;
  name: string;
  goalPrice: number;
  perPrice: number;
  eventType: 'coupon' | 'ticket';
}

const EventForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // URL에서 공연 ID를 받아옴 (공연 생성 후 리다이렉트된 경우)
  const searchParams = new URLSearchParams(location.search);
  const performanceIdFromUrl = searchParams.get('performanceId');
  
  const [formData, setFormData] = useState<EventFormData>({
    performanceId: performanceIdFromUrl ? parseInt(performanceIdFromUrl) : 0,
    seatId: 0,
    name: '',
    goalPrice: 0,
    perPrice: 0,
    eventType: 'ticket'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSeats, setAvailableSeats] = useState<SeatDto[]>([]);
  const [seatsLoading, setSeatsLoading] = useState(false);
  
  // 공연 정보 관련 상태
  const [performancesLoading, setPerformancesLoading] = useState(false);
  const [selectedPerformance, setSelectedPerformance] = useState<PerformanceHostDto | null>(null);

  // URL에서 전달받은 공연 ID로 공연 정보 가져오기
  useEffect(() => {
    const fetchPerformance = async () => {
      if (!performanceIdFromUrl) {
        alert('공연 ID가 없습니다.');
        navigate('/mypage');
        return;
      }

      setPerformancesLoading(true);
      try {
        const response = await performanceApi.getHostPerformances();
        
        if (response.status === 200 && response.data) {
          const foundPerformance = response.data.find(p => p.performanceId === parseInt(performanceIdFromUrl));
          if (foundPerformance) {
            setSelectedPerformance(foundPerformance);
            setFormData(prev => ({ ...prev, performanceId: foundPerformance.performanceId }));
          } else {
            alert('해당 공연을 찾을 수 없습니다.');
            navigate('/mypage');
          }
        }
      } catch (error) {
        console.error('공연 정보 로드 실패:', error);
        alert('공연 정보를 불러오는데 실패했습니다.');
        navigate('/mypage');
      } finally {
        setPerformancesLoading(false);
      }
    };

    fetchPerformance();
  }, [performanceIdFromUrl, navigate]);

  // 선택된 공연이 변경되면 좌석 정보 새로 로드
  useEffect(() => {
    if (selectedPerformance) {
      fetchSeats(selectedPerformance.performanceId);
    }
  }, [selectedPerformance]);

  // 사용 가능한 좌석 데이터 가져오기
  const fetchSeats = async (performanceId: number) => {
    setSeatsLoading(true);
    try {
      const response = await performanceApi.getPerformanceSeats(performanceId);
      
      if (response.status === 200 && response.data) {
        setAvailableSeats(response.data.seats);
      } else {
        console.error('좌석 정보 로드 실패:', response.message);
        setAvailableSeats([]);
      }
    } catch (error) {
      console.error('좌석 정보 로드 실패:', error);
      alert('좌석 정보를 불러오는데 실패했습니다.');
      setAvailableSeats([]);
    } finally {
      setSeatsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSeatSelect = (seatId: number) => {
    setFormData(prev => ({
      ...prev,
      seatId: seatId
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.performanceId || !formData.seatId) {
      alert('공연과 좌석을 선택해주세요.');
      return;
    }
    
    if (!formData.name || !formData.goalPrice || !formData.perPrice) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const requestData: TicketEventCreateRequestDto = {
        performanceId: formData.performanceId,
        seatId: formData.seatId,
        name: formData.name,
        goalPrice: formData.goalPrice,
        perPrice: formData.perPrice
      };

      const response = await performanceApi.createTicketEvent(requestData);
      
      console.log('API 응답:', response);
      
      // 백엔드 응답 구조에 따라 status 또는 response.status 확인
      if (response.status === 200 || response.data) {
        alert('이벤트가 성공적으로 생성되었습니다!');
        navigate('/mypage');
      } else {
        alert(`이벤트 생성에 실패했습니다: ${response.message || '알 수 없는 오류'}`);
      }
    } catch (error: any) {
      console.error('이벤트 생성 실패:', error);
      if (error.response?.status === 404) {
        alert('존재하지 않는 좌석 또는 상태 ID입니다.');
      } else {
        alert(`이벤트 생성에 실패했습니다: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/mypage');
  };

  return (
    <Layout>
      <div className="pageContainer">
        <div className={styles['event-form-container']}>
          {/* 뒤로가기 버튼 */}
          <div className={styles['back-button-container']}>
            <button className={styles['back-button']} onClick={handleBack}>
              <ArrowLeft size={20} />
              뒤로가기
            </button>
          </div>

          <div className={styles['event-form-header']}>
            <h2 className={styles['event-form-title']}>새로운 이벤트 만들기</h2>
            <p className={styles['event-form-subtitle']}>
              {selectedPerformance 
                ? `"${selectedPerformance.title}" 공연으로 이벤트를 만들어보세요`
                : '공연 정보를 불러오는 중입니다...'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles['event-form']}>
            {/* 공연 정보 섹션 */}
            <div className={styles['form-section']}>
              <label className={styles['section-label']}>
                <Ticket size={20} />
                공연 정보
              </label>
              
              {performancesLoading ? (
                <div className={styles['loading-message']}>공연 정보를 불러오는 중...</div>
              ) : selectedPerformance ? (
                <div className={styles['performance-info-card']}>
                  <div className={styles['performance-info']}>
                    <div className={styles['performance-title']}>{selectedPerformance.title}</div>
                    <div className={styles['performance-details']}>
                      <span className={styles['performance-status']}>공연 예정</span>
                      <span className={styles['performance-date']}>{new Date(selectedPerformance.date).toLocaleDateString()}</span>
                      {selectedPerformance.hallAddress && (
                        <span className={styles['performance-venue']}>{selectedPerformance.hallAddress}</span>
                      )}
                    </div>
                  </div>
                  <div className={styles['performance-id']}>ID: {selectedPerformance.performanceId}</div>
                </div>
              ) : (
                <div className={styles['empty-message']}>공연 정보를 찾을 수 없습니다.</div>
              )}
            </div>

            {/* 좌석 선택 섹션 */}
            {selectedPerformance && (
              <div className={styles['form-section']}>
                <label className={styles['section-label']}>
                  <MapPin size={20} />
                  좌석 선택
                </label>
                
                <div className={styles['form-row']}>
                  <div className={styles['form-group']}>
                    <label htmlFor="seatId">좌석 선택 *</label>
                    <select
                      id="seatId"
                      name="seatId"
                      value={formData.seatId}
                      onChange={(e) => handleSeatSelect(Number(e.target.value))}
                      required
                      disabled={seatsLoading}
                    >
                      <option value="">
                        {seatsLoading ? '좌석 정보를 불러오는 중...' : '좌석을 선택해주세요'}
                      </option>
                      {!seatsLoading && availableSeats.length > 0 && availableSeats.map(seat => (
                        <option key={seat.seatId} value={seat.seatId}>
                          {seat.seatGrade}석 {seat.seatNumber} - {seat.seatPrice?.toLocaleString() || 0}원
                        </option>
                      ))}
                    </select>
                    <small>이벤트에 사용할 좌석을 선택하세요</small>
                    {seatsLoading && <small style={{ color: '#666' }}>좌석 정보를 불러오는 중...</small>}
                    {!seatsLoading && availableSeats.length === 0 && (
                      <small style={{ color: '#dc2626' }}>사용 가능한 좌석이 없습니다.</small>
                    )}
                  </div>
                  
                  <div className={styles['form-group']}>
                    <label htmlFor="seatPrice">좌석 가격</label>
                    <input
                      type="number"
                      id="seatPrice"
                      value={formData.seatId ? availableSeats.find(s => s.seatId === formData.seatId)?.seatPrice || 0 : 0}
                      readOnly
                      className={styles['readonly-input']}
                    />
                    <small>선택한 좌석의 원래 가격입니다</small>
                  </div>
                </div>
              </div>
            )}

            {/* 기본 정보 섹션 */}
            <div className={styles['form-section']}>
              <label className={styles['section-label']}>
                <Gift size={20} />
                기본 정보
              </label>
              
              <div className={styles['form-group']}>
                <label htmlFor="name">이벤트 제목 *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="이벤트 제목을 입력해주세요"
                  required
                />
              </div>

              <div className={styles['form-row']}>
                <div className={styles['form-group']}>
                  <label htmlFor="goalPrice">목표 금액 *</label>
                  <input
                    type="number"
                    id="goalPrice"
                    name="goalPrice"
                    value={formData.goalPrice}
                    onChange={handleInputChange}
                    placeholder="목표 금액을 입력하세요"
                    min={1000}
                    step={1000}
                    required
                  />
                  <small>1,000원 단위로 입력</small>
                </div>
                
                <div className={styles['form-group']}>
                  <label htmlFor="eventType">이벤트 유형</label>
                  <input
                    type="text"
                    id="eventType"
                    value="티켓 이벤트"
                    readOnly
                    className={styles['readonly-input']}
                  />
                  <small>고정된 이벤트 유형입니다</small>
                </div>
                
                <div className={styles['form-group']}>
                  <label htmlFor="perPrice">응모당 금액 *</label>
                  <input
                    type="number"
                    id="perPrice"
                    name="perPrice"
                    value={formData.perPrice}
                    onChange={handleInputChange}
                    placeholder="응모당 금액을 입력하세요"
                    min={100}
                    step={100}
                    required
                  />
                  <small>100원 단위로 입력</small>
                </div>
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className={styles['form-actions']}>
              <button
                type="submit"
                className={styles['submit-button']}
                disabled={isSubmitting || !selectedPerformance}
              >
                {isSubmitting ? (
                  <div className={styles['loading-spinner']}></div>
                ) : (
                  <>
                    <Plus size={20} />
                    이벤트 생성하기
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EventForm;
