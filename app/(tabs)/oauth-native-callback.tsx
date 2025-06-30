import { useOAuth } from '@clerk/clerk-expo';

export default function OAuthCallback() {
  useOAuth({ strategy: "oauth_google" });
  return null;
}
