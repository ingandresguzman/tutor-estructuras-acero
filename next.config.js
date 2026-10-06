/** @type {import('next').NextConfig} */
// La clave ANTHROPIC_API_KEY NO se expone aquí: se lee solo en el servidor
// (pages/api/chat.js). Declararla en `env` la incrustaría en el bundle del navegador.
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['react-markdown', 'remark-math', 'rehype-katex'],
}

module.exports = nextConfig
