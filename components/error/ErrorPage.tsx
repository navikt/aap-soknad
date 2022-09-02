import Link from 'next/link';

type Props = {
  error: Error;
  componentStack: string | null;
  resetError: () => void;
};
const ErrorPage = ({ error, componentStack }: Props) => {
  return (
    <div className="error-container">
      <h1>Error: {error?.message}</h1>
      <p>
        Beklager, her har det skjedd noe galt. Vi har spart på svarene dine slik at du kan fortsette
        der du slapp senere.
      </p>
      <Link href="/standard" shallow={false}>
        Gå tilbake til søknad
      </Link>
    </div>
  );
};
export default ErrorPage;
