import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { connectSocket, disconnectSocket } from '@/lib/socketClient';
import { useSessionStore } from '@/stores/sessionStore';
import { useUIStore } from '@/stores/uiStore';

export function useRealtimeEvents() {
  const queryClient = useQueryClient();
  const { user, organizationId, isAuthenticated } = useSessionStore();
  const { addToast } = useUIStore();

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(organizationId, user?.id);

    const handleDealStageChanged = (payload: { dealId: string; newStage: string; value: number }) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      addToast({
        type: 'info',
        title: 'Deal Pipeline Updated',
        message: `Deal moved to ${payload.newStage} ($${payload.value?.toLocaleString() || ''})`,
      });
    };

    const handleDealWon = (payload: { dealId: string; value: number }) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      addToast({
        type: 'success',
        title: '🎉 Deal Closed Won!',
        message: `Revenue of $${payload.value?.toLocaleString() || '0'} added to workspace pipeline.`,
      });
    };

    const handleLeadUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    };

    const handleCallCompleted = () => {
      queryClient.invalidateQueries({ queryKey: ['calls'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    };

    const handleInvoicePaid = (payload: { invoiceId: string; amount: number }) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      addToast({
        type: 'success',
        title: '💰 Payment Settled',
        message: `Invoice payment for $${payload.amount?.toLocaleString() || ''} recorded.`,
      });
    };

    const handleTaskCreated = () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    };

    socket.on('deal:stage_changed', handleDealStageChanged);
    socket.on('deal:won', handleDealWon);
    socket.on('lead:created', handleLeadUpdated);
    socket.on('lead:score_updated', handleLeadUpdated);
    socket.on('call:completed', handleCallCompleted);
    socket.on('payment:received', handleInvoicePaid);
    socket.on('task:created', handleTaskCreated);

    return () => {
      socket.off('deal:stage_changed', handleDealStageChanged);
      socket.off('deal:won', handleDealWon);
      socket.off('lead:created', handleLeadUpdated);
      socket.off('lead:score_updated', handleLeadUpdated);
      socket.off('call:completed', handleCallCompleted);
      socket.off('payment:received', handleInvoicePaid);
      socket.off('task:created', handleTaskCreated);
    };
  }, [isAuthenticated, organizationId, user?.id, queryClient, addToast]);
}
