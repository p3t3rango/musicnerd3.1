export async function validateBandsInTownProfile(handle: string): Promise<boolean> {
  try {
    const response = await fetch(`https://www.bandsintown.com/artists/${handle}`, {
      method: 'HEAD'  // Only fetch headers to check if page exists
    });
    return response.status === 200;
  } catch (error) {
    console.error('Error validating Bandsintown profile:', error);
    return false;
  }
} 