## AWS Amplify React+Vite Starter Template

This repository provides a starter template for creating applications using React+Vite and AWS Amplify, emphasizing easy setup for authentication, API, and database capabilities.

## Overview

This template equips you with a foundational React application integrated with AWS Amplify, streamlined for scalability and performance. It is ideal for developers looking to jumpstart their project with pre-configured AWS services like Cognito, AppSync, and DynamoDB.

## Features

- **Authentication**: Setup with Amazon Cognito for secure user authentication.
- **API**: Ready-to-use GraphQL endpoint with AWS AppSync.
- **Database**: Real-time database powered by Amazon DynamoDB.

## Deploying to AWS

For detailed instructions on deploying your application, refer to the [deployment section](https://docs.amplify.aws/react/start/quickstart/#deploy-a-fullstack-app-to-aws) of our documentation.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## Admin dashboard

This app includes an **admin-only** area:

- `/admin/login` (email + password)
- `/admin` (metrics + submissions list)

### Configuration (frontend)

Set these Vite environment variables for the admin UI to talk to Supabase Auth + RPC:

- `VITE_SUPABASE_URL` (example: `https://<project-ref>.supabase.co`)
- `VITE_SUPABASE_ANON_KEY` (Supabase anon public key)

### Setup (Supabase)

1. Apply migrations (including `supabase/migrations/20260505215500_admin_dashboard.sql`).
2. Create an admin user in Supabase Dashboard: **Authentication → Users → Add user**.
3. Allow-list that user by inserting their `auth.users.id` into `public.admin_users`:

```sql
insert into public.admin_users (user_id, email)
values ('<auth_user_uuid>', '<email>');
```

## License

This library is licensed under the MIT-0 License. See the LICENSE file.