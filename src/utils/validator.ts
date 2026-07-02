export const isValidGoogleMeetUrl = (url: string) => {
  const regex =
    /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/;

  return regex.test(url);
};