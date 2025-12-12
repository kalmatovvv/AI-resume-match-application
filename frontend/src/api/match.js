import axios from 'axios';

export async function matchResumeFile({ file, token }) {
  const formData = new FormData();
  formData.append('resume', file);

  const headers = {
    'Content-Type': 'multipart/form-data'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await axios.post('/api/match', formData, {
    headers,
    withCredentials: true
  });

  return response.data;
}
