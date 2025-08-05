import CouponCard from './CouponCard';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getSpecialEventCoupons, getCouponEvents } from '../../feat-event/api/eventApi';

type Props = {
  title: string;
  description: string;
  type: 'special' | 'active';
};

interface CouponData {
  id: number;
  name: string;
  rate: number;
  eventId: number;
}

interface CouponCardData {
  title: string;
  description: string;
  discount: string;
  date: string;
  eventId?: number;
}

export default function CouponSection({ title, description, type }: Props) {
  const [specialCoupons, setSpecialCoupons] = useState<CouponData[]>([]);
  const [activeCoupons, setActiveCoupons] = useState<CouponData[]>([]);
  const [loading, setLoading] = useState(false);

  // 특별 이벤트 쿠폰 로드 (coupon_id: 1, 2, 3)
  useEffect(() => {
    if (type === 'special') {
      const load = async () => {
        try {
          const data = await getSpecialEventCoupons();
          setSpecialCoupons(data);
        } catch (e) {
          console.error('특별 이벤트 쿠폰 로드 실패:', e);
        } finally { 
          setLoading(false);
        }
      };
      load();
    }
  }, [type]);

  // 현재 진행중인 쿠폰 로드 (쿠폰 ID 1, 2, 3 제외)
  useEffect(() => {
    if (type === 'active') {
      const load = async () => {
        setLoading(true);
        try {
          console.log('현재 진행중인 쿠폰 로드 시작...');
          const data = await getCouponEvents(0, 5);
          console.log('현재 진행중인 쿠폰 로드 성공:', data);
          
          // 쿠폰 ID 1, 2, 3을 제외하고 필터링
          const filteredCoupons = data.content.filter(coupon => 
            coupon.id !== 1 && coupon.id !== 2 && coupon.id !== 3
          );
          
          console.log('필터링된 쿠폰:', filteredCoupons);
          setActiveCoupons(filteredCoupons);
        } catch (e) {
          console.error('현재 진행중인 쿠폰 로드 실패:', e);
          // API 실패 시 기본 데이터 사용
          setActiveCoupons([
            { id: 4, name: "뮤지컬 〈프리다〉", rate: 15, eventId: 4 },
            { id: 5, name: "콘서트 〈스프링 페스티벌〉", rate: 25, eventId: 5 },
            { id: 6, name: "연극 〈햄릿〉", rate: 20, eventId: 6 },
            { id: 7, name: "클래식 〈베토벤 교향곡〉", rate: 10, eventId: 7 }
          ]);
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [type]);

  const coupons: CouponCardData[] =
    type === 'special'
      ? specialCoupons.map(coupon => ({
          title: coupon.name,
          description: '특별 할인 혜택',
          discount: `${coupon.rate}%`,
          date: '2025.12.31까지',
          eventId: coupon.eventId
        }))
      : activeCoupons.map(coupon => ({
          title: coupon.name,
          description: '진행중인 할인 혜택',
          discount: `${coupon.rate}%`,
          date: '2025.12.31까지',
          eventId: coupon.eventId
        }));

  // 디버깅 정보 출력
  console.log('CouponSection 렌더링:', {
    type,
    loading,
    specialCouponsLength: specialCoupons.length,
    activeCouponsLength: activeCoupons.length,
    couponsLength: coupons.length
  });

  return (
    <section style={{ marginBottom: '2rem' }}>
      {/* 제목과 설명이 있을 때만 표시 */}
      {title && description && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>{title}</h3>
          <p style={{ fontSize: '1rem', color: '#555', marginBottom: '1rem' }}>{description}</p>
        </motion.div>
      )}

      {/* 로딩 상태 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          {type === 'special' ? '특별 이벤트 쿠폰을 불러오는 중...' : '쿠폰을 불러오는 중...'}
        </div>
      ) : (
        <div
          style={{
            display: type === 'special' ? 'flex' : 'grid',
            gridTemplateColumns: type === 'active' ? 'repeat(auto-fill, minmax(300px, 1fr))' : 'none',
            gap: '1.5rem',
            paddingBottom: '1rem',
            ...(type === 'special' ? {
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
            } : {})
          }}
        >
          {coupons.length > 0 ? (
            coupons.map((c, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ 
                  ...(type === 'special' ? { flex: '0 0 280px', scrollSnapAlign: 'start' } : {})
                }}
              >
                <CouponCard {...c} />
              </motion.div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              쿠폰을 불러올 수 없습니다.
            </div>
          )}
        </div>
      )}
    </section>
  );
}