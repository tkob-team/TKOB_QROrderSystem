/**
 * TablesPage - Shell component that composes sections and delegates logic to the controller.
 */
'use client';

import React from 'react';
import { Toast } from '@/shared/components/Toast';
import { QrCodeActions } from '../sections/QrCodeActions';
import { TableFormModals } from '../sections/TableFormModals';
import { TablesHeader } from '../sections/TablesHeader';
import { TablesList } from '../sections/TablesList';
import { selectFormModalProps, selectHeaderProps, selectQrCodeActionsProps, selectTablesListProps } from '../../domain/selectors';
import { useTablesController } from '../../data/useTablesController';
import { PlanLimitWarning } from '@/shared/components/PlanLimitWarning';
import { useSubscriptionController } from '@/features/settings/hooks';

export function TablesPage() {
  const controller = useTablesController();
  const { currentSubscription } = useSubscriptionController();

  const currentUsage = currentSubscription.data?.usage;
  const limits = currentSubscription.data?.limits;
  const planName = currentSubscription.data?.subscription?.plan?.name || 'Free';

  if (controller.error) {
    return (
      <div className="mx-auto flex flex-col gap-6 px-6 pt-6 pb-5" style={{ maxWidth: '1600px' }}>
        <div className="text-center py-16">
          <h3 className="text-text-primary mb-2 text-lg font-bold">Failed to load tables</h3>
          <p className="text-text-secondary text-base">
            {controller.error instanceof Error ? controller.error.message : 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }

  const headerProps = selectHeaderProps(controller);
  const listProps = selectTablesListProps(controller);
  const formModalProps = selectFormModalProps(controller);
  const qrActionsProps = selectQrCodeActionsProps(controller);

  return (
    <>
      {/* Plan Limit Warning for Tables */}
      {currentUsage && limits && limits.maxTables !== -1 && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 max-w-2xl w-full px-4">
          <PlanLimitWarning
            currentCount={currentUsage.tablesUsed || 0}
            maxAllowed={limits.maxTables}
            resourceType="tables"
            planName={planName}
            variant="inline"
          />
        </div>
      )}
      <div className="mx-auto flex flex-col gap-6 px-6 pt-6 pb-5" style={{ maxWidth: '1600px' }}>
        <TablesHeader {...headerProps} />
        <TablesList {...listProps} />
      </div>

      <TableFormModals {...formModalProps} />
      <QrCodeActions {...qrActionsProps} />

      {controller.toast.show && (
        <Toast message={controller.toast.message} type={controller.toast.type} onClose={controller.toast.onClose} />
      )}
    </>
  );
}
