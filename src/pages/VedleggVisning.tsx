import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const VedleggVisning = () => {
  const [file, setFile] = useState<string>('');
  const { id } = useParams();
  useEffect(() => {
    const getFile = async () => {
      const file = await fetch(`/aap/soknad-api/vedlegg/les/${id}`).then((res) => res.blob());
      console.log('file', file);
      file && setFile(file);
    };
    getFile();
  }, [id]);
  return file ? <embed src={URL?.createObjectURL(file)} /> : <></>;
};
export default VedleggVisning;
