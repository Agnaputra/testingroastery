import { permanentRedirect } from 'next/navigation';

export default function BackgroundPage() {
  permanentRedirect('/about#behind');
}
