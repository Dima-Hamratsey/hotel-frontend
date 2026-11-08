import { useEffect } from 'react';
import { HOTEL_NAME } from '../config';

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${HOTEL_NAME}` : HOTEL_NAME;
  }, [title]);
}
