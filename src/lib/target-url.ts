export type TargetLink = {
  href: string;
  text: string;
};

export type RankedTargetLink = TargetLink & {
  score: number;
};

const genericCandidateTokens = new Set([
  "ai",
  "app",
  "chat",
  "free",
  "for",
  "from",
  "generator",
  "online",
  "platform",
  "service",
  "studio",
  "the",
  "tool",
  "tools",
  "use",
  "web",
  "with",
]);

const primaryActionPattern =
  /\b(?:official|website|visit|open|launch|try|get started|start|besuch|visite|visiter|visitar|abrir|ouvrir|probar|lancer)\b|官网|访问|开始/i;

const sponsoredPattern =
  /\b(?:sponsored|sponsorisé|sponsorizzato|gesponsert)\b|赞助/i;

const getCandidateTokens = (sourceUrl: string) => {
  try {
    const pathname = new URL(sourceUrl).pathname;
    const lastSegment = pathname.split("/").filter(Boolean).at(-1) || "";

    return lastSegment
      .split(/[^a-z0-9]+/i)
      .map((token) => token.toLowerCase())
      .filter(
        (token) => token.length >= 3 && !genericCandidateTokens.has(token),
      );
  } catch {
    return [];
  }
};

/**
 * Rank external links found on a directory detail page.
 * Prefer the page's own tool name and primary CTA over cross-promotions.
 */
export function rankTargetLinks(
  sourceUrl: string,
  links: TargetLink[],
): RankedTargetLink[] {
  const candidateTokens = getCandidateTokens(sourceUrl);

  return links
    .map((link, index) => {
      const targetUrl = new URL(link.href);
      const text = link.text.toLowerCase();
      const haystack = `${text} ${link.href.toLowerCase()}`;
      const matchingCandidateTokens = candidateTokens.filter((token) =>
        haystack.includes(token),
      );
      let score = 0;

      if (matchingCandidateTokens.length) {
        score += 50 + matchingCandidateTokens.length * 5;
      }
      if (primaryActionPattern.test(text)) score += 20;
      if (sponsoredPattern.test(text)) score -= 30;
      if (/\/out\/|\/go\/|redirect|target=|url=/.test(haystack)) score += 5;
      if (targetUrl.pathname === "/" || targetUrl.pathname === "") score += 3;

      return { ...link, score, index };
    })
    .sort(
      (left, right) =>
        right.score - left.score || left.index - right.index,
    )
    .map(({ index: _index, ...link }) => link);
}
