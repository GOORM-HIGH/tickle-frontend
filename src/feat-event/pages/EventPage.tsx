// src/pages/EventPage.tsx
import { useState, useEffect } from 'react';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import { getTicketEvents, TicketListResponseDto } from '../api/eventApi';
import styles from '../styles/event.module.css';
// 분리된 컴포넌트들
import HeroSection from '../components/event/HeroSection';
import TabButtons from '../components/event/TabButtons';
import CouponEventSection from '../components/event/CouponEventSection';
import TicketEventSection from '../components/event/TicketEventSection';

export function EventPage() {
  const [activeTab, setActiveTab] = useState<'coupon' | 'ticket'>('coupon');
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketEvents, setTicketEvents] = useState<TicketListResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const cardsPerPage = 9;

  console.log('EventPage 렌더링됨');

  useEffect(() => {
    const fetchTicketEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getTicketEvents(currentPage - 1, cardsPerPage);
        setTicketEvents(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
        console.log('티켓 이벤트 로드 성공:', response);
      } catch (error) {
        console.error('티켓 이벤트 로드 실패:', error);
        setError('티켓 이벤트를 불러오는데 실패했습니다.');
        setTicketEvents([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'ticket') {
      fetchTicketEvents();
    }
  }, [activeTab, currentPage]);

  const handleTicketTabClick = () => {
    setCurrentPage(1); // 탭 변경 시 페이지 초기화
  };

  return (
    <>
      <Header />
      <HeroSection onTabChange={setActiveTab} />
      <main className={styles.main}>
        <div className={styles.container}>
          <TabButtons 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onTicketTabClick={handleTicketTabClick}
          />

          {activeTab === 'coupon' && <CouponEventSection />}
          
          {activeTab === 'ticket' && (
            <TicketEventSection
              ticketEvents={ticketEvents}
              loading={loading}
              error={error}
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              cardsPerPage={cardsPerPage}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
