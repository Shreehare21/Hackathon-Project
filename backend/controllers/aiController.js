const OpenAI = require('openai');

// @desc    Improve startup pitch using AI (bonus)
// @route   POST /api/ai/improve-pitch
exports.improvePitch = async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        message: 'AI feature is not configured. Add OPENAI_API_KEY to .env.'
      });
    }
    const { currentPitch, context } = req.body;
    if (!currentPitch || !currentPitch.trim()) {
      return res.status(400).json({ success: false, message: 'Current pitch text is required.' });
    }
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert startup pitch advisor. Improve the given one-line pitch to be clearer, more compelling, and under 200 characters. Keep the same idea, just refine the wording. Return only the improved pitch, no explanation.'
        },
        {
          role: 'user',
          content: `Current pitch: "${currentPitch}"${context ? `\nContext: ${context}` : ''}`
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });
    const improvedPitch = completion.choices[0]?.message?.content?.trim() || currentPitch;
    res.json({ success: true, improvedPitch, original: currentPitch });
  } catch (error) {
    console.error('OpenAI error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to improve pitch.'
    });
  }
};
