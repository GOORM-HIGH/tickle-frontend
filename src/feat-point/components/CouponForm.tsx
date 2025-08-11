import React, { useState } from 'react';
import styles from '../styles/history.module.css';
import { CouponFormData } from '../types';

interface CouponFormProps {
  onSubmit: (formData: CouponFormData) => void;
}

export const CouponForm: React.FC<CouponFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<CouponFormData>({
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minAmount: '',
    maxDiscount: '',
    validFrom: '',
    validTo: '',
    quantity: '',
    couponType: 'discount'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={styles.contentSection}>
      <div className={styles.contentHeader}>
        <h1 className={styles.pageTitle}>쿠폰 발급</h1>
      </div>
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.couponForm}>
          <div className={styles.formGroup}>
            <label htmlFor="name">쿠폰명 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="쿠폰 이름을 입력하세요"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">쿠폰 설명</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="쿠폰에 대한 설명을 입력하세요"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="couponType">쿠폰 유형</label>
              <select
                id="couponType"
                name="couponType"
                value={formData.couponType}
                onChange={handleInputChange}
              >
                <option value="discount">할인 쿠폰</option>
                <option value="cashback">캐시백 쿠폰</option>
                <option value="free">무료 쿠폰</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="discountType">할인 유형</label>
              <select
                id="discountType"
                name="discountType"
                value={formData.discountType}
                onChange={handleInputChange}
              >
                <option value="percentage">퍼센트 할인</option>
                <option value="fixed">정액 할인</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="discountValue">할인 값 *</label>
              <input
                type="number"
                id="discountValue"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleInputChange}
                required
                placeholder={formData.discountType === 'percentage' ? '할인율 (%)' : '할인 금액 (원)'}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="minAmount">최소 사용 금액</label>
              <input
                type="number"
                id="minAmount"
                name="minAmount"
                value={formData.minAmount}
                onChange={handleInputChange}
                placeholder="최소 사용 금액 (원)"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="maxDiscount">최대 할인 금액</label>
              <input
                type="number"
                id="maxDiscount"
                name="maxDiscount"
                value={formData.maxDiscount}
                onChange={handleInputChange}
                placeholder="최대 할인 금액 (원)"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="quantity">발급 수량</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                placeholder="발급할 쿠폰 수량"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="validFrom">유효 시작일 *</label>
              <input
                type="datetime-local"
                id="validFrom"
                name="validFrom"
                value={formData.validFrom}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="validTo">유효 종료일 *</label>
              <input
                type="datetime-local"
                id="validTo"
                name="validTo"
                value={formData.validTo}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.submitButton}>
              쿠폰 발급
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 