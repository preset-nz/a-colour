// Edge entry for colours.preset.nz. Everything is static assets from ./dist;
// the only job here is sending the US spelling to the canonical host.

const CANONICAL_HOST = "colours.preset.nz";

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export default {
  fetch(request: Request, env: Env): Promise<Response> | Response {
    const url = new URL(request.url);
    if (url.hostname === "colors.preset.nz") {
      url.hostname = CANONICAL_HOST;
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
