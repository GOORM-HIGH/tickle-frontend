import CouponCard from './CouponCard';
import { useState, useEffect } from 'react';
import { getSpecialEventCoupons, getCouponEvents } from '../../api/eventApi';

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
          console.log('특별 이벤트 쿠폰 데이터:', data);
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
          console.log('데이터 타입:', typeof data);
          console.log('데이터 구조:', JSON.stringify(data, null, 2));
          
          // data가 존재하고 content가 있는지 확인
          if (!data || !data.content) {
            console.warn('쿠폰 데이터가 올바르지 않습니다:', data);
            setActiveCoupons([]);
            return;
          }
          
          // content가 배열인지 확인
          if (!Array.isArray(data.content)) {
            console.warn('쿠폰 content가 배열이 아닙니다:', data.content);
            setActiveCoupons([]);
            return;
          }
          
          // 쿠폰 ID 1, 2, 3을 제외하고 필터링
          const filteredCoupons = data.content.filter(coupon => 
            coupon && coupon.id && coupon.id !== 1 && coupon.id !== 2 && coupon.id !== 3
          );
          console.log('필터링된 쿠폰:', filteredCoupons);
          setActiveCoupons(filteredCoupons);
        } catch (e) {
          console.error('현재 진행중인 쿠폰 로드 실패:', e);
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [type]);

  const coupons: CouponCardData[] =
    type === 'special'
      ? specialCoupons
          .filter(coupon => coupon && coupon.id && coupon.name && coupon.rate !== undefined)
          .map(coupon => {
            console.log('특별 쿠폰 매핑:', { id: coupon.id, eventId: coupon.eventId, name: coupon.name });
            return {
              title: coupon.name,
              description: '특별 할인 혜택',
              discount: `${coupon.rate}%`,
              date: '2025.12.31까지',
              eventId: coupon.eventId
            };
          })
      : activeCoupons
          .filter(coupon => coupon && coupon.id && coupon.name && coupon.rate !== undefined)
          .map(coupon => {
            console.log('활성 쿠폰 매핑:', { id: coupon.id, eventId: coupon.eventId, name: coupon.name });
            return {
              title: coupon.name,
              description: '진행중인 할인 혜택',
              discount: `${coupon.rate}%`,
              date: '2025.12.31까지',
              eventId: coupon.eventId
            };
          });

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
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>{title}</h3>
          <p style={{ fontSize: '1rem', color: '#555', marginBottom: '1rem' }}>{description}</p>
        </div>
      )}

      {/* 로딩 상태 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          {type === 'special' ? '특별 이벤트 쿠폰을 불러오는 중...' : '쿠폰을 불러오는 중...'}
        </div>
      ) : (
        <div
          style={{
            display: type === 'special' ? 'flex' : 'flex',
            flexDirection: type === 'active' ? 'column' : 'row',
            gap: type === 'active' ? '1rem' : '1.5rem',
            paddingBottom: '1rem',
            ...(type === 'special' ? {
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
            } : {})
          }}
        >
          {coupons.length > 0 ? (
            coupons.map((c, i) => (
              <div
                key={i}
                style={{ 
                  ...(type === 'special' ? { 
                    flex: '0 0 280px', 
                    scrollSnapAlign: 'start' 
                  } : {
                    width: '100%',
                    maxWidth: '100%'
                  })
                }}
              >
                <CouponCard {...c} variant={type === 'active' ? 'list' : 'card'} />
              </div>
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