export interface BusinessCard {
  companyName: string;
  logo?: string;
  contacts: {
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  };
  primaryColor?: string;
  style?: 'business' | 'tech' | 'minimal';
}

export interface GeneratedWebsite {
  html: string;
  css: string;
  preview: string;
}

