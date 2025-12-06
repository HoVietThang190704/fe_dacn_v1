import React from 'react';
import { LivestreamForm } from '../../types';
import { useTranslations } from 'next-intl';


type Props = {
  formData: LivestreamForm;
  setFormData: React.Dispatch<React.SetStateAction<LivestreamForm>>;
};

export const ScheduleSection: React.FC<Props> = ({ formData, setFormData }) => {
  const t = useTranslations('livestream');

  return (
    <div className="border-t pt-6">
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="isScheduled"
          name="isScheduled"
          checked={formData.isScheduled}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, isScheduled: e.target.checked, scheduleDate: '', scheduleTime: '' }));
          }}
          className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
        />
        <label htmlFor="isScheduled" className="ml-3 text-sm font-semibold text-gray-700">
          {t('form.scheduleLabel')}
        </label>
      </div>

      {formData.isScheduled && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
          <div>
            <label htmlFor="scheduleDate" className="block text-sm font-medium text-gray-700 mb-2">
              {t('form.dateLabel')}
            </label>
            <input
              type="date"
              id="scheduleDate"
              name="scheduleDate"
              value={formData.scheduleDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, scheduleDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              required={formData.isScheduled}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label htmlFor="scheduleTime" className="block text-sm font-medium text-gray-700 mb-2">
              {t('form.timeLabel')}
            </label>
            <input
              type="time"
              id="scheduleTime"
              name="scheduleTime"
              value={formData.scheduleTime}
              onChange={(e) => setFormData((prev) => ({ ...prev, scheduleTime: e.target.value }))}
              required={formData.isScheduled}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>
          {formData.scheduleDate && formData.scheduleTime && (
            <div className="md:col-span-2 text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
              <span className="font-medium">{t('form.startTimePreview')}</span>{' '}
              {new Date(`${formData.scheduleDate}T${formData.scheduleTime}`).toLocaleString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
