import React from 'react';

interface SectionHeaderProps {
  title: React.ReactNode;
  subtitle?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="page-header">
      <h2 className="page-title">{title}</h2>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>
  );
};

export default SectionHeader;


