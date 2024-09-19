declare module '@supabase/auth-helpers-nextjs' {
  import { NextApiRequest, NextApiResponse } from 'next';
  import { CookieOptions } from '@supabase/auth-helpers-shared';

  export function createClientComponentClient(options?: { cookies?: any }): any;
  export function createRouteHandlerClient(options: { cookies: () => any }): any;
  export function createServerComponentClient(options: { cookies: () => any }): any;
  export function createMiddlewareClient(req: NextApiRequest, res: NextApiResponse): any;
}

declare module '@supabase/auth-helpers-react' {
  export function SessionContextProvider(props: any): JSX.Element;
}