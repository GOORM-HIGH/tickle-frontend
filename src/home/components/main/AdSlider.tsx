import React, { useState, useEffect } from 'react';
import '../../styles/AdSlider.css';
import ad1Gif from '../../../assets/home/ad1.gif';
import ad2Gif from '../../../assets/home/ad2.gif';
import ad3Gif from '../../../assets/home/ad3.gif';

interface AdSlide {
  id: number;
  imageUrl: string;
}

const AdSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: AdSlide[] = [
    {
      id: 1,
      imageUrl: ad1Gif,
    },
    {
      id: 2,
      imageUrl: ad2Gif,
    },
    {
      id: 3,
      imageUrl: ad3Gif,
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // 5초마다 자동 슬라이드

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };



  return (
    <section className="ad-slider">
      <div className="slider-container">
        <div className="slider-wrapper" style={{ transform: `translateX(-${currentSlide * 33.333}%)` }}>
          {slides.map((slide) => (
            <div key={slide.id} className="slide">
              <img src={slide.imageUrl} alt={`Slide ${slide.id}`}/>
            </div>
          ))}
        </div>
        

        
        {/* 인디케이터 */}
        <div className="slider-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdSlider; 