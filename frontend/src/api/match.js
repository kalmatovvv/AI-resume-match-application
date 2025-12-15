import { api } from '../../lib/api';

export async function matchResumeFile({ file, token }) {
  const formData = new FormData();
  formData.append('resume', file);

  const headers = {
    'Content-Type': 'multipart/form-data'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await api.post('/match', formData, {
    headers
  });

  return response.data;
}
