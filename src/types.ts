export interface BurnoutAssessment {
  sleepQuality: number; // 1-10
  stressLevel: number; // 1-10
  hoursWorked: number;
  answers: number[]; // 5 questions, values 0-3
  riskLevel: "Low" | "Medium" | "High";
  riskScore: number;
  insights: string[];
  advice: string;
  timestamp: string;
}

export interface MotivationState {
  quote: string;
  author: string;
  challenge: string;
  loading: boolean;
}

export interface LocalUserState {
  uid: string;
  email: string | null;
  displayName: string | null;
  isGuest: boolean;
  streak: number;
  gardenGrowth: number;
  gardenLevel: number;
}
