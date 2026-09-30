// ======================================================
// src/services/content/content.types.ts
// ======================================================

export interface ApiResponse<T> {
  status: boolean | number;
  message: string;
  data: T;
}

// ======================================================
// COMMON STRUCTURES
// ======================================================

export interface CTA {
  label: string;
  url: string;
}

export interface ValueItem {
  title: string;
  description: string;
}

export interface SubSection {
  heading: string;
  content: string[];
  points?: string[];
  steps?: string[];

  extra_content?: string[];
  extra_points?: string[];
}

export interface ContentSection {
  heading: string;

  content: string[];

  points?: string[];

  steps?: string[];

  sub_sections?: SubSection[];

  extra_content?: string[];

  extra_points?: string[];

  footer_content?: string[];
}

// ======================================================
// TERMS / SHIPPING / REFUND
// ======================================================

export interface PolicyData {
  title: string;
  intro: string[];
  sections: ContentSection[];
}

// ======================================================
// ABOUT US
// ======================================================

export interface AboutSection {
  title: string;
  description: string[];
}

export interface ValuesSection {
  title: string;
  values: ValueItem[];
}

export interface WelcomeSection {
  title: string;
  description: string[];
  cta: CTA;
}

export interface AboutUsData {
  title: string;
  subtitle: string;
  image: string;

  welcome_section: WelcomeSection;

  mission_section: AboutSection;

  offer_section: AboutSection;

  values_section: ValuesSection;
}

// ======================================================
// FINAL RESPONSES
// ======================================================

export type TermsResponse = ApiResponse<PolicyData>;

export type ShippingResponse = ApiResponse<PolicyData>;

export type RefundResponse = ApiResponse<PolicyData>;

export type AboutUsResponse = ApiResponse<AboutUsData>;

// ======================================================
// PRIVACY POLICY
// ======================================================

export interface PrivacyPolicyData {
  title: string;
  effective_date: string;
  intro: string[];
  sections: ContentSection[];
}

export type PrivacyPolicyResponse = ApiResponse<PrivacyPolicyData>;

// ======================================================
// FAQ
// ======================================================

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export interface FaqCategory {
  category_name: string;
  faqs: FaqItem[];
}

export interface FaqContactUs {
  title: string;
  description: string;
  company_name: string;
  email: string;
  phone: string;
  address: string;
  note: string;
}

export interface FaqData {
  title: string;
  faq: FaqCategory[];
  contact_us?: FaqContactUs;
}

export type FaqResponse = ApiResponse<FaqData>;
