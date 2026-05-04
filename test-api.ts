// test-api.ts
async function test() {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models",
    {
      headers: {
        Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
      },
    },
  );

  console.log("Status:", res.status);
  console.log(await res.text());
}

test();
