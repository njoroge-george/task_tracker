import LandingPage from "./(marketing)/page";

export default async function Home() {
  // Use the MUI-based landing page to avoid Tailwind and client/server boundary issues
  return <LandingPage />;
}