/**
 * Returns a string for matching an <img> src that is:
 * - In "silent-prod" or "prod": full https://images.northerntrust.com + relativePath
 * - In any other ENV: just the relativePath
 */
export function validateImageSrcPath(relativePath: string): string {
  if (process.env.ENV === 'https://corporate.northerntrust.com' || process.env.ENV === 'https://www.northerntrust.com') {
    return `https://images.northerntrust.com${relativePath}`;
  }

  if (process.env.ENV === 'https://uat.northerntrust.com' || process.env.ENV === 'https://uat.corporate.northerntrust.com') {
    return relativePath;
  }

  return relativePath;
}
