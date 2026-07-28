/**
 * Utility controller for converting note formats (HTML <-> Markdown <-> Text)
 */

function htmlToMarkdown(html) {
  if (!html) return '';
  let md = html;
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n');
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<hr\s*\/?>/gi, '---\n\n');
  md = md.replace(/<[^>]+>/g, '');
  return md.trim();
}

function htmlToPlainText(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const exportAsMarkdown = async (req, res) => {
  try {
    const { title = 'Note', content = '' } = req.body;
    const markdown = `# ${title}\n\n${htmlToMarkdown(content)}`;
    res.json({ title, markdown, filename: `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const exportAsText = async (req, res) => {
  try {
    const { title = 'Note', content = '' } = req.body;
    const text = `${title}\n${'='.repeat(title.length)}\n\n${htmlToPlainText(content)}`;
    res.json({ title, text, filename: `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
