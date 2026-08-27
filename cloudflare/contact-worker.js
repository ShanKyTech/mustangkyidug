/**
 * Mustang Kyidug USA — contact form Worker
 * Receives POSTs from the site's contact form at mustangkyidug.com/api/contact
 * and relays them to the Kyidug inbox via Cloudflare Email Routing.
 *
 * Setup (Cloudflare dashboard):
 *   1. mustangkyidug.com zone → Email → Email Routing → enable it.
 *   2. Email Routing → Destination addresses → add mustangkyidug@gmail.com
 *      and click the verification link Gmail receives.
 *   3. Workers & Pages → Create Worker → name: mustangkyidug-contact →
 *      paste this file → Deploy.
 *   4. Worker → Settings → Bindings → Add → "Send email" →
 *      variable name: CONTACT_EMAIL, destination: mustangkyidug@gmail.com.
 *   5. Worker → Settings → Domains & Routes → Add route:
 *      mustangkyidug.com/api/contact*  (zone: mustangkyidug.com)
 */
import { EmailMessage } from "cloudflare:email";

const DEST = "mustangkyidug@gmail.com";
const FROM = "forms@mustangkyidug.com";

export default {
  async fetch(request, env) {
    if (request.method !== "POST") return json({ ok: false, error: "Not found" }, 404);

    let data;
    try {
      const ct = request.headers.get("content-type") || "";
      if (ct.includes("application/json")) data = await request.json();
      else data = Object.fromEntries(await request.formData());
    } catch {
      return json({ ok: false, error: "Bad request" }, 400);
    }

    // Honeypot filled → almost certainly a bot. Pretend success, send nothing.
    if (data.website) return json({ ok: true });

    const clean = (v, max) => (v || "").toString().replace(/[\r\n]+/g, " ").trim().slice(0, max);
    const name = clean(data.name, 120);
    const email = clean(data.email, 200);
    const topic = clean(data.topic, 80) || "General inquiry";
    const message = (data.message || "").toString().trim().slice(0, 5000);

    if (!name || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json({ ok: false, error: "Please fill in your name, a valid email, and a message." }, 400);
    }

    const raw =
`From: Mustang Kyidug Website <${FROM}>
To: ${DEST}
Reply-To: "${name.replace(/"/g, "'")}" <${email}>
Subject: [${topic}] Website message from ${name}
MIME-Version: 1.0
Content-Type: text/plain; charset=utf-8

New message from the mustangkyidug.com contact form

Name:  ${name}
Email: ${email}
Topic: ${topic}

${message}
`;

    try {
      await env.CONTACT_EMAIL.send(new EmailMessage(FROM, DEST, raw));
      return json({ ok: true });
    } catch (err) {
      return json({ ok: false, error: "Could not send right now — please email " + DEST + " directly." }, 502);
    }
  },
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}
