// Calls NewsAPI.org for real current headlines.

async function getTopHeadlines() {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) throw new Error('NEWS_API_KEY is not set in the environment');

  const url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=8&apiKey=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`NewsAPI error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const articles = data.articles || [];
  if (articles.length === 0) return 'No headlines were returned right now.';

  return articles.map(a => `- ${a.title} (${a.source?.name || 'unknown source'})`).join('\n');
}

module.exports = { getTopHeadlines };
