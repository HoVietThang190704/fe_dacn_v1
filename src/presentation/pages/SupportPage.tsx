'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useSupportViewModel } from '../viewmodels/useSupportViewModel';
import { container } from '../di/container';
import { SupportTicket, FAQ, TicketStatus } from '@/domain/entities/Support';

interface SupportPageProps {
  userId: string;
}

export const SupportPage: React.FC<SupportPageProps> = ({ userId }) => {
  const t = useTranslations('support');
  // Comment out API calls - using mock data for UI preview
  // const viewModel = useSupportViewModel(container.getSupportDataUseCase, userId);
  // if (viewModel.isLoading) {
  //   return <LoadingState />;
  // }
  // if (viewModel.error) {
  //   return <ErrorState error={viewModel.error} onRetry={viewModel.refresh} />;
  // }

  // Mock data for UI preview
  const [activeTab, setActiveTab] = React.useState<'faqs' | 'tickets'>('faqs');
  const mockFAQs: FAQ[] = [
    {
      id: '1',
      question: 'Làm thế nào để đặt hàng?',
      answer: 'Bạn chỉ cần chọn sản phẩm, thêm vào giỏ hàng và thanh toán. Rất đơn giản!',
      category: 'order',
      helpful: 45,
      notHelpful: 3
    },
    {
      id: '2',
      question: 'Thời gian giao hàng bao lâu?',
      answer: 'Thông thường là 1-2 ngày làm việc tùy theo khu vực của bạn.',
      category: 'shipping',
      helpful: 89,
      notHelpful: 5
    }
  ];

  const mockTickets: SupportTicket[] = [];

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('title')}</h1>
        <p className="text-sm text-gray-600 mt-1">{t('subtitle')}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
        <QuickActionCard icon="📞" title={t('hotline')} description="1800-1234" color="bg-blue-500" />
        <QuickActionCard icon="✉️" title={t('email')} description="support@freshmarket.vn" color="bg-orange-500" />
        <QuickActionCard icon="💬" title={t('chat')} description="Trò chuyện trực tiếp" color="bg-green-500" />
      </div>
      <div className="bg-white shadow-sm p-2 mb-3 flex gap-2">
        <button onClick={() => setActiveTab('faqs')} className={`flex-1 sm:flex-initial px-4 py-2 rounded text-sm font-medium transition-colors ${activeTab === 'faqs' ? 'bg-orange-500 text-white' : 'bg-transparent text-gray-700 hover:bg-gray-100'}`}>❓ {t('faqsTab')}</button>
        <button onClick={() => setActiveTab('tickets')} className={`flex-1 sm:flex-initial px-4 py-2 rounded text-sm font-medium transition-colors ${activeTab === 'tickets' ? 'bg-orange-500 text-white' : 'bg-transparent text-gray-700 hover:bg-gray-100'}`}>🎫 {t('ticketsTab', { count: mockTickets.length })}</button>
      </div>
      {activeTab === 'faqs' ? (
        <div className="space-y-3">
          <div className="bg-orange-50 border border-orange-200 rounded p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold text-orange-900 text-sm sm:text-base mb-1">{t('createTicket')}</h3>
              <p className="text-xs sm:text-sm text-orange-700">{t('subtitle')}</p>
            </div>
            <button className="w-full sm:w-auto px-4 py-2 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors">{t('createTicket')}</button>
          </div>
          {mockFAQs.map((faq) => (
            <FAQCard key={faq.id} faq={faq as any} />
          ))}
        </div>
      ) : (
        <div>
          <button className="w-full sm:w-auto px-6 py-3 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors mb-4 flex items-center justify-center gap-2 text-sm">
            <span>+</span>
            Tạo yêu cầu mới
          </button>

          <div className="text-center py-12 bg-white shadow-sm rounded">
            <div className="text-gray-400 text-4xl sm:text-6xl mb-4">🎫</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
              Chưa có yêu cầu hỗ trợ nào
            </h3>
            <p className="text-sm text-gray-500">Mọi yêu cầu của bạn sẽ hiển thị ở đây</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components - Responsive Shopee style
const QuickActionCard: React.FC<{
  icon: string;
  title: string;
  description: string;
  color: string;
}> = ({ icon, title, description, color }) => (
  <div className="bg-white shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer">
    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${color} rounded-lg flex items-center justify-center text-xl sm:text-2xl mb-2 sm:mb-3`}>
      {icon}
    </div>
    <h3 className="font-semibold text-sm sm:text-base mb-1">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

const FAQCard: React.FC<{ faq: FAQ }> = ({ faq }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-start justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 pr-4">
          <h3 className="font-semibold mb-1">{faq.question}</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {faq.category}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t">
          <p className="text-gray-700 mt-4 mb-4">{faq.answer}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">Câu trả lời này có hữu ích không?</span>
            <button className="flex items-center gap-1 text-green-600 hover:text-green-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
              Có ({faq.helpful})
            </button>
            <button className="flex items-center gap-1 text-red-600 hover:text-red-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                />
              </svg>
              Không ({faq.notHelpful})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const TicketCard: React.FC<{ ticket: SupportTicket }> = ({ ticket }) => {
  const statusColors = {
    [TicketStatus.OPEN]: 'bg-blue-100 text-blue-800',
    [TicketStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
    [TicketStatus.RESOLVED]: 'bg-green-100 text-green-800',
    [TicketStatus.CLOSED]: 'bg-gray-100 text-gray-800',
  };

  const statusLabels = {
    [TicketStatus.OPEN]: 'Mới',
    [TicketStatus.IN_PROGRESS]: 'Đang xử lý',
    [TicketStatus.RESOLVED]: 'Đã giải quyết',
    [TicketStatus.CLOSED]: 'Đã đóng',
  };

  const priorityColors = {
    LOW: 'text-gray-500',
    MEDIUM: 'text-blue-500',
    HIGH: 'text-orange-500',
    URGENT: 'text-red-500',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">#{ticket.id.slice(0, 8)}</h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                statusColors[ticket.status]
              }`}
            >
              {statusLabels[ticket.status]}
            </span>
            <span className={`text-xs font-medium ${priorityColors[ticket.priority]}`}>
              ⚠️ {ticket.priority}
            </span>
          </div>
          <h4 className="font-medium mb-1">{ticket.subject}</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
        <div className="flex items-center gap-4">
          <span className="bg-gray-100 px-2 py-1 rounded">{ticket.category}</span>
          <span>
            Tạo lúc:{' '}
            {new Date(ticket.createdAt).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </span>
        </div>
        <button className="text-green-600 hover:text-green-700 font-medium">
          Xem chi tiết →
        </button>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Đang tải...</p>
    </div>
  </div>
);

const ErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="text-red-500 text-5xl mb-4">⚠️</div>
      <h2 className="text-xl font-semibold mb-2">Có lỗi xảy ra</h2>
      <p className="text-gray-600 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        Thử lại
      </button>
    </div>
  </div>
);
