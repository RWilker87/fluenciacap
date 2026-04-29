export interface Evaluation {
  id: string;
  student_id: string;
  evaluator_id: string;
  words_read: number;
  errors: number;
  words_per_minute: number;
  accuracy: number;
  observations: string | null;
  created_at: string;
}

export interface CreateEvaluationPayload {
  student_id: string;
  evaluator_id: string;
  words_read: number;
  errors: number;
  words_per_minute: number;
  accuracy: number;
  observations?: string;
}
