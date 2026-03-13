'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function VedleggPage() {
  const params = useParams();
  const uuid = Array.isArray(params?.uuid) ? params.uuid[0] : params?.uuid;
  const [file, setFile] = useState<Blob | undefined>(undefined);

  useEffect(() => {
    if (!uuid) return;
    const getFile = async () => {
      const fileFromInnsending = await fetch(
        `/aap/soknad/api/vedlegginnsending/les/?uuid=${uuid}`,
      )
        .then((res) => {
          if (res.ok) return res.blob();
          return undefined;
        })
        .catch(() => undefined);
      setFile(fileFromInnsending);
    };
    getFile();
  }, [uuid]);

  if (file === undefined) {
    return <h1>Loading...</h1>;
  }
  return <embed src={URL.createObjectURL(file)} />;
}
