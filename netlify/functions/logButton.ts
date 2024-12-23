// netlify/functions/logButtonClick.ts
import { Handler } from '@netlify/functions';
import { google } from 'googleapis';

// Load the service account key JSON file.
const serviceAccount = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}');

// Initialize the Google Sheets API
const sheets = google.sheets({ version: 'v4' });
const auth = new google.auth.JWT(
  serviceAccount.client_email,
  null,
  serviceAccount.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

interface ClickData {
  userId: string;
  group: number;
}

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { userId } = JSON.parse(event.body || '{}') as ClickData;
  const timestamp = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date());

  const sheetId = process.env.GOOGLE_SHEET_ID_BUTTON;

  if (!sheetId) {
    return { statusCode: 500, body: 'Google Sheet ID is not set' };
  }

  try {
    await sheets.spreadsheets.values.append({
      auth,
      spreadsheetId: sheetId,
      range: 'Sheet1!A:C', 
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[timestamp, userId, 8]],
      },
    });

    return { statusCode: 200, body: 'Data written successfully' };
  } catch (error) {
    console.error('Error writing to Google Sheet:', error);
    return { statusCode: 500, body: 'Error writing to Google Sheet' };
  }
};

export { handler };
