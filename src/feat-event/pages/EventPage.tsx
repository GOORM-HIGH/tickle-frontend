// src/pages/EventPage.tsx
import { useState } from 'react';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import TicketEventCard from '../../components/ticket/TicketEventCard';
import CouponSection from '../../components/coupon/CouponSection';
import { motion } from 'framer-motion';
import styles from "../styles/EventPage.module.css";

interface TicketEvent {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export function EventPage() {
  const [activeTab, setActiveTab] = useState<'coupon' | 'ticket'>('coupon');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCouponPage, setActiveCouponPage] = useState(1);
  const cardsPerPage = 9;
  const activeCouponsPerPage = 5;

  const ticketEvents: TicketEvent[] = [
      { id: "1", title: "Concert Savings", description: "$10 off on next purchase", imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop" },
      { id: "2", title: "Theater BOGO", description: "Limited time offer", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop" },
      { id: "3", title: "Sports Cashback", description: "$5 minimum spend", imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop" },
      { id: "4", title: "KPOP Exclusive", description: "25% 할인", imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop" },
      { id: "5", title: "오페라 데이", description: "40% 쿠폰 제공", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop" },
      { id: "6", title: "팬미팅 기획전", description: "무제한 포인트 적립", imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop" },
      { id: "7", title: "여름 페스티벌", description: "30% 할인", imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop" },
      { id: "8", title: "클래식 패키지", description: "1+1 이벤트", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop" },
      { id: "9", title: "스탠딩 콘서트", description: "최대 5천원 캐시백", imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop" },
      { id: "10", title: "대학로 연극", description: "현장 할인 적용 가능", imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop" },
    ];

  const totalPages = Math.ceil(ticketEvents.length / cardsPerPage);
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentEvents = ticketEvents.slice(indexOfFirstCard, indexOfLastCard);

  const activeCoupons = [
    { 
      title: "뮤지컬 〈프리다〉", 
      description: "감동의 클라라 슈만 이야기", 
      discount: "15%",
      date: "2025.08.01까지"
    },
    { 
      title: "콘서트 〈스프링 페스티벌〉", 
      description: "봄맞이 특별 공연", 
      discount: "25%",
      date: "2025.07.15까지"
    },
    { 
      title: "연극 〈햄릿〉", 
      description: "셰익스피어 명작 공연", 
      discount: "20%",
      date: "2025.09.20까지"
    },
    { 
      title: "클래식 〈베토벤 교향곡〉", 
      description: "교향악단 정기공연", 
      discount: "10%",
      date: "2025.08.30까지"
    },
    { 
      title: "뮤지컬 〈레미제라블〉", 
      description: "빅토르 위고의 걸작", 
      discount: "30%",
      date: "2025.10.15까지"
    },
    { 
      title: "콘서트 〈재즈 나이트〉", 
      description: "재즈의 밤", 
      discount: "18%",
      date: "2025.09.30까지"
    },
    { 
      title: "연극 〈로미오와 줄리엣〉", 
      description: "불멸의 사랑 이야기", 
      discount: "22%",
      date: "2025.11.20까지"
    },
    { 
      title: "클래식 〈모차르트〉", 
      description: "천재의 음악", 
      discount: "12%",
      date: "2025.10.30까지"
    }
  ];

  const totalActiveCouponPages = Math.ceil(activeCoupons.length / activeCouponsPerPage);
  const indexOfLastActiveCoupon = activeCouponPage * activeCouponsPerPage;
  const indexOfFirstActiveCoupon = indexOfLastActiveCoupon - activeCouponsPerPage;
  const currentActiveCoupons = activeCoupons.slice(indexOfFirstActiveCoupon, indexOfLastActiveCoupon);

  const stepTexts = [
    {
      title: '1 번째, 쿠폰을 발급받아요',
      description: '원하는 쿠폰을 선택하고 “쿠폰 받기”를 클릭하세요.',
    },
    {
      title: '2 번째, 마이페이지에서 확인해요',
      description: '[마이페이지] - [쿠폰함]에서 발급된 쿠폰을 확인할 수 있어요.',
    },
    {
      title: '3 번째, 예매할 때 적용해요',
      description: '결제 단계에서 쿠폰을 선택하면 자동 적용돼요.',
    },
  ];

  return (
    <>
      <Header />
      <section className={styles.heroWrapper}>
        <div className={styles.heroSection}>
          <img src="/8537985.jpg" className={styles.heroImage} />
          {/* Hero Section */}
            <div className={styles.heroContent}>
              <motion.h2
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className={styles.heroTitle}
              >
                지금 바로 할인쿠폰 받고<br />티켓 응모 GO!
              </motion.h2>
              <p className={styles.heroSubtitle}>
                할인 받고 응모까지, 티켓은 Tickle에서!
              </p>
              <div className={styles.heroButtons}>
                <button className={styles.primaryButton}>보유중인 쿠폰 확인하기</button>
                <button className={styles.secondaryButton}>쿠폰 이벤트 참여하기</button>
              </div>
          </div>
        </div>
      </section>
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Tab 버튼 */}
          <div className={styles.tabButtons}>
            <button
              className={activeTab === 'coupon' ? styles.activeTab : styles.inactiveTab}
              onClick={() => setActiveTab('coupon')}
            >
              쿠폰 이벤트
            </button>
            <button
              className={activeTab === 'ticket' ? styles.activeTab : styles.inactiveTab}
              onClick={() => setActiveTab('ticket')}
            >
              티켓 이벤트
            </button>
          </div>

          {activeTab === 'coupon' && (
            <>
              {/* Coupon Statistics */}
              <section className={styles.statsSection}>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>🎪</div>
                    <div className={styles.statNumber}>6</div>
                    <div className={styles.statLabel}>이벤트 카테고리</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>🎫</div>
                    <div className={styles.statNumber}>무제한</div>
                    <div className={styles.statLabel}>쿠폰 발급 횟수</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>⚡</div>
                    <div className={styles.statNumber}>즉시</div>
                    <div className={styles.statLabel}>쿠폰 발급</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>💎</div>
                    <div className={styles.statNumber}>100%</div>
                    <div className={styles.statLabel}>무료 혜택</div>
                  </div>
                </div>
              </section>
                              {/* Quick Tips */}
                              <div className={styles.quickTips}>
                  <h4>💡 쿠폰 사용 팁</h4>
                  <div className={styles.tipsGrid}>
                    <div className={styles.tipItem}>
                      <span className={styles.tipIcon}>⏰</span>
                      <span>쿠폰은 발급 후 30일간 사용 가능</span>
                    </div>
                    <div className={styles.tipItem}>
                      <span className={styles.tipIcon}>🎫</span>
                      <span>한 번에 하나의 쿠폰만 적용 가능</span>
                    </div>
                    <div className={styles.tipItem}>
                      <span className={styles.tipIcon}>💰</span>
                      <span>최소 결제 금액 확인 후 사용하세요</span>
                    </div>
                  </div>
                </div>

              {/* Coupon Section */}
              <section className={styles.sectionBox}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>🎁 쿠폰 이벤트</h2>
                  <p className={styles.sectionSubtitle}>매일 새로운 할인 혜택을 만나보세요!</p>
                </div>
                
                {/* Special Event Coupons */}
                <div className={styles.specialCouponsSection}>
                  <div className={styles.couponHeader}>
                    <h3 className={styles.couponTitle}>특별 이벤트 쿠폰</h3>
                    <div className={styles.couponBadge}>한정</div>
                  </div>
                  <p className={styles.couponDesc}>Tickle이 준비한 한정 할인 혜택!</p>
                  <div className={styles.couponFeatures}>
                    <span>🔥 인기</span>
                    <span>⚡ 즉시 발급</span>
                    <span>🎯 한정 수량</span>
                  </div>
                  <CouponSection title="" description="" type="special" />
                </div>

                {/* Active Coupons List */}
                <div className={styles.activeCouponsSection}>
                  <div className={styles.couponHeader}>
                    <h3 className={styles.couponTitle}>현재 진행중인 쿠폰</h3>
                    <div className={styles.couponBadge}>진행중</div>
                  </div>
                  <p className={styles.couponDesc}>지금 사용 가능한 할인 쿠폰 모음!</p>
                  <CouponSection title="" description="" type="active" />
              </div>
            </section>
            </>
          )}
          {activeTab === 'ticket' && (
            <section className={styles.sectionBoxGray}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.ticketTitle}>🎭 진행중인 티켓 이벤트</h2>
                <p className={styles.ticketDesc}>다양한 공연과 이벤트에서 사용 가능한 티켓 이벤트가 준비되어 있어요!</p>
              </div>

              {/* Ticket Event Stats */}
              <div className={styles.ticketStats}>
                <div className={styles.ticketStatItem}>
                  <div className={styles.ticketStatNumber}>{ticketEvents.length}</div>
                  <div className={styles.ticketStatLabel}>진행중인 이벤트</div>
                </div>
                <div className={styles.ticketStatItem}>
                  <div className={styles.ticketStatNumber}>6</div>
                  <div className={styles.ticketStatLabel}>카테고리</div>
                </div>
                <div className={styles.ticketStatItem}>
                  <div className={styles.ticketStatNumber}>무료</div>
                  <div className={styles.ticketStatLabel}>응모 비용</div>
                </div>
                <div className={styles.ticketStatItem}>
                  <div className={styles.ticketStatNumber}>즉시</div>
                  <div className={styles.ticketStatLabel}>응모 가능</div>
                </div>
              </div>

              <div className={styles.ticketGrid}>
                {currentEvents.map((event, index) => (
                  <TicketEventCard
                    key={index}
                    title={event.title}
                    description={event.description}
                    eventId={event.id}
                    imageUrl={event.imageUrl}
                  />
                ))}
              </div>

              <div className={styles.pagination}>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={currentPage === i + 1 ? styles.activePage : ''}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {/* Event Highlights */}
              <div className={styles.eventHighlights}>
                <h4>🌟 이번 주 인기 이벤트</h4>
                <div className={styles.highlightsGrid}>
                  <div className={styles.highlightCard}>
                    <div className={styles.highlightIcon}>🔥</div>
                    <div className={styles.highlightContent}>
                      <h5>KPOP Exclusive</h5>
                      <p>25% 할인으로 만나는 K-POP 공연</p>
                    </div>
                  </div>
                  <div className={styles.highlightCard}>
                    <div className={styles.highlightIcon}>🎭</div>
                    <div className={styles.highlightContent}>
                      <h5>오페라 데이</h5>
                      <p>40% 쿠폰으로 즐기는 클래식의 향연</p>
                    </div>
                  </div>
                  <div className={styles.highlightCard}>
                    <div className={styles.highlightIcon}>🎪</div>
                    <div className={styles.highlightContent}>
                      <h5>여름 페스티벌</h5>
                      <p>30% 할인으로 즐기는 여름 축제</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
                        {/* 할인 방법 */}
              <section className={styles.discountSection}>
                <div className={styles.discountImageWrapper}>
                  <img src="/1010.png" alt="이벤트 이미지" className={styles.discountImage} />
                </div>
                <div className={styles.discountContent}>
                  <h3 className={styles.discountTitle}>할인 방법</h3>
                  <p className={styles.discountText}>
                    티켓 예매 전, 쿠폰을 미리 발급받고 예매 과정에서 적용하면 할인 혜택을 받을 수 있어요!<br />
                    발급 → 확인 → 적용,<br />
                    아래 순서를 따라 차근차근 진행해보세요.<br />
                    <span className={styles.discountNote}>
                      확인이 어려우신 경우 고객센터로 문의 부탁드립니다.
                    </span>
                  </p>

                  <div className={styles.stepsWrapper}>
                    {stepTexts.map((step, index) => (
                      <div key={index} className={styles.stepCard}>
                        <div className={styles.stepImage} />
                        <p className={styles.stepTitle}>{step.title}</p>
                        <p className={styles.stepDesc}>{step.description}</p>
                        <div className={styles.stepNumber}>{index + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
