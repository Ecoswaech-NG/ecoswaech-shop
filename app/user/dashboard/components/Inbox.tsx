"use client";

export default function Inbox() {
  return (
    <div className="mt-4">
      <h2 className="font-bold text-2xl text-gray-900 dark:text-white mb-6">Inbox</h2>
      <div className="bg-white dark:bg-[#18122b] rounded-2xl border border-gray-100 dark:border-[#2d1e5f] p-12 text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-[#484f58]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <h3 className="font-semibold text-lg text-gray-600 dark:text-gray-300 mb-2">
          Messaging coming soon
        </h3>
        <p className="text-sm text-gray-400 dark:text-[#8b949e] max-w-xs mx-auto">
          Direct messaging between buyers and sellers is being built.
          For now, use the WhatsApp and Call buttons on listing pages to contact sellers.
        </p>
      </div>
    </div>
  );
}