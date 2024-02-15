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
      const [fileFromSoknadApi, fileFromInnsending] = await Promise.all([
        fetch(`/aap/soknad/api/vedlegg/les/?uuid=${uuid}`)
          .then((res) => {
            if (res.ok) {
              return res.blob();
            }
            return undefined;
          })
          .catch(() => undefined),
        fetch(`/aap/soknad/api/vedlegginnsending/les/?uuid=${uuid}`)
          .then((res) => {
            if (res.ok) {
              return res.blob();
            }
            return undefined;
          })
          .catch(() => undefined),
      ]);

      if (fileFromInnsending) {
        setFile(fileFromInnsending);
      } else if (fileFromSoknadApi) {
        setFile(fileFromSoknadApi);
      }
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
  },
);

export default Vedlegg;
