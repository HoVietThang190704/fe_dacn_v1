import { memo, ReactNode } from 'react';

type PaymentValue = 'cod' | 'vnpay';

export interface PaymentMethod {
  value: PaymentValue;
  label: string;
  icon: ReactNode; // allow images or emojis
  disabled?: boolean;
}

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selected: PaymentValue;
  onChange: (value: PaymentValue) => void;
  comingSoonLabel: string;
}

export const PaymentMethodSelector = memo(({ methods, selected, onChange, comingSoonLabel }: PaymentMethodSelectorProps) => (
  <div className="space-y-3">
    {methods.map((method) => {
      const isSelected = selected === method.value;
      const isDisabled = Boolean(method.disabled);

      return (
        <label
          key={method.value}
          className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-colors ${
            isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
          } ${isDisabled ? 'opacity-60 cursor-not-allowed hover:border-gray-200' : 'cursor-pointer'}`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value={method.value}
            checked={isSelected}
            onChange={(e) => !isDisabled && onChange(e.target.value as PaymentValue)}
            disabled={isDisabled}
            className="text-orange-500 focus:ring-orange-500"
          />
          <span className="w-6 h-6 flex items-center justify-center" aria-hidden="true">{method.icon}</span>
          <span className="font-medium">
            {method.label}
            {isDisabled ? ` (${comingSoonLabel})` : ''}
          </span>
        </label>
      );
    })}
  </div>
));

PaymentMethodSelector.displayName = 'PaymentMethodSelector';
