import { secureRequest } from "@/lib/axios";
import { APIResponse, PerformanceGoal, PerformanceCycle, Appraisal } from "@/types/api";

/**
 * GOAL SETTING (KPI/OKR)
 */
export const getMyGoals = async () => {
  return secureRequest<APIResponse<PerformanceGoal[]>>('get', '/v1/performance/goals/me');
};

export const getUserGoals = async (userId: number) => {
  return secureRequest<APIResponse<PerformanceGoal[]>>('get', `/v1/performance/goals/user/${userId}`);
};

export const createGoal = async (payload: Partial<PerformanceGoal>) => {
  return secureRequest<APIResponse<PerformanceGoal>>('post', '/v1/performance/goals', payload);
};

export const updateGoalProgress = async (id: number, currentProgress: number) => {
  return secureRequest<APIResponse<PerformanceGoal>>('put', `/v1/performance/goals/${id}/progress`, { current_progress: currentProgress });
};

/**
 * PERFORMANCE CYCLES
 */
export const getCycles = async () => {
  return secureRequest<APIResponse<PerformanceCycle[]>>('get', '/v1/performance/cycles');
};

/**
 * APPRAISALS
 */
export const getAppraisals = async (cycleId: number) => {
  return secureRequest<APIResponse<Appraisal[]>>('get', `/v1/performance/appraisals/cycle/${cycleId}`);
};

export const submitSelfReview = async (appraisalId: number, score: number, comments: string) => {
  return secureRequest<APIResponse<Appraisal>>('put', `/v1/performance/appraisals/${appraisalId}/self-review`, { self_score: score, comments });
};
