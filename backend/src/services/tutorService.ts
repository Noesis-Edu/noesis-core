import { env } from '../config/env.js';

interface TutorRequest {
  sessionId: string;
  stepId: string;
  conceptId: string;
  representation: string;
  lastAnswer?: string | null;
  errorType?: string | null;
  attempts: number;
}

const defaultHint =
  'Try thinking about how many equal parts make the whole, then count how many of those parts you need.';

export async function fetchHint(payload: TutorRequest): Promise<string> {
  if (!env.openAiApiKey) {
    return defaultHint;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.openAiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 80,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content:
              'You are a concise math tutor helping a learner understand fractions as magnitudes. Provide hints under 60 words.',
          },
          {
            role: 'user',
            content: `Session: ${payload.sessionId}\nConcept: ${payload.conceptId}\nRepresentation: ${payload.representation}\nStep: ${payload.stepId}\nLast answer: ${payload.lastAnswer ?? 'n/a'}\nError: ${payload.errorType ?? 'unknown'}\nAttempts: ${payload.attempts}\nRespond with one short actionable hint.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Tutor API failed', await response.text());
      return defaultHint;
    }

    const data = (await response.json()) as {
      choices: { message: { content: string } }[];
    };

    return data.choices?.[0]?.message?.content?.trim() ?? defaultHint;
  } catch (error) {
    console.error('Tutor API error', error);
    return defaultHint;
  }
}
