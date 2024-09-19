declare module '@supabase/auth-helpers-nextjs' {
  export function createClientComponentClient(): any;
}

declare module '@supabase/auth-helpers-react' {
  export function SessionContextProvider(props: any): JSX.Element;
}