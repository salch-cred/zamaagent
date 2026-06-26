import { Navbar }           from '@/components/landing/Navbar'
import { Hero }             from '@/components/landing/Hero'
import { DashboardPreview } from '@/components/landing/DashboardPreview'
import { Features }         from '@/components/landing/Features'
import { Guides }           from '@/components/landing/Guides'
import { HowItWorks }       from '@/components/landing/HowItWorks'
import { Marquee }          from '@/components/landing/Marquee'
import { CtaSection }       from '@/components/landing/CtaSection'
import { Footer }           from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <main className="bg-[#09090B] min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <DashboardPreview />
      <Features />
      <Guides />
      <HowItWorks />
      <Marquee />
      <CtaSection />
      <Footer />
    </main>
  )
}
