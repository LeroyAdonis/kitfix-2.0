#!/usr/bin/env bash
# Fix empty URL vars in .env.local for local development
cd /root/kitfix-2.0
sed -i 's/^BETTER_AUTH_URL=""/BETTER_AUTH_URL="http:\/\/localhost:3000"/' .env.local
sed -i 's/^NEXT_PUBLIC_APP_URL=""/NEXT_PUBLIC_APP_URL="http:\/\/localhost:3000"/' .env.local
sed -i 's/^VERCEL_URL=""/VERCEL_URL="localhost:3000"/' .env.local
grep -E "BETTER_AUTH_URL|NEXT_PUBLIC_APP_URL|VERCEL_URL" .env.local
