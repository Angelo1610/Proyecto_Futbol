import React from 'react';
import { Steps } from 'primereact/steps';

export default function PurchaseProgress({ currentStep, className = '' }) {
  const items = [
    { id: 'seats', label: 'Asientos' },
    { id: 'payment', label: 'Pago' },
    { id: 'confirmation', label: 'Confirmación' }
  ];

  const activeIndex = Math.max(items.findIndex(item => item.id === currentStep), 0);

  return (
    <div className={`surface-card border-round-2xl p-4 md:p-5 shadow-2 ${className}`}>
      <Steps model={items} activeIndex={activeIndex} readOnly={true} className="p-steps-custom" />
    </div>
  );
}
