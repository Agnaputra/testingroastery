import { EventForm } from '../../../../components/events/event-form';

export default function ManageEventPage({ params }: { params: { id: string } }) { return <main className="page-shell nav-offset min-h-screen bg-surface-bright"><EventForm eventId={params.id} /></main>; }
