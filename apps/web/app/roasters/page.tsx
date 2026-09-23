import { permanentRedirect } from 'next/navigation';

export default function RoastersPage() {
  permanentRedirect('/about#roastery-journey');
}
