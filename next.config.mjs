/** @type {import('next').NextConfig} */
const isProjectPage = true;           // set to false if deploying to user/org site (user.github.io)
const repo = 'juveboxd';             // <-- change to your repository name

export default {
  output: 'export',                   // static export
  images: { unoptimized: true },      // Next/Image works on GH Pages
  basePath: isProjectPage ? `/${repo}` : undefined,
  assetPrefix: isProjectPage ? `/${repo}/` : undefined,
  trailingSlash: true,                // avoids some GH Pages mime/redirect quirks
};
