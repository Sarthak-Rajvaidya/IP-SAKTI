import type { Language } from '../types';

// Minimal, frontend-only mock translation layer. Structured so that a real
// Bhashini/translation API integration can later replace `t()` without
// touching call sites.
export const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.assistant': 'Ask IP-SAKTI',
    'nav.classify': 'Classify',
    'nav.ipExplorer': 'IP Explorer',
    'nav.abs': 'ABS Advisor',
    'nav.knowledge': 'Knowledge',
    'nav.sources': 'Sources',
    'nav.history': 'Query History',
    'nav.settings': 'Settings',
    'tagline': "Protecting Ayurveda's Knowledge. Powering Ayurveda's Innovation.",
    'hero.title': 'Your AI Sahayak for Ayurveda IP & Regulation',
    'disclaimer': 'IP-SAKTI provides AI-assisted informational guidance and does not constitute legal advice. Verify critical decisions with a qualified IP/legal professional.',
  },
  hi: {
    'nav.dashboard': 'डैशबोर्ड',
    'nav.assistant': 'IP-SAKTI से पूछें',
    'nav.classify': 'वर्गीकरण करें',
    'nav.ipExplorer': 'IP एक्सप्लोरर',
    'nav.abs': 'ABS सलाहकार',
    'nav.knowledge': 'ज्ञान कोष',
    'nav.sources': 'स्रोत',
    'nav.history': 'प्रश्न इतिहास',
    'nav.settings': 'सेटिंग्स',
    'tagline': 'आयुर्वेद के ज्ञान की सुरक्षा। आयुर्वेद के नवाचार को शक्ति।',
    'hero.title': 'आयुर्वेद IP और विनियमन के लिए आपका AI सहायक',
    'disclaimer': 'IP-SAKTI केवल AI-सहायित सूचनात्मक मार्गदर्शन प्रदान करता है और यह कानूनी सलाह नहीं है। महत्वपूर्ण निर्णयों के लिए योग्य IP/कानूनी विशेषज्ञ से परामर्श लें।',
  },
  mr: {
    'nav.dashboard': 'डॅशबोर्ड',
    'nav.assistant': 'IP-SAKTI ला विचारा',
    'nav.classify': 'वर्गीकरण करा',
    'nav.ipExplorer': 'IP एक्सप्लोरर',
    'nav.abs': 'ABS सल्लागार',
    'nav.knowledge': 'ज्ञानकोश',
    'nav.sources': 'स्रोत',
    'nav.history': 'प्रश्न इतिहास',
    'nav.settings': 'सेटिंग्ज',
    'tagline': 'आयुर्वेदाच्या ज्ञानाचे रक्षण. आयुर्वेदाच्या नवोपक्रमाला बळ.',
    'hero.title': 'आयुर्वेद IP आणि नियमनासाठी तुमचा AI सहायक',
    'disclaimer': 'IP-SAKTI केवळ AI-सहाय्यित माहितीपर मार्गदर्शन देते आणि ती कायदेशीर सल्ला नाही. महत्त्वाच्या निर्णयांसाठी पात्र IP/कायदेतज्ज्ञांचा सल्ला घ्या.',
  },
};

export function t(key: string, lang: Language): string {
  return translations[lang]?.[key] ?? translations.en[key] ?? key;
}

export const languageLabels: Record<Language, string> = {
  en: 'English',
  hi: 'हिन्दी',
  mr: 'मराठी',
};
