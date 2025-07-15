
export const redirectAssetPath = (originalPath: string): string => {
  if (originalPath.startsWith('/3m-uploads/')) {
    return originalPath.replace('/3m-uploads/', '/lovable-uploads/');
  }
  return originalPath;
};
