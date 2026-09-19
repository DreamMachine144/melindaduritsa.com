"""Dependency-free checks for the public deployment artifact.

These checks enforce technical release requirements, not rankings or inbox delivery.
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
from urllib.robotparser import RobotFileParser
import json
import re
import sys
import xml.etree.ElementTree as ET

BASE = 'https://www.melindaduritsa.com'
PAGES = ['index.html', 'family-photography.html', 'booking-info.html',
         'about.html', 'contact-me.html']


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags, self.schemas, self.schema_errors = [], [], []
        self.h1 = 0
        self.ids, self.duplicate_ids = set(), set()
        self.title, self.option_text, self.options = '', '', {}
        self.in_title = self.in_schema = False
        self.script = ''
        self.select = self.option = None
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self.tags.append((tag, a))
        self.h1 += tag == 'h1'
        if a.get('id'):
            if a['id'] in self.ids:
                self.duplicate_ids.add(a['id'])
            self.ids.add(a['id'])
        if tag == 'title':
            self.in_title = True
        if tag == 'script' and a.get('type') == 'application/ld+json':
            self.in_schema, self.script = True, ''
        if tag == 'select':
            self.select = a.get('name')
        if tag == 'option':
            self.option, self.option_text = a.get('value'), ''

    def handle_data(self, data):
        if self.in_schema:
            self.script += data
        if self.in_title:
            self.title += data
        if self.option is not None:
            self.option_text += data

    def handle_endtag(self, tag):
        if tag == 'script' and self.in_schema:
            try:
                self.schemas.append(json.loads(self.script))
            except ValueError as error:
                self.schema_errors.append(str(error))
            self.in_schema = False
        if tag == 'title':
            self.in_title = False
        if tag == 'option':
            if self.select and self.option is not None:
                self.options.setdefault(self.select, []).append(
                    (self.option, ' '.join(self.option_text.split())))
            self.option = None
        if tag == 'select':
            self.select = None

    def meta(self, key, attribute='name'):
        return [a.get('content', '') for t, a in self.tags
                if t == 'meta' and a.get(attribute) == key]


def check(root):
    root = Path(root).resolve()
    errors, pages, sources = [], {}, {}

    def require(ok, message):
        if not ok:
            errors.append(message)

    for name in PAGES + ['404.html']:
        path = root / name
        if not path.is_file():
            errors.append(f'{name}: required page missing')
            continue
        sources[name] = text = path.read_text(encoding='utf-8')
        pages[name] = p = Page(text)
        require(p.h1 == 1, f'{name}: exactly one H1 required')
        require(bool(p.title.strip()), f'{name}: title missing')
        require(not p.duplicate_ids, f'{name}: duplicate element IDs {p.duplicate_ids}')
        require(not p.schema_errors, f'{name}: malformed structured data')
        require(not re.search(r'\$480|\$640|\$280|SD card|90.minute', text, re.I),
                f'{name}: retired offer text found')
        if name != '404.html':
            canonical = BASE + ('/' if name == 'index.html' else '/' + name)
            require([a.get('href') for t, a in p.tags
                     if t == 'link' and a.get('rel') == 'canonical'] == [canonical],
                    f'{name}: canonical mismatch')
            description = p.meta('description')
            require(len(description) == 1 and len(description[0].strip()) > 40,
                    f'{name}: description missing or duplicated')
            require(p.meta('og:url', 'property') == [canonical], f'{name}: social URL mismatch')
            images = p.meta('og:image', 'property')
            require(len(images) == 1 and images[0].startswith(BASE + '/images/'),
                    f'{name}: absolute social image missing')
            if images and images[0].startswith(BASE + '/'):
                require((root / unquote(urlsplit(images[0]).path).lstrip('/')).is_file(),
                        f'{name}: social image file missing')
            for directive in ['robots', 'googlebot', 'bingbot']:
                for value in p.meta(directive):
                    require(not re.search(r'\b(noindex|none|nosnippet)\b|max-snippet\s*:\s*0\b', value, re.I),
                            f'{name}: search/snippet restriction in {directive}')
            require(len(p.schemas) == 1, f'{name}: exactly one entity graph required')
            if len(p.schemas) == 1:
                schema = p.schemas[0]
                require(isinstance(schema, dict), f'{name}: structured data must be an object')
                graph = schema.get('@graph', []) if isinstance(schema, dict) else []
                require(isinstance(graph, list), f'{name}: entity graph must be a list')
                graph = graph if isinstance(graph, list) else []
                nodes = [n for n in graph if isinstance(n, dict)]
                types = {n.get('@type') for n in nodes if isinstance(n.get('@type'), str)}
                page_type = {'about.html': 'AboutPage', 'contact-me.html': 'ContactPage'}.get(name, 'WebPage')
                require({'Person', 'Organization', 'WebSite', page_type, 'Service'} <= types,
                        f'{name}: entity graph incomplete')
                ids = [n.get('@id') for n in nodes]
                require(all(ids) and len(ids) == len(set(ids)), f'{name}: missing or duplicate entity IDs')
                def inspect_refs(value):
                    if isinstance(value, dict):
                        if set(value) == {'@id'}:
                            require(value['@id'] in ids, f'{name}: dangling entity reference {value["@id"]}')
                        for item in value.values():
                            inspect_refs(item)
                    elif isinstance(value, list):
                        for item in value:
                            inspect_refs(item)
                inspect_refs(graph)
        else:
            require(p.meta('robots') == ['noindex'], '404: noindex missing')
        for tag, attrs in p.tags:
            if tag == 'img':
                require('alt' in attrs, f'{name}: image alt missing')

    titles = [pages[n].title.strip() for n in PAGES if n in pages]
    descriptions = [p.meta('description')[0] for n, p in pages.items()
                    if n in PAGES and len(p.meta('description')) == 1]
    require(len(titles) == len(set(titles)), 'Main page titles must be distinct')
    require(len(descriptions) == len(set(descriptions)), 'Main page descriptions must be distinct')
    for name, p in pages.items():
        for tag, attrs in p.tags:
            for attr in ['href', 'src']:
                ref = attrs.get(attr)
                if not ref:
                    continue
                url = urlsplit(ref)
                if url.scheme or url.netloc:
                    continue
                filename = unquote(url.path).lstrip('/') or (name if not url.path else 'index.html')
                target = (root / filename).resolve()
                require(target.is_relative_to(root) and target.is_file(), f'{name}: missing/unsafe {ref}')
                if url.fragment and filename in pages:
                    require(url.fragment in pages[filename].ids, f'{name}: missing anchor {ref}')
    for css in (root / 'css').glob('*.css'):
        for ref in re.findall(r'url\([\"\']?([^\)\"\']+)', css.read_text(encoding='utf-8')):
            if ref.startswith('data:'):
                continue
            target = root / ref.lstrip('/') if ref.startswith('/') else css.parent / ref
            require(target.is_file(), f'{css.name}: missing asset {ref}')
    expected_urls = {BASE + ('/' if n == 'index.html' else '/' + n) for n in PAGES}
    sitemap = root / 'sitemap.xml'
    try:
        urls = [e.text for e in ET.parse(sitemap).getroot().iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
        require(set(urls) == expected_urls and len(urls) == len(expected_urls),
                'Sitemap must include exactly the five canonical pages')
    except (OSError, ET.ParseError):
        errors.append('Sitemap missing or malformed')
    robots_file = root / 'robots.txt'
    if robots_file.is_file():
        robots_text = robots_file.read_text(encoding='utf-8')
        require(BASE + '/sitemap.xml' in robots_text, 'Sitemap missing from robots.txt')
        robots = RobotFileParser()
        robots.parse(robots_text.splitlines())
        for crawler in ['Googlebot', 'Bingbot', 'OAI-SearchBot']:
            for url in expected_urls:
                require(robots.can_fetch(crawler, url), f'robots.txt blocks {crawler}: {url}')
    else:
        errors.append('robots.txt missing')
    cname = root / 'CNAME'
    require(cname.is_file() and cname.read_text().strip() == 'www.melindaduritsa.com', 'Production domain must stay unchanged')
    require((root / '.nojekyll').is_file(), '.nojekyll missing')

    booking = pages.get('booking-info.html')
    offers = []
    if booking and len(booking.schemas) == 1 and isinstance(booking.schemas[0], dict):
        graph = booking.schemas[0].get('@graph', [])
        if isinstance(graph, list):
            service = next((n for n in graph if isinstance(n, dict) and n.get('@type') == 'Service'), {})
            offers = service.get('offers', [])
    require(isinstance(offers, list), 'Offers must be a list')
    offers = offers if isinstance(offers, list) else []
    require([o.get('price') for o in offers if isinstance(o, dict)] == ['395', '545'],
            'Structured prices mismatch with recommended launch offer')
    for offer in offers:
        if not isinstance(offer, dict):
            continue
        require(offer.get('priceCurrency') == 'USD', 'Offer currency mismatch')
        require(urlsplit(offer.get('url', '')).fragment in booking.ids, 'Offer fragment missing')
        require('$' + offer.get('price', '') in sources['booking-info.html'], 'Offer price not visible')
    contact = pages.get('contact-me.html')
    if contact:
        require(contact.options.get('session') == [
            ('Not sure yet', 'Not sure yet'),
            ('30-minute', '30 minutes · $395'),
            ('60-minute', '60 minutes · $545')],
            'Inquiry package options missing, malformed or inconsistent with pricing')
        for field in ['name', 'email', 'message']:
            require(any(t in ['input', 'textarea'] and a.get('name') == field and 'required' in a
                        for t, a in contact.tags), f'Inquiry required field missing: {field}')

    allowed_files = set(PAGES + ['404.html', 'robots.txt', 'sitemap.xml', 'CNAME', '.nojekyll'])
    for path in root.iterdir():
        require((path.is_file() and path.name in allowed_files) or
                (path.is_dir() and path.name in {'css', 'js', 'images', 'fonts'}),
                f'Non-site path in publication artifact: {path.name}')
    require(not any('placeholder' in p.name.lower() for p in root.rglob('*')),
            'Placeholder leaked into publication artifact')
    if errors:
        print('\n'.join(errors))
        raise SystemExit(1)
    print('PASS: pages, metadata, crawl access, schema references, offers/form choices, links/assets, domain and public-only artifact.')


if __name__ == '__main__':
    check(sys.argv[1] if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / '_site')
