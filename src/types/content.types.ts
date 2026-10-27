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

export interface AboutCta {
  label: string;
  url: string;
}

export interface WelcomeSection {
  title: string;
  heading?: string;
  description: string[];
  highlight?: string;
  cta?: AboutCta;
}

export interface WhoWeAreSection {
  title: string;
  description: string[];
  image?: string;
}

export interface MissionSection {
  title: string;
  description: string[];
}

export interface VisionSection {
  title: string;
  description: string[];
}

export interface OfferCategory {
  title: string;
  description: string;
}

export interface OfferSection {
  title: string;
  description: string[];
  categories?: OfferCategory[];
}

export interface ValuesSection {
  title: string;
  description?: string[];
  image?: string;
  values: ValueItem[];
}

export interface CustomerItem {
  title: string;
  description: string;
}

export interface CustomersSection {
  title: string;
  description: string[];
  customers: CustomerItem[];
}

export interface ResponsiblePestManagementSection {
  title: string;
  description: string[];
}

export interface MarketplaceSection {
  title: string;
  description: string[];
  image?: string;
}

export interface AboutFaqQuestion {
  question: string;
  answer: string;
}

export interface AboutFaqSection {
  title: string;
  description?: string[];
  questions: AboutFaqQuestion[];
}

export interface AboutCtaButton {
  label: string;
  url: string;
}

export interface AboutCtaSection {
  title: string;
  description: string[];
  buttons: AboutCtaButton[];
}

export interface FulfillmentCentersSection {
  title: string;
  heading?: string;
  api_url?: string;
}

export interface AboutUsData {
  title: string;
  subtitle: string;
  image?: string;

  welcome_section?: WelcomeSection;
  who_we_are_section?: WhoWeAreSection;
  mission_section?: MissionSection;
  vision_section?: VisionSection;
  offer_section?: OfferSection;
  values_section?: ValuesSection;
  customers_section?: CustomersSection;
  responsible_pest_management_section?: ResponsiblePestManagementSection;
  marketplace_section?: MarketplaceSection;
  faq_section?: AboutFaqSection;
  cta_section?: AboutCtaSection;
  fulfillment_centers_section?: FulfillmentCentersSection;
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
