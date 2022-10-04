export const scrollRefIntoView = (ref: React.RefObject<HTMLElement | null>) => {
  (ref?.current as HTMLElement | null)?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
};
