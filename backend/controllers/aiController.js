const { GoogleGenerativeAI } = require('@google/generative-ai');

const hasGeminiKey = process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your-');

exports.summarize = async (req, res) => {
  try {
    const { text, type } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Please provide some text to summarize' });
    }

    let prompt = `Summarize the following text in a clear and concise way:\n\n${text}`;
    if (type === 'bullets') prompt = `Summarize the following text as bullet points:\n\n${text}`;
    if (type === 'short') prompt = `Give a very short 2-3 line summary of:\n\n${text}`;

    if (!hasGeminiKey) {
      const mockSummary = `Here is a summary of your text:\n\n• The document discusses key concepts related to the provided content.\n• Main points have been identified and condensed.\n• This is a demo summary since no AI API key is configured.\n\nTo get real AI summaries, add your GEMINI_API_KEY in the .env file.`;
      return res.json({ summary: mockSummary, source: 'mock' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    res.json({ summary, source: 'gemini' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate summary', error: err.message });
  }
};
