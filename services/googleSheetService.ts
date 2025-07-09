
import { GOOGLE_SHEET_URL, GOOGLE_SHEET_ATTENDANCE_URL } from '../constants.ts';
import { TaskData, RawWeeklyAttendance } from '../types.ts';

// Helper to safely get cell value
const getCellValue = (cell: any): string => {
  if (!cell) return '';
  // 'f' is formatted value, 'v' is the raw value. Prioritize 'f'.
  return cell.f || cell.v?.toString() || '';
};

export const fetchTasks = async (): Promise<TaskData[]> => {
  try {
    const response = await fetch(GOOGLE_SHEET_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const responseText = await response.text();
    
    const jsonString = responseText.substring(responseText.indexOf('{'), responseText.lastIndexOf('}') + 1);
    const parsedData = JSON.parse(jsonString);

    if (parsedData.status !== 'ok') {
        throw new Error('Google Sheets API returned an error status for Tasks.');
    }

    const rows = parsedData.table.rows;
    const tasks = rows.slice(1).map((row: any): TaskData | null => {
      if (!row || !row.c) return null;
      const cells = row.c;
      return {
        // Mapping based on user-requested columns B, C, D, E, F, H, J, N, O, P, Q
        // B=1, C=2, D=3, E=4, F=5, H=7, J=9, N=13, O=14, P=15, Q=16
        taskId: getCellValue(cells[1]),      // Column B: Task Id of Text
        task: getCellValue(cells[2]),        // Column C: Task
        stepCode: getCellValue(cells[3]),    // Column D: Step Code
        plannedDate: getCellValue(cells[4]), // Column E: Planned
        actualDate: getCellValue(cells[5]),  // Column F: Actual
        formLink: getCellValue(cells[7]),    // Column H: Link
        systemType: getCellValue(cells[9]),  // Column J: System Type
        status: getCellValue(cells[13]),     // Column N: Status
        doerName: getCellValue(cells[14]),   // Column O: Final User Name
        emailId: getCellValue(cells[15]),    // Column P: Email id
        doerImageUrl: getCellValue(cells[16]),// Column Q: Doer Image URL
      };
    });

    return tasks
        .filter((task): task is TaskData => task !== null)
        .filter(task => task.taskId || task.task);
  } catch (error) {
    console.error('Failed to fetch or parse sheet data:', error);
    throw new Error('Could not retrieve task data from Google Sheets. Please check the sheet URL and permissions.');
  }
};

export const fetchAttendanceData = async (): Promise<RawWeeklyAttendance[]> => {
    try {
        const response = await fetch(GOOGLE_SHEET_ATTENDANCE_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseText = await response.text();

        const jsonString = responseText.substring(responseText.indexOf('{'), responseText.lastIndexOf('}') + 1);
        const parsedData = JSON.parse(jsonString);

        if (parsedData.status !== 'ok') {
            throw new Error('Google Sheets API returned an error status for Attendance.');
        }

        const rows = parsedData.table.rows;
        // Col J: Count, Col K: Name. Range starts at J4, so J is col 0, K is col 1.
        const attendance = rows.map((row: any): RawWeeklyAttendance | null => {
            if (!row || !row.c || !row.c[0] || !row.c[1]) return null;
            const cells = row.c;
            
            const presentDaysStr = getCellValue(cells[0]); // Col J
            const doerName = getCellValue(cells[1]);       // Col K

            if (!doerName || presentDaysStr === '') {
                return null;
            }

            const presentDays = parseFloat(presentDaysStr);
            if (isNaN(presentDays)) {
                return null;
            }

            return {
                doerName,
                presentDays,
            };
        });

        return attendance.filter((rec): rec is RawWeeklyAttendance => rec !== null);

    } catch (error) {
        console.error('Failed to fetch or parse attendance data:', error);
        throw new Error('Could not retrieve attendance data from Google Sheets.');
    }
};