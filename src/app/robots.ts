import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://yourdomain.com'; // Replace with your actual domain

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/', // Prevent crawling of API routes
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
