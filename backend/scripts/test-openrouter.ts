async function main() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set');
  }

  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',

      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        model: 'meta/muse-spark-1.3-contributor',

        messages: [
          {
            role: 'user',
            content: 'Reply with exactly: OPENROUTER_OK',
          },
        ],
      }),
    },
  );

  console.log('Status:', response.status);
  console.log(await response.text());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});