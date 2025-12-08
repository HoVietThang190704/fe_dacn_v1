import { Dispatch, memo, SetStateAction } from 'react';
import { checkoutConfig } from '@/config/checkoutConfig';
import { ShippingAddress, TranslateFn } from '../types';
import { AddressFormState } from '../hooks/useCheckoutAddresses';

const { profileAddressId } = checkoutConfig;

interface AddressSectionProps {
  t: TranslateFn;
  addressLabelMap: Record<string, string>;
  displayAddresses: ShippingAddress[];
  selectedAddressId: string;
  setSelectedAddressId: (value: string) => void;
  showAddAddressForm: boolean;
  setShowAddAddressForm: Dispatch<SetStateAction<boolean>>;
  newAddress: AddressFormState;
  setNewAddress: Dispatch<SetStateAction<AddressFormState>>;
  isCreatingAddress: boolean;
  isLoadingAddresses: boolean;
  handleCreateAddress: () => void;
  handleDeleteAddress: (id?: string) => void;
  deletingAddressId: string | null;
  handleSetDefaultAddress: (id?: string) => void;
  settingDefaultAddressId: string | null;
  resolveAddressLabel: (label?: string | null) => string;
}

export const AddressSection = memo(({
  t,
  addressLabelMap,
  displayAddresses,
  selectedAddressId,
  setSelectedAddressId,
  showAddAddressForm,
  setShowAddAddressForm,
  newAddress,
  setNewAddress,
  isCreatingAddress,
  isLoadingAddresses,
  handleCreateAddress,
  handleDeleteAddress,
  deletingAddressId,
  handleSetDefaultAddress,
  settingDefaultAddressId,
  resolveAddressLabel,
}: AddressSectionProps) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-800">{t('address.title')}</h2>
      {!showAddAddressForm && (
        <button onClick={() => setShowAddAddressForm(true)} className="text-sm text-orange-500 hover:text-orange-600">
          {t('address.add')}
        </button>
      )}
    </div>

    {showAddAddressForm && (
      <div className="mb-4 p-4 border rounded-lg bg-gray-50">
        <h3 className="font-medium mb-3">{t('address.formTitle')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            placeholder={t('address.fields.recipientName')}
            value={newAddress.recipientName}
            onChange={(e) => setNewAddress((prev) => ({ ...prev, recipientName: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <input
            type="text"
            placeholder={t('address.fields.phone')}
            value={newAddress.phone}
            onChange={(e) => setNewAddress((prev) => ({ ...prev, phone: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <input
            type="text"
            placeholder={t('address.fields.address')}
            value={newAddress.address}
            onChange={(e) => setNewAddress((prev) => ({ ...prev, address: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <input
            type="text"
            placeholder={t('address.fields.ward')}
            value={newAddress.ward}
            onChange={(e) => setNewAddress((prev) => ({ ...prev, ward: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <input
            type="text"
            placeholder={t('address.fields.district')}
            value={newAddress.district}
            onChange={(e) => setNewAddress((prev) => ({ ...prev, district: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <input
            type="text"
            placeholder={t('address.fields.province')}
            value={newAddress.province}
            onChange={(e) => setNewAddress((prev) => ({ ...prev, province: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <div className="flex items-center gap-4 mb-3">
          <select
            value={newAddress.label}
            onChange={(e) => setNewAddress((prev) => ({ ...prev, label: e.target.value as AddressFormState['label'] }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="home">{addressLabelMap.home}</option>
            <option value="work">{addressLabelMap.work}</option>
            <option value="other">{addressLabelMap.other}</option>
          </select>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newAddress.isDefault}
              onChange={(e) => setNewAddress((prev) => ({ ...prev, isDefault: e.target.checked }))}
              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            {t('address.setDefault')}
          </label>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCreateAddress}
            disabled={isCreatingAddress}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {isCreatingAddress ? t('address.saving') : t('address.save')}
          </button>
          <button onClick={() => setShowAddAddressForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
            {t('actions.cancel')}
          </button>
        </div>
      </div>
    )}

    {isLoadingAddresses ? (
      <div className="flex items-center justify-center py-4">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
        <span className="sr-only">{t('address.loading')}</span>
      </div>
    ) : displayAddresses.length === 0 && !showAddAddressForm ? (
      <div className="text-center py-4 text-gray-500">
        {t('address.empty')}{' '}
        <button onClick={() => setShowAddAddressForm(true)} className="text-orange-500 hover:text-orange-600 ml-1">
          {t('address.emptyAction')}
        </button>
      </div>
    ) : (
      <div className="space-y-3">
        {displayAddresses.map((address) => {
          const fallbackKey = `${address.phone}-${address.address}-${address.district}-${address.province}`;
          const optionValue = address.id ?? fallbackKey;
          const isSelected = selectedAddressId === optionValue;
          const canDelete = Boolean(address.id && address.id !== profileAddressId);
          const canSetDefault = Boolean(address.id && address.id !== profileAddressId && !address.isDefault);

          return (
            <label
              key={address.id ?? fallbackKey}
              className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="shippingAddress"
                value={optionValue}
                checked={isSelected}
                onChange={(e) => setSelectedAddressId(e.target.value)}
                className="mt-1 text-orange-500 focus:ring-orange-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {address.recipientName} | {address.phone}
                </div>
                <div className="text-gray-600 text-sm mt-1">
                  {address.fullAddress || [address.address, address.ward, address.district, address.province].filter(Boolean).join(', ')}
                </div>
                {address.id === profileAddressId ? (
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded">
                    {t('address.badges.profile')}
                  </span>
                ) : address.label ? (
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    {resolveAddressLabel(address.label)}
                  </span>
                ) : null}
                {address.isDefault && address.id !== profileAddressId && (
                  <span className="inline-block mt-2 ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded">
                    {t('address.badges.default')}
                  </span>
                )}
                {address.note && <div className="text-xs text-gray-500 mt-1">{address.note}</div>}
                {canDelete && (
                  <div className="mt-3">
                    <div className="flex gap-4 items-center text-sm">
                      {canSetDefault && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSetDefaultAddress(address.id);
                          }}
                          disabled={settingDefaultAddressId === address.id}
                          className="text-orange-500 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {settingDefaultAddressId === address.id ? t('address.settingDefault') : t('address.setDefault')}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteAddress(address.id);
                        }}
                        disabled={deletingAddressId === address.id}
                        className="text-red-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingAddressId === address.id ? t('address.deleting') : t('address.delete')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>
    )}
  </div>
));

AddressSection.displayName = 'AddressSection';
