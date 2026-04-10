import { useEffect } from 'react';

const SITE_NAME = 'The Auction Guy';
const SITE_URL  = 'https://theauctionguyza.co.za';
const DEFAULT_DESC = 'The Auction Guy (TAG) is Johannesburg\'s trusted independent vehicle auction representative. We bid, source, and secure your ideal vehicle at Burchmores, WeBuyCars, Aucor, and SMA — so you don\'t have to.';
const DEFAULT_IMG  = `${SITE_URL}/android-chrome-512x512.png`;

const setMeta = (name, content, attr = 'name') => {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const setLink = (rel, href) => {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

const Seo = ({
  title,
  description = DEFAULT_DESC,
  canonical,
  image = DEFAULT_IMG,
  type = 'website',
  noindex = false,
}) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Vehicle Auction Representative Johannesburg`;
    const url = canonical ? `${SITE_URL}${canonical}` : SITE_URL;

    document.title = fullTitle;

    setMeta('description',        description);
    setMeta('robots',             noindex ? 'noindex, nofollow' : 'index, follow');
    setMeta('author',             'Ventnor Goosen — The Auction Guy');
    setMeta('geo.region',         'ZA-GP');
    setMeta('geo.placename',      'Johannesburg');

    setMeta('og:title',           fullTitle,    'property');
    setMeta('og:description',     description,  'property');
    setMeta('og:type',            type,         'property');
    setMeta('og:url',             url,          'property');
    setMeta('og:image',           image,        'property');
    setMeta('og:site_name',       SITE_NAME,    'property');
    setMeta('og:locale',          'en_ZA',      'property');

    setMeta('twitter:card',        'summary_large_image');
    setMeta('twitter:title',       fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image',       image);

    setLink('canonical', url);
  }, [title, description, canonical, image, type, noindex]);

  return null;
};

export default Seo;