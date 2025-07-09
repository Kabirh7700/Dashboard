
const SHEET_ID = '1pAWCNBHDseELyN6u0DCutvgpFLXjmSk5hJd4PgNcurY';
const SHEET_NAME = 'Master';
const SHEET_RANGE = 'A1:Q'; // Range updated to include Image URL in Column Q

export const GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}&range=${SHEET_RANGE}`;

const ATTENDANCE_SHEET_ID = '1ZpXD3uA8Xd6PIIFoHcxT8PxQ2LzY2P1sifc6kQKeNgE';
const ATTENDANCE_SHEET_NAME = 'Sheet3';
const ATTENDANCE_SHEET_RANGE = 'J4:K'; // J: Count, K: Name

export const GOOGLE_SHEET_ATTENDANCE_URL = `https://docs.google.com/spreadsheets/d/${ATTENDANCE_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${ATTENDANCE_SHEET_NAME}&range=${ATTENDANCE_SHEET_RANGE}`;

export const BOSS_EMAIL = 'boss@bonhoeffer.com';

export const ADMIN_EMAILS = ['mis1@bonhoeffermachines.in', 'mis@bonhoeffermachines.in', BOSS_EMAIL]; // Admin users who can see all employee MIS