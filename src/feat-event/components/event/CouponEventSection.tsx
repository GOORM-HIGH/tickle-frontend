import CouponSection from '../coupon/CouponSection';
import styles from '../../styles/event.module.css';

export default function CouponEventSection() {
  return (
    <>
      {/* Coupon Section */}
      <section className={styles.sectionBox} data-section="coupon">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>쿠폰 이벤트</h2>
          <p className={styles.sectionSubtitle}>매일 새로운 할인 혜택을 만나보세요!</p>
        </div>
        

        {/* Coupon Statistics */}
        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>3</div>
              <div className={styles.statLabel}>이벤트 카테고리</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>선착순</div>
              <div className={styles.statLabel}>쿠폰 발급</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>할인</div>
              <div className={styles.statLabel}>무료 혜택</div>
            </div>
          </div>
        </section>
        
        {/* Special Event Coupons */}
        <div className={styles.specialCouponsSection}>
          <div className={styles.couponHeader}></div>
          <div className={styles.couponFeatures}> 
            <span>🔥 인기</span>
            <span>⚡ 즉시 발급</span>
            <span>🎯 한정 수량</span>
          </div>
          <CouponSection 
            type="special" 
            title="특별 이벤트 쿠폰"
            description="Tickle이 준비한 한정 할인 혜택!"
          />
        </div>

        {/* Active Coupons List */}
        <div className={styles.activeCouponsSection}>
          <div className={styles.couponHeader}></div>
          <div className={styles.couponFeatures}> 
          <span>🔥 인기</span>
            <span>⚡ 즉시 발급</span>
            <span>🎯 한정 수량</span>
          </div>
          <CouponSection 
            type="active" 
            title="현재 진행중인 쿠폰"
            description="지금 사용 가능한 할인 쿠폰 모음!"
          />
        </div>

        {/* Quick Tips */}
        <div className={styles.quickTips}>
          <h4> 쿠폰 사용 팁</h4>
          <div className={styles.tipsGrid}>
            <div className={styles.tipItem}>
              <span className={styles.tipIcon}>1️⃣</span>
              <span>쿠폰은 발급 후 유효기간 전 까지 사용 가능</span>
            </div>
            <div className={styles.tipItem}>
              <span className={styles.tipIcon}>2️⃣</span>
              <span>한 번에 하나의 쿠폰만 적용 가능</span>
            </div>
            <div className={styles.tipItem}>
              <span className={styles.tipIcon}>3️⃣</span>
              <span>최소 결제 금액 확인 후 사용하세요</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 