import { BRAND } from '../config/brand';

export function buildDocumentTitle(pageTitle) {
  if (!pageTitle) return BRAND.name;
  return `${pageTitle} · ${BRAND.name}`;
}

export function applyDocumentTitle(pageTitle) {
  document.title = buildDocumentTitle(pageTitle);
}
