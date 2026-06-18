import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import NearbyRadarClient from '@/components/nearby/NearbyRadarClient';

export const metadata = {
  title: 'Nearby Scanner | Rafiki',
  description: 'Find businesses within 20km of your location',
};

export default function NearbyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7f5f3] dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 rafiki-nav-offset">
        <NearbyRadarClient />
      </main>
      <Footer />
    </div>
  );
}
