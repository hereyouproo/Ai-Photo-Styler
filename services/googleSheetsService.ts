
import { Style } from '../types';

// The provided Google Sheets API Key.
const API_KEY = 'AIzaSyDcpnAw6ZarjWaF74WnTgMaQPdUeVyp1s0';
const SPREADSHEET_ID = '1MqFjr0ag2vmmIgOKzGDLtDTi-bX3PFQVkVQL8ABOitc';
const SHEET_NAME = 'Sheet1';
// Updated range to fetch from columns A (Category), B (Prompt), and C (Image URL)
const RANGE = 'A2:C';

const API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!${RANGE}?key=${API_KEY}`;

export async function fetchStylesFromGoogleSheet(): Promise<Style[]> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Sheets API Error:', errorData);
      throw new Error(`Google Sheets API responded with status: ${response.status}. Check console for details.`);
    }
    const data = await response.json();
    const values: string[][] = data.values || [];
    
    // Filter out rows that don't have all three columns (category, prompt, imageUrl)
    return values
      .filter(row => row && row.length === 3 && row[0] && row[1] && row[2])
      .map((row): Style => ({
        // Column A: Category
        category: row[0].trim(),
        // Column B: Prompt (used as name and prompt)
        name: row[1].trim(),
        prompt: row[1].trim(),
        // Column C: Image URL
        imageUrl: row[2].trim(),
      }));
  } catch (error) {
    console.error("Failed to fetch styles from Google Sheet:", error);
    throw new Error("Could not load style templates. Please check the API key and spreadsheet permissions.");
  }
}
