export type Jurisdiction = 'india' | 'international';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface Source {
  id: string;
  title: string;
  subTitle?: string;
  jurisdiction: Jurisdiction;
  documentType: string;
  authority: string;
  lastUpdated: string;
  status: 'verified' | 'review' | 'international';
  url: string;
  isMock?: boolean;
}

export interface RelevantConsideration {
  label: string;
  signal: 'green' | 'amber' | 'blue';
}

export interface WhyThisAnswer {
  retrievedSourceCount: number;
  relevantProvisions: string[];
  knowledgeAreas: string[];
  jurisdiction: Jurisdiction;
}

export interface AssistantResponse {
  id: string;
  productContext: string;
  jurisdiction: Jurisdiction;
  assessment: string;
  considerations: RelevantConsideration[];
  sources: Source[];
  confidence: number; // 0-100
  confidenceLevel: ConfidenceLevel;
  whyThisAnswer: WhyThisAnswer;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  response?: AssistantResponse;
  timestamp: string;
}

export interface ProductContext {
  productType: string;
  productName: string;
  ingredients: string;
  intendedUse: string;
  targetMarket: string;
  innovationStatus: string;
}

export interface ClassificationAnswer {
  step: number;
  question: string;
  answer: string;
}

export interface ClassificationResult {
  label: string;
  confidence: number;
  reasons: string[];
  nextSteps: string[];
}

export interface IPCategory {
  id: string;
  name: string;
  icon: string;
  protects: string;
  whenApplies: string;
  eligibility: string[];
  considerations: string[];
  relatedSourceIds: string[];
}

export interface ABSResult {
  status: 'review-recommended' | 'likely-required' | 'likely-exempt';
  headline: string;
  reasoning: string;
  nextSteps: string[];
}

export interface KnowledgeNode {
  id: string;
  label: string;
  category: 'concept' | 'law' | 'patent' | 'regulatory' | 'abs' | 'tk';
  description: string;
}

export interface KnowledgeEdge {
  from: string;
  to: string;
  relation: string;
}

export interface HistoryItem {
  id: string;
  query: string;
  jurisdiction: Jurisdiction;
  confidenceLevel: ConfidenceLevel;
  date: string;
}

export interface PipelineStage {
  id: string;
  label: string;
  description: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
}

export type Language = 'en' | 'hi' | 'mr';
