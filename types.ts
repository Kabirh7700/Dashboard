
export interface TaskData {
  taskId: string;
  task: string;
  stepCode: string;
  plannedDate: string;
  actualDate: string;
  formLink: string;
  systemType: string;
  status: string;
  doerName: string;
  emailId: string;
  doerImageUrl?: string; // Re-added: URL will come from main sheet
}

export interface Doer {
  email: string;
  name: string;
  imageUrl: string;
}

interface MISMetric {
  base: number;
  met: number;
  performance: number; // This is a failure rate
}

export interface MISStats {
  planVsActual: MISMetric;
  onTime: MISMetric;
  startDate: Date;
  endDate: Date;
}

export interface RawWeeklyAttendance {
    presentDays: number;
    doerName: string;
}

export interface AttendanceStats {
    totalWorkingDays: number;
    presentDays: number;
    attendancePercentage: number;
    startDate?: Date;
    endDate?: Date;
}

export interface HistoricalDataPoint {
  period: string;
  completionRate: number;
  onTimeRate: number;
}

export interface TeamPerformanceSummary {
    needsAttention: Doer[];
    onTrack: Doer[];
}