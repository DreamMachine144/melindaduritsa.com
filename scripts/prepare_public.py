"""Package only public site files. No runtime or third-party dependencies.

Usage: python scripts/prepare_public.py [NEW_OUTPUT_DIRECTORY]
An existing output directory is rejected; nothing is deleted implicitly.
"""
from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parents[1]
FILES = ['index.html', 'family-photography.html', 'booking-info.html',
         'about.html', 'contact-me.html', '404.html', 'robots.txt',
         'sitemap.xml', 'CNAME', '.nojekyll']
FOLDERS = {'css': {'.css'}, 'js': {'.js'},
           'images': {'.jpg', '.jpeg', '.png', '.webp', '.avif', '.svg'},
           'fonts': {'.ttf', '.woff', '.woff2'}}

def prepare(destination):
    destination = Path(destination).resolve()
    if destination.exists():
        raise SystemExit('Output already exists; choose a fresh directory: ' + str(destination))
    sources = []
    for name in FILES:
        path = ROOT/name
        if not path.is_file() or path.is_symlink():
            raise SystemExit('Missing or unsafe public file: ' + name)
        sources.append(path)
    for folder, suffixes in FOLDERS.items():
        for path in (ROOT/folder).rglob('*'):
            if path.is_symlink():
                raise SystemExit('Symbolic links are not allowed: ' + str(path))
            if path.is_file() and path.suffix.lower() in suffixes:
                sources.append(path)
    destination.mkdir(parents=True)
    for source in sources:
        target=destination/source.relative_to(ROOT)
        target.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(source,target)
    print(f'Prepared {len(sources)} public files in {destination}')
    print('Knowledge Base, repository metadata, tests and scripts are excluded.')

if __name__=='__main__':
    prepare(sys.argv[1] if len(sys.argv)>1 else ROOT/'_site')
