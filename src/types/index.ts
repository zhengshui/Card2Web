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

export interface OCRResult {
  text: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}