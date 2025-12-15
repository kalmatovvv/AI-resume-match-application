import { api } from '../../lib/api';

export async function matchResumeText({ text, token }) {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await api.post(
    '/match/text',
    { text },
    {
      headers
    }
  );

  return response.data;
}


