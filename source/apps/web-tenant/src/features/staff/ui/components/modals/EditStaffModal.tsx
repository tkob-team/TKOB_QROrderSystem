import { X } from 'lucide-react';
import type { StaffMember, StaffRole, RoleOption, EditForm } from '../../../model/types';

interface EditStaffModalProps {
  show: boolean;
  selectedMember: StaffMember | null;
  editForm: EditForm;
  roleOptions: RoleOption[];
  onClose: () => void;
  onFormChange: (form: EditForm) => void;
  onSaveChanges: () => void;
  onResendInvite: () => void;
  onRevokeInvite: () => void;
}

export function EditStaffModal({
  show,
  selectedMember,
  editForm,
  roleOptions,
  onClose,
  onFormChange,
  onSaveChanges,
  onResendInvite,
  onRevokeInvite,
}: EditStaffModalProps) {
  if (!show || !selectedMember) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-white/40 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-secondary w-full max-w-2xl mx-4 flex flex-col rounded-2xl shadow-2xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-default">
          <div>
            <h3 className="text-text-primary text-[22px] font-bold">
              Edit Team Member
            </h3>
            <p className="text-text-secondary mt-1 text-sm">
              Update details for this team member
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
        <div className="p-6 flex flex-col gap-6 overflow-y-auto flex-1">
          {/* Name Input */}
          <div className="flex flex-col gap-2">
            <label className="text-text-primary text-sm font-semibold">
              Name *
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => onFormChange({ ...editForm, name: e.target.value })}
              className="w-full px-4 py-3 h-12 border border-default bg-secondary text-text-primary focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-[15px] rounded-lg"
            />
          </div>

          {/* Email Input */}
          <div className="flex flex-col gap-2">
            <label className="text-text-primary text-sm font-semibold">
              Email Address *
            </label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => onFormChange({ ...editForm, email: e.target.value })}
              disabled={selectedMember.status === 'ACTIVE'}
              className="w-full px-4 py-3 h-12 border border-default bg-secondary text-text-primary disabled:bg-elevated disabled:cursor-not-allowed focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-[15px] rounded-lg"
            />
          </div>

          {/* Role Selection */}
          <div className="flex flex-col gap-3">
            <label className="text-text-primary text-sm font-semibold">
              Role *
            </label>
            <select
              value={editForm.role}
              onChange={(e) => onFormChange({ ...editForm, role: e.target.value as StaffRole })}
              className="px-4 py-3 h-12 border border-default rounded-lg bg-secondary text-text-primary cursor-pointer focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-[15px]"
            >
              {roleOptions.map((option) => (
                <option key={option.role} value={option.role}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Pending Actions */}
          {selectedMember.status === 'PENDING' && (
            <div className="flex flex-col gap-3 pt-4 border-t border-default">
              <button
                onClick={onResendInvite}
                className="w-full px-4 py-3 border-2 border-accent-300 text-accent-600 hover:bg-accent-50 transition-colors text-[15px] font-semibold rounded-lg"
              >
                Resend Invitation
              </button>
              <button
                onClick={onRevokeInvite}
                className="w-full px-4 py-3 border-2 border-red-300 text-red-700 hover:bg-red-50 transition-colors text-[15px] font-semibold rounded-lg"
              >
                Revoke Invitation
              </button>
            </div>
          )}
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
            onClick={onSaveChanges}
            className="flex-1 px-4 h-12 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-600))] text-white transition-colors text-[15px] font-semibold rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
