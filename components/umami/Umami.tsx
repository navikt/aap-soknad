'use client';

import { useEffect } from 'react';
import { isDev } from 'utils/environments';

const umamiSporingskodeDev = '09db40bf-ca75-4fc6-a9f1-dfe258ef5913';

export const UmamiScript = () => {
  useEffect(() => {
    if(isDev()){
      loadTracker(umamiSporingskodeDev);
    }
  }, []);

  return null;
};

function loadTracker(sporingskode: string) {
  const script = document.createElement('script');
  script.defer = true;
  script.src = 'https://cdn.nav.no/team-researchops/sporing/sporing-dev.js';
  script.setAttribute('data-website-id', sporingskode);
  document.head.appendChild(script);
}
