import { definePlugin } from 'sanity';
import type { DocumentActionComponent } from 'sanity';

const runProposalAction = async (
    proposalId: string,
    action: 'accept' | 'reject',
) => {
    const response = await fetch('/api/item-update-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId, action }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || 'Proposal action failed');
    }
    return data;
};

export const AcceptItemUpdateProposalAction: DocumentActionComponent = (props) => {
    const doc = props.draft || props.published;
    if (!doc || doc.status !== 'pending') return null;

    return {
        label: 'Accept update proposal',
        icon: () => '✅',
        onHandle: async () => {
            try {
                await runProposalAction(doc._id, 'accept');
                window.alert('Update proposal accepted.');
            } catch (error) {
                window.alert(error instanceof Error ? error.message : 'Failed to accept proposal.');
            } finally {
                props.onComplete();
            }
        },
    };
};

export const RejectItemUpdateProposalAction: DocumentActionComponent = (props) => {
    const doc = props.draft || props.published;
    if (!doc || doc.status !== 'pending') return null;

    return {
        label: 'Reject update proposal',
        icon: () => '❌',
        onHandle: async () => {
            try {
                await runProposalAction(doc._id, 'reject');
                window.alert('Update proposal rejected.');
            } catch (error) {
                window.alert(error instanceof Error ? error.message : 'Failed to reject proposal.');
            } finally {
                props.onComplete();
            }
        },
    };
};

export const SendNotificationEmailAction: DocumentActionComponent = (props) => {
    return {
        label: 'Send notification email',
        icon: () => '📤',
        onHandle: async () => {
            const { published, draft } = props;
            const doc = (draft || published);
            if (!doc) {
                console.error('SendNotificationEmailAction, no document found');
                return;
            }

            try {
                const response = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        itemId: doc._id
                    })
                });

                if (!response.ok) {
                    console.error('SendNotificationEmailAction, failed to send email');
                    throw new Error('Failed to send email');
                }

                // Show success message
                console.log('SendNotificationEmailAction, email sent successfully');
                const data = await response.json();
                window.alert(data.message);
            } catch (error) {
                console.error('Error sending notification email:', error);
                window.alert('Failed to send notification email. Please try again.');
            }
        },
    }
}

export const customDocumentActionsPlugin = definePlugin({
    name: 'custom-document-actions',
    document: {
        actions: (prev, context) => {
            if (context.schemaType === 'item') {
                return [...prev, SendNotificationEmailAction]
            }
            if (context.schemaType === 'itemUpdateProposal') {
                return [
                    ...prev,
                    AcceptItemUpdateProposalAction,
                    RejectItemUpdateProposalAction,
                ]
            }
            return prev
        }
    }
})
