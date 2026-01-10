interface StaffTabBarProps {
  activeTab: 'active' | 'pending';
  onTabChange: (tab: 'active' | 'pending') => void;
  activeMembersCount: number;
  pendingMembersCount: number;
}

export function StaffTabBar({
  activeTab,
  onTabChange,
  activeMembersCount,
  pendingMembersCount,
}: StaffTabBarProps) {
  return (
    <div className="flex items-center gap-2 border-b border-default mb-6">
      <button
        onClick={() => onTabChange('active')}
        className={`px-6 py-3 transition-all relative text-[15px] font-semibold ${
          activeTab === 'active' ? 'text-accent-500' : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        Active Members ({activeMembersCount})
        {activeTab === 'active' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500" />}
      </button>
      <button
        onClick={() => onTabChange('pending')}
        className={`px-6 py-3 transition-all relative text-[15px] font-semibold ${
          activeTab === 'pending' ? 'text-accent-500' : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        Pending Invites ({pendingMembersCount})
        {activeTab === 'pending' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500" />}
      </button>
    </div>
  );
}
