const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.summarize = async (req, res) => {
  try {
    const { text, type } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Text is required' });

    const hasKey = process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your-');

    if (!hasKey) {
      return res.json({
        summary: buildMockSummary(text, type),
        source: 'mock'
      });
    }

    let prompt = `Summarize the following text clearly and concisely:\n\n${text}`;
    if (type === 'bullets') prompt = `Summarize the following text as bullet points:\n\n${text}`;
    if (type === 'short') prompt = `Give a very short 2-3 line summary of:\n\n${text}`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    res.json({ summary, source: 'gemini' });
  } catch (err) {
    console.error('AI error:', err.message);
    const { text, type } = req.body;
    res.json({
      summary: buildMockSummary(text || '', type),
      source: 'mock'
    });
  }
};

function buildMockSummary(text, type) {
  let words = text.trim().split(/\s+/);
  let wordCount = words.length;

  let sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
  let topSentences = sentences.slice(0, 3).map(s => s.trim());

  if (type === 'short') {
    if (topSentences.length > 0) {
      return topSentences.slice(0, 2).join('. ') + '.';
    }
    return `This text contains ${wordCount} words covering the key topics mentioned.`;
  }

  if (type === 'bullets') {
    let bullets = topSentences.map(s => `• ${s}`);
    if (bullets.length === 0) bullets = [`• The text discusses key concepts in ${wordCount} words`];
    bullets.push(`• Total: ${wordCount} words analyzed`);
    return bullets.join('\n');
  }

  let result = '';
  if (topSentences.length > 0) {
    result = topSentences.join('. ') + '.';
  } else {
    result = `The provided text contains ${wordCount} words.`;
  }
  result += `\n\nKey takeaways from the ${wordCount}-word passage have been identified and condensed above.`;
  return result;
}
