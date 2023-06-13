import { beskyttetSide } from 'auth/beskyttetSide';
import { GetServerSidePropsResult, NextPageContext } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getStringFromPossiblyArrayQuery } from 'utils/string';

interface PageProps {}

const Vedlegg = ({}: PageProps) => {
  const router = useRouter();
  const [file, setFile] = useState<Blob | undefined>(undefined);

  const uuid = getStringFromPossiblyArrayQuery(router.query['uuid']);

  useEffect(() => {
    const getFile = async () => {
      const file = await fetch(`/aap/soknad/api/vedlegg/les/?uuid=${uuid}`).then((res) =>
        res.blob()
      );
      file && setFile(file);
    };
    getFile();
  }, [uuid]);
  if (file === undefined) {
    return <h1>Loading...</h1>;
  }
  return <embed src={URL.createObjectURL(file)} />;
};

export const getServerSideProps = beskyttetSide(
  async (ctx: NextPageContext): Promise<GetServerSidePropsResult<{}>> => {
    return {
      props: {},
    };
  }
);

export default Vedlegg;
