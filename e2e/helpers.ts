// Shared helpers for the auth-flow e2e suite.

export function uniqueTestUser() {
  const stamp = Date.now();
  return {
    username: `e2euser${stamp}`,
    email: `e2e+${stamp}@example.com`,
    password: "TestPass123",
  };
}

// A confirmed Supabase user is required to exercise login -> dashboard ->
// logout, since signup always requires email confirmation before a session
// exists. Seed one in your Supabase project and provide its credentials
// via env vars so the tests don't depend on inbox access.
export function seededTestUser() {
  const email = process.env.PLAYWRIGHT_TEST_USER_EMAIL;
  const password = process.env.PLAYWRIGHT_TEST_USER_PASSWORD;
  return email && password ? { email, password } : null;
}
