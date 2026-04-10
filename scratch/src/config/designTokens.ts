import { BusinessCategory } from '../store/AppContext';

export interface ThemeTokens {
  fontFamily: string;
  colors: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    accent: string;
    cardPrimary: string;
    cardSecondary: string;
    backgroundBase: string;
    textBase: string;
    textMuted: string;
  };
}

export const DESIGN_TOKENS: Record<BusinessCategory, ThemeTokens> = {
  men_salon: {
    fontFamily: 'var(--font-space)', // edgy, structural
    colors: {
      primary: '#00F0FF', // Cyberpunk Neon Cyan
      primaryDark: '#008B99',
      primaryLight: '#80F8FF',
      accent: '#FF003C', // Cyberpunk Red
      cardPrimary: '#0A0A0F',
      cardSecondary: '#12121A',
      backgroundBase: '#050508',
      textBase: '#FFFFFF',
      textMuted: '#888899',
    }
  },
  beauty_parlour: {
    fontFamily: 'var(--font-playfair)', // Elegant serif
    colors: {
      primary: '#FF4785', // Vibrant Pink
      primaryDark: '#B32B5B',
      primaryLight: '#FF8BB0',
      accent: '#FFCDA3', // Soft Peach
      cardPrimary: '#FFFFFF',
      cardSecondary: '#FDF2F8',
      backgroundBase: '#FFF5F8',
      textBase: '#2A101C',
      textMuted: '#A3708A',
    }
  },
  unisex_salon: {
    fontFamily: 'var(--font-outfit)', // Modern & clean
    colors: {
      primary: '#8A2BE2', // Blue Violet
      primaryDark: '#5E10A8',
      primaryLight: '#B87DF2',
      accent: '#00FA9A', // Medium Spring Green
      cardPrimary: '#140D1F',
      cardSecondary: '#201630',
      backgroundBase: '#0D0814',
      textBase: '#F0E6FF',
      textMuted: '#8E7CA6',
    }
  },
  restaurant: {
    fontFamily: 'var(--font-playfair)', // Appetizing & classic
    colors: {
      primary: '#D32F2F', // Food Red
      primaryDark: '#9A0007',
      primaryLight: '#FF6659',
      accent: '#FBC02D', // Mustard Yellow
      cardPrimary: '#FFFFFF',
      cardSecondary: '#FFF8E1',
      backgroundBase: '#FAFAFA',
      textBase: '#263238',
      textMuted: '#78909C',
    }
  },
  cafe: {
    fontFamily: 'var(--font-poppins)', // Friendly & warm
    colors: {
      primary: '#5D4037', // Coffee Brown
      primaryDark: '#321911',
      primaryLight: '#8B6B61',
      accent: '#FFB300', // Warm Amber
      cardPrimary: '#FEFAF6',
      cardSecondary: '#F4EAE6',
      backgroundBase: '#FDF8F5',
      textBase: '#3E2723',
      textMuted: '#8D6E63',
    }
  },
  clinic: {
    fontFamily: 'var(--font-inter)', // Clean, medical, legible
    colors: {
      primary: '#00B4D8', // Clean medical blue
      primaryDark: '#0077B6',
      primaryLight: '#90E0EF',
      accent: '#00B4D8', 
      cardPrimary: '#FFFFFF',
      cardSecondary: '#F8FDFF',
      backgroundBase: '#F0FBFF',
      textBase: '#023E8A',
      textMuted: '#48CAE4',
    }
  },
  hospital: {
    fontFamily: 'var(--font-inter)', // Clinical & highly legible
    colors: {
      primary: '#023E8A', // Trust Blue
      primaryDark: '#03045E',
      primaryLight: '#0077B6',
      accent: '#00B4D8',
      cardPrimary: '#FFFFFF',
      cardSecondary: '#F1FAEE',
      backgroundBase: '#EBF4F6',
      textBase: '#1D3557',
      textMuted: '#457B9D',
    }
  },
  gym: {
    fontFamily: 'var(--font-space)', // Aggressive, structural
    colors: {
      primary: '#FF0000', // Pure aggressive red
      primaryDark: '#990000',
      primaryLight: '#FF6666',
      accent: '#000000', 
      cardPrimary: '#111111',
      cardSecondary: '#1C1C1C',
      backgroundBase: '#050505',
      textBase: '#FFFFFF',
      textMuted: '#666666',
    }
  },
  spa: {
    fontFamily: 'var(--font-poppins)', // Zen, smooth
    colors: {
      primary: '#9D4EDD', // Lavender purple
      primaryDark: '#5A189A',
      primaryLight: '#C77DFF',
      accent: '#E0AAFF',
      cardPrimary: '#FFFFFF',
      cardSecondary: '#FAF5FF',
      backgroundBase: '#FDFBF7',
      textBase: '#240046',
      textMuted: '#7B2CBF',
    }
  },
  coaching: {
    fontFamily: 'var(--font-dm)', // Academic, modern
    colors: {
      primary: '#3F51B5', // Academic Indigo
      primaryDark: '#1A237E',
      primaryLight: '#7986CB',
      accent: '#FFC107', // Highlight yellow
      cardPrimary: '#FFFFFF',
      cardSecondary: '#F8F9FA',
      backgroundBase: '#F4F6F8',
      textBase: '#1A202C',
      textMuted: '#718096',
    }
  },
  pet_care: {
    fontFamily: 'var(--font-outfit)', // Playful
    colors: {
      primary: '#4CAF50', // Nature Green
      primaryDark: '#2E7D32',
      primaryLight: '#81C784',
      accent: '#FF9800', // Orange
      cardPrimary: '#FFFFFF',
      cardSecondary: '#F1F8E9',
      backgroundBase: '#F9FBE7',
      textBase: '#1B5E20',
      textMuted: '#689F38',
    }
  },
  law_firm: {
    fontFamily: 'var(--font-playfair)', // Authoritative Serif
    colors: {
      primary: '#1A1A1A', // Charcoal Black
      primaryDark: '#000000',
      primaryLight: '#4A4A4A',
      accent: '#B8860B', // Gold
      cardPrimary: '#FFFFFF',
      cardSecondary: '#F5F5F5',
      backgroundBase: '#EEEEEE',
      textBase: '#111111',
      textMuted: '#777777',
    }
  },
  photography: {
    fontFamily: 'var(--font-space)', // Visual, minimalist
    colors: {
      primary: '#000000', // Monochromatic core
      primaryDark: '#000000',
      primaryLight: '#333333',
      accent: '#FF00FF', // Magenta highlight
      cardPrimary: '#111111',
      cardSecondary: '#1E1E1E',
      backgroundBase: '#0A0A0A',
      textBase: '#FFFFFF',
      textMuted: '#A0A0A0',
    }
  },
  repair_shop: {
    fontFamily: 'var(--font-dm)', // Industrial
    colors: {
      primary: '#E65100', // Safety Orange
      primaryDark: '#BF360C',
      primaryLight: '#FF9800',
      accent: '#FFD600',
      cardPrimary: '#FFFFFF',
      cardSecondary: '#FFF3E0',
      backgroundBase: '#FFF8E1',
      textBase: '#3E2723',
      textMuted: '#8D6E63',
    }
  },
  laundry: {
    fontFamily: 'var(--font-outfit)', // Clean & modern
    colors: {
      primary: '#00E5FF', // Fresh Cyan
      primaryDark: '#00B8D4',
      primaryLight: '#84FFFF',
      accent: '#18FFFF',
      cardPrimary: '#FFFFFF',
      cardSecondary: '#E0F7FA',
      backgroundBase: '#E0F2F1',
      textBase: '#004D40',
      textMuted: '#00796B',
    }
  },
  other: {
    fontFamily: 'var(--font-sans)', // Fallback
    colors: {
      primary: '#6C63FF',
      primaryDark: '#5A52D5',
      primaryLight: '#8B85FF',
      accent: '#4ECDC4',
      cardPrimary: '#151528',
      cardSecondary: '#1E1E3A',
      backgroundBase: '#0A0A1A',
      textBase: '#EAEAEA',
      textMuted: '#8888AA',
    }
  }
};
