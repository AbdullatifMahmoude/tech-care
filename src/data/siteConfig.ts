export const SITE_CONFIG = {
  brandName: 'TechCare',
  brandDisplay: 'Tech Care',
  pageTitle: 'TechCare | AI-Powered Healthcare Technology Solutions',
  tagline: 'Smarter tools for modern clinics and medical teams.',
  footerTagline:
    'Empowering healthcare with technology, clarity, and compassion. Premium digital tools for smarter medical teams.',
  heroSubheadline:
    'Tech Care builds secure, smart, and elegant healthcare experiences that help medical teams operate faster without replacing the human role of doctors.',
  privacyNote: 'Assists doctors only — no patient data is stored; sessions stay local.',
  companyVideo: {
    embedUrl: 'https://www.youtube.com/embed/ASfrHSx1WSY?rel=0&modestbranding=1',
    watchUrl: 'https://www.youtube.com/watch?v=ASfrHSx1WSY',
    title: 'Tech Care Company Video',
  },
  partnersSubtitle:
    'Our ecosystem is backed by partners and programs that believe in modern healthcare innovation.',
  contactSubtitle:
    'Send your request and our team will contact you to understand your clinic, idea, or partnership needs.',
  madaNotice: {
    badge: 'Coming Soon · Early Access',
    heading: 'Mada is coming soon',
    description: 'We are preparing something smart and useful for you. Stay tuned.',
  },
  copyright: '© 2026 Tech Care. All rights reserved.',
  location: 'Smouha, Alexandria, Egypt',
  shortLocation: 'Alexandria, Egypt',
  email: 'info@tech-care.tech',
  phone: '+20 155 330 8298',
  phoneHref: 'tel:+201553308298',
  whatsappHref: 'https://wa.me/201553308298',
  socials: [
    {
      id: 'facebook',
      label: 'Facebook',
      href: 'https://www.facebook.com/p/Tech-Care-61567769755725/',
    },
    {
      id: 'instagram',
      label: 'Instagram',
      href: 'https://www.instagram.com/tech_caree/',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/company/ai-powered-healthcare-solutions/',
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      href: 'https://wa.me/201553308298',
    },
  ],
  corePillars: [
    { index: '01', title: 'Secure by design' },
    { index: '02', title: 'Medical-grade UX' },
    { index: '03', title: 'Human doctor first' },
    { index: '04', title: 'Scalable cloud backend' },
  ],
  aboutPoints: [
    'Tech Care is an AI-powered healthtech startup revolutionizing how clinics and healthcare institutions operate and diagnose.',
    'We provide smart, sustainable, and secure solutions tailored for doctors, clinics, and medical organizations.',
    'We empower the healthcare sector to be smarter, more efficient, and more sustainable one clinic at a time.',
  ],
  sdgs: [
    {
      goal: 'Goal 3',
      title: 'Good Health and Well-being',
    },
    {
      goal: 'Goal 9',
      title: 'Industry, Innovation, and Infrastructure',
    },
    {
      goal: 'Goal 17',
      title: 'Partnerships for the Goals',
    },
  ],
  newsletterCopy: {
    eyebrow: 'Newsletter',
    heading: 'Join the Tech Care community.',
    description: 'Subscribe for healthtech insights, AI updates, and medical innovation news.',
  },
} as const;

export const NAV_LINKS = [
  { path: '/', label: 'Home', isHash: false },
  { path: '/#about', label: 'About Us', isHash: true },
  { path: '/medi', label: 'Medi', isHash: false },
  { path: '/mada', label: 'Mada', isHash: false },
  { path: '/#partners', label: 'Partners', isHash: true },
  { path: '/#contact', label: 'Contact', isHash: true },
] as const;
