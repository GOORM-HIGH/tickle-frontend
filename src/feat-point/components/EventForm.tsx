import React, { useState } from 'react';
import styles from '../styles/history.module.css';
import { EventFormData } from '../types';

interface EventFormProps {
  onSubmit: (formData: EventFormData) => void;
}

export const EventForm: React.FC<EventFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    maxParticipants: '',
    eventType: 'concert'
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
        <h1 className={styles.pageTitle}>이벤트 생성</h1>
      </div>
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.eventForm}>
          <div className={styles.formGroup}>
            <label htmlFor="title">이벤트 제목 *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="이벤트 제목을 입력하세요"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">이벤트 설명</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="이벤트에 대한 상세 설명을 입력하세요"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="startDate">시작일 *</label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="endDate">종료일 *</label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="location">장소</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="이벤트 장소를 입력하세요"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="maxParticipants">최대 참가자 수</label>
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleInputChange}
                min="1"
                placeholder="최대 참가자 수"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="eventType">이벤트 유형</label>
              <select
                id="eventType"
                name="eventType"
                value={formData.eventType}
                onChange={handleInputChange}
              >
                <option value="concert">콘서트</option>
                <option value="musical">뮤지컬</option>
                <option value="play">연극</option>
                <option value="exhibition">전시회</option>
                <option value="festival">페스티벌</option>
              </select>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.submitButton}>
              이벤트 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 