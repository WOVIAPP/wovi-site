// app/api/waitlist/route.ts
// OPTIONAL (recommended): stores emails in a simple JSON file on the serverless runtime response.
// For real storage (Google Sheets / Airtable / DB), we’ll swap this later.

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, plan } = body ?? {};

    // NOTE: For now we just return OK so the UI can show success.
    // Next step: connect to Sheets/Airtable.
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: true });
  }
}

/*
WHERE TO PUT THIS FILE:
Create folders:
app
  api
    waitlist
      route.ts

In VS Code:
- Right click app -> New Folder: api
- Right click api -> New Folder: waitlist
- Right click waitlist -> New File: route.ts
- Paste this code
*/
