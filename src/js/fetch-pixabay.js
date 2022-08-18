import axios from 'axios';

export default async function fetchPixabay(data, page) {
  const base_url = 'https://pixabay.com/api/';
  const key = '29311395-54c943df23053780296919f88';
  const options = `key=${key}&q=${data}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`;

  return await axios.get(`${base_url}?${options}`).then(res => res.data);
}
