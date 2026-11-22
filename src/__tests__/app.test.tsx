import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { sendClinicalQuery } from '../services/aiClient';
import { REAL_PARTNERS } from '../data/partners';
import { SceneProvider } from '../context/SceneContext';
import LandingPage from '../pages/LandingPage';
import MediWorkspacePage from '../pages/MediWorkspacePage';
import MadaPage from '../pages/MadaPage';
import { ContactSection } from '../components/contact/ContactSection';
import { Navbar } from '../components/layout/Navbar';
import { DemoRequestModal } from '../components/modals/DemoRequestModal';

function renderWithRouter(ui: React.ReactElement, initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <SceneProvider>
        <Navbar />
        <main>{ui}</main>
        <DemoRequestModal />
      </SceneProvider>
    </MemoryRouter>,
  );
}

describe('TechCare Data & AI Client', () => {
  it('contains exactly the 10 real TechCare partners and no fictional ones', () => {
    expect(REAL_PARTNERS).toHaveLength(10);
    const names = REAL_PARTNERS.map((p) => p.name);
    expect(names).toContain('Microsoft for Startups');
    expect(names).toContain('ISF');
    expect(names).toContain('alx Venture');
    expect(names).toContain('Orange Corners Egypt');
    expect(names).toContain('IFMSA-EGYPT');
    expect(names).toContain('Bibliotheca Alexandrina');
    expect(names).toContain('The National Alliance');
    expect(names).toContain('حياة كريمة');
    expect(names).toContain('E-Club Matrouh');
    expect(names).toContain('DYS - Ministry Of Youth And Sports');
    expect(names).not.toContain('WHO EMRO');
    expect(names).not.toContain('Flat6Labs');
    for (const partner of REAL_PARTNERS) {
      expect(partner.logoSrc).toMatch(/^\/assets\/partners\/\d+\.jpg$/);
    }
  });

  it('aiClient responds in English and Arabic in demo mode', async () => {
    const enRes = await sendClinicalQuery({
      query: 'Cross-reference MAP decay against antibiotic infusion schedule',
      context: 'medi-workspace',
    });
    expect(enRes.mode).toBe('demo');
    expect(enRes.language).toBe('en');
    expect(enRes.reply).toContain('MAP');

    const arRes = await sendClinicalQuery({
      query: 'مريض يعاني من ألم بالصدر وضيق تنفس',
      context: 'medi-workspace',
    });
    expect(arRes.mode).toBe('demo');
    expect(arRes.language).toBe('ar');
    expect(arRes.reply).toContain('Medi');
  });
});

describe('TechCare 3D Storytelling Home & Product Flows', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.add('dark');
  });

  it('LandingPage renders 7 minimal 3D chapters, removes Hero pill badge, attaches 3D stage/tilt containers, shows authentic pillars/SDGs/YouTube video, switches Medi EN/AR preview & System pills, and opens/closes PartnerModal', () => {
    renderWithRouter(<LandingPage />, '/');

    expect(screen.queryByText(/AI Healthcare Platform/i)).not.toBeInTheDocument();
    expect(document.querySelectorAll('[data-spatial-variant]').length).toBe(7);
    expect(document.querySelectorAll('[data-spatial-item]').length).toBeGreaterThanOrEqual(15);
    expect(document.querySelectorAll('[data-tilt-card="true"]').length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText(/Intelligence for/i)).toBeInTheDocument();
    expect(screen.getByText(/01 \/ Vision/i)).toBeInTheDocument();
    expect(screen.getByText(/Secure by design/i)).toBeInTheDocument();
    expect(screen.getByText(/Medical-grade UX/i)).toBeInTheDocument();
    expect(screen.getByText(/Human doctor first/i)).toBeInTheDocument();
    expect(screen.getByText(/Scalable cloud backend/i)).toBeInTheDocument();
    expect(screen.getByText(/02 \/ About Tech Care/i)).toBeInTheDocument();
    expect(screen.getByText(/UN SDGs 3 · 9 · 17/i)).toBeInTheDocument();
    expect(screen.getByText(/Goal 3/i)).toBeInTheDocument();

    const videoFrame = screen.getByTitle('Tech Care Company Video');
    expect(videoFrame.tagName).toBe('IFRAME');
    expect(videoFrame.getAttribute('src')).toContain('youtube.com/embed/ASfrHSx1WSY');

    // Confirm temporary Hero sculpture preview switcher is removed
    expect(
      screen.queryByRole('tablist', { name: 'Hero 3D Sculpture Preview' }),
    ).not.toBeInTheDocument();

    // Switch Medi bilingual preview
    fireEvent.click(screen.getByRole('button', { name: 'حالة بالعربي' }));
    expect(screen.getByText(/ملخص التقييم السريري المبدئي/i)).toBeInTheDocument();

    // Switch clinical infrastructure pills
    fireEvent.click(screen.getByRole('button', { name: 'Digital Twin' }));
    expect(screen.getByText(/Continuous patient and ward physiological baseline model/i)).toBeInTheDocument();

    // Partner Modal on real partner
    const hayatCards = screen.getAllByText('حياة كريمة');
    fireEvent.click(hayatCards[0].closest('button')!);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Verified Ecosystem Supporter')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByLabelText('Close partner details modal'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('MediWorkspacePage renders empty state, sends Arabic query, and renders RTL Arabic response', async () => {
    renderWithRouter(<MediWorkspacePage />, '/medi');

    expect(screen.getByText('Start a clinical case')).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/Enter symptoms, vitals/i);
    fireEvent.change(textarea, { target: { value: 'مريض يعاني من صداع شديد وارتفاع الضغط' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send clinical case' }));

    await waitFor(() => {
      expect(screen.getByText(/ملخص التقييم السريري المبدئي/i)).toBeInTheDocument();
    });
  });

  it('ContactSection validates and submits contact form with confirmation receipt', async () => {
    renderWithRouter(<ContactSection />, '/');

    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Ahmed' } });
    fireEvent.change(screen.getByPlaceholderText('doctor@clinic.org'), { target: { value: 'ahmed@clinic.eg' } });
    fireEvent.change(screen.getByPlaceholderText(/Tell us about your clinic/i), {
      target: { value: 'Interested in piloting Medi in our Alexandria clinic.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));

    await waitFor(() => {
      expect(screen.getByText('Message Logged')).toBeInTheDocument();
      expect(screen.getByText(/Reference: TC-/i)).toBeInTheDocument();
    });
  });

  it('Navbar has minimal links, toggles Dark/Light theme, and opens DemoRequestModal', () => {
    renderWithRouter(
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/mada" element={<MadaPage />} />
      </Routes>,
      '/',
    );

    expect(screen.getByRole('link', { name: 'Vision' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About Us' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Medi' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mada' })).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Switch to light mode'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    fireEvent.click(screen.getAllByRole('button', { name: 'Request Demo' })[0]);
    expect(screen.getByText('Request a Clinical Demo')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Close demo request modal'));
    expect(screen.queryByText('Request a Clinical Demo')).not.toBeInTheDocument();
  });
});
