import { google } from 'googleapis';
import { Readable } from 'stream';

/**
 * Service to handle Google Drive operations for the logged-in user.
 */
export async function uploadToGoogleDrive(
  accessToken: string,
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: 'v3', auth });

  try {
    const fileMetadata = {
      name: fileName,
      parents: [] // Root by default, or you can specify a 'SmartTeach' folder ID
    };

    const media = {
      mimeType: mimeType,
      body: Readable.from(fileBuffer)
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
    });

    const fileId = response.data.id;

    // Set permissions to "Anyone with the link can view"
    await drive.permissions.create({
      fileId: fileId!,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    return {
      id: fileId,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink
    };
  } catch (error: any) {
    console.error('Detailed Google Drive Error:', error.response?.data || error.message);
    if (error.response?.data?.error?.message?.includes('Google Drive API has not been used')) {
      throw new Error('Google Drive API is NOT ENABLED in your Google Cloud Console. Please enable it to continue.');
    }
    throw new Error(`Google Drive Error: ${error.response?.data?.error?.message || error.message}`);
  }
}

export async function deleteFromGoogleDrive(accessToken: string, fileId: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: 'v3', auth });

  try {
    await drive.files.delete({ fileId });
  } catch (error) {
    console.error('Google Drive Delete Error:', error);
    // We don't necessarily want to throw here if the file is already gone
  }
}
