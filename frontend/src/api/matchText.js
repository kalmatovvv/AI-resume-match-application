import axios from 'axios';

export async function matchResumeText({ text, token }) {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await axios.post(
    '/api/match/text',
    { text },
    {
      headers,
      withCredentials: true
    }
  );

  return response.data;
}


