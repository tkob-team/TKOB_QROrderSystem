import { X, Mail, Info } from 'lucide-react';
import type { StaffRole, RoleOption } from '../../../model/types';

interface InviteStaffModalProps {
  show: boolean;
  inviteEmail: string;
  selectedRole: StaffRole | null;
  roleOptions: RoleOption[];
  onClose: () => void;
  onEmailChange: (email: string) => void;
  onRoleSelect: (role: StaffRole) => void;
  onSendInvite: () => void;
}

export function InviteStaffModal({
  show,
  inviteEmail,
  selectedRole,
  roleOptions,
  onClose,
  onEmailChange,
  onRoleSelect,
  onSendInvite,
}: InviteStaffModalProps) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-white/40 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-secondary w-full max-w-2xl mx-4 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-default">
          <div>
            <h3 className="text-text-primary text-[22px] font-bold">
              Invite Team Member
            </h3>
            <p className="text-text-secondary mt-1 text-sm">
              Send an invitation to join your restaurant team
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-elevated rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-tertiary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6">
          {/* Email Input */}
          <div className="flex flex-col gap-2">
            <label className="text-text-primary text-sm font-semibold">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary" />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full pl-10 pr-4 py-3 h-12 border border-default bg-secondary text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-[15px] rounded-lg"
                autoFocus
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="flex flex-col gap-3">
            <label className="text-text-primary text-sm font-semibold">
              Select Role *
            </label>
            <div className="grid grid-cols-1 gap-3">
              {roleOptions.map((option) => {
                const OptionIcon = option.icon;
                const isSelected = selectedRole === option.role;

                return (
                  <button
                    key={option.role}
                    onClick={() => onRoleSelect(option.role)}
                    className={`flex items-start gap-4 p-4 border-2 transition-all text-left rounded-lg ${
                      isSelected
                        ? `border-${option.color}-500 bg-${option.color}-50`
                        : 'border-default hover:border-elevated'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? `bg-${option.color}-100` : 'bg-elevated'
                      }`}
                    >
                      <OptionIcon
                        className={`w-6 h-6 ${
                          isSelected ? `text-${option.color}-600` : 'text-text-tertiary'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-text-primary text-base font-semibold">
                          {option.label}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 bg-accent-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-text-secondary text-[13px] leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info Tip */}
          <div className="flex gap-3 p-4 bg-info-bg border border-info-border rounded-lg">
            <Info className="w-5 h-5 text-info-text flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-info-text text-[13px] leading-relaxed">
                <strong>Important:</strong> The invited member will receive an email with instructions to
                set up their account. They won&apos;t have access until they accept the invitation and create a
                password.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-default">
          <button
            onClick={onClose}
            className="flex-1 px-4 h-12 border-2 border-default text-text-secondary hover:bg-elevated transition-colors text-[15px] font-semibold rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onSendInvite}
            disabled={!inviteEmail || !selectedRole}
            className="flex-1 px-4 h-12 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-600))] text-white disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors text-[15px] font-semibold rounded-lg"
          >
            Send Invitation
          </button>
        </div>
      </div>
    </div>
  );
}
