import {
  t,
  translateTypeName,
  getEntryDisplayAddress,
  formatLocalizedDate,
  formatLocalizedTime,
} from '@/lib/i18n';
import { normalizePhoneForWhatsApp } from '@/lib/contacts';
import type { Entry } from '@/types';

interface EntryShareText {
  heading: string;
  body: string;
}

function buildEntryShareText(entry: Entry): EntryShareText {
  const typeName = translateTypeName(entry.type);
  const { street, cityZip } = getEntryDisplayAddress(entry);
  const addressLine = [street, cityZip].filter(Boolean).join(', ');
  const date = new Date(entry.created_at);
  const dateStr = formatLocalizedDate(date, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = formatLocalizedTime(date, { hour: 'numeric', minute: '2-digit' });

  const mapsUrl = `https://www.google.com/maps?q=${entry.latitude},${entry.longitude}`;

  const heading = addressLine
    ? t('share.subjectWithAddress', { type: typeName, address: addressLine })
    : t('share.subjectTypeOnly', { type: typeName });

  const lines: string[] = [];
  lines.push(`${t('share.bodyType')}: ${typeName}`);
  if (addressLine) lines.push(`${t('share.bodyAddress')}: ${addressLine}`);
  lines.push(`${t('share.bodyDate')}: ${dateStr} ${timeStr}`);
  lines.push(`${t('share.bodyLocation')}: ${mapsUrl}`);
  if (entry.description) {
    lines.push('');
    lines.push(`${t('share.bodyNotes')}:`);
    lines.push(entry.description);
  }
  if (entry.photo_urls && entry.photo_urls.length > 0) {
    lines.push('');
    lines.push(`${t('share.bodyPhotos')}:`);
    for (const url of entry.photo_urls) lines.push(url);
  }

  return { heading, body: lines.join('\n') };
}

export function buildShareEntryMailto(entry: Entry, recipient?: string): string {
  const { heading, body } = buildEntryShareText(entry);
  const to = recipient ? encodeURIComponent(recipient.trim()) : '';
  return `mailto:${to}?subject=${encodeURIComponent(heading)}&body=${encodeURIComponent(body)}`;
}

export function buildShareEntryWhatsApp(entry: Entry, phone?: string): string {
  const { heading, body } = buildEntryShareText(entry);
  // WhatsApp has no subject — prefix the body with the heading as a bold first line.
  const text = `*${heading}*\n\n${body}`;
  const number = phone ? normalizePhoneForWhatsApp(phone) : '';
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
