"""Prepare GitHub Git-tree entries without changing remote refs or hosting settings.

Usage: python scripts/release_manifest.py public CHECKED_ARTIFACT_DIRECTORY
       python scripts/release_manifest.py source

JSON goes to stdout. Existing binary objects are reused; new binaries need a
separate reviewed upload. Never log credentials; this utility needs none.
"""
from pathlib import Path
import hashlib, json, subprocess, sys, contextlib
from check_site import check

ROOT=Path(__file__).resolve().parents[1]
def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)
def sha(data):
    return hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
def records(ref):
    rows=[]
    for line in git('ls-tree','-rz',ref).split(b'\0'):
        if not line: continue
        meta,path=line.split(b'\t',1)
        mode,kind,oid=meta.decode().split()
        if kind!='blob': raise SystemExit('Unexpected Git tree object')
        rows.append((path.decode(),mode,oid))
    return rows

def main():
    if git('status','--porcelain').strip():
        raise SystemExit('Commit the source changes before preparing release metadata')
    mode=sys.argv[1]
    old_main=git('rev-parse','origin/main').decode().strip()
    parent=old_main
    if mode=='source':
        parent=git('rev-parse','origin/codex/website-audit').decode().strip()
    existing={oid for _,_,oid in records('origin/main')}
    files=[]
    if mode=='public':
        artifact=Path(sys.argv[2]).resolve()
        with contextlib.redirect_stdout(sys.stderr): check(artifact)
        files=[(p.relative_to(artifact).as_posix(),'100644',p.read_bytes())
               for p in sorted(artifact.rglob('*')) if p.is_file()]
    elif mode=='source':
        files=[(name,file_mode,git('show','HEAD:'+name)) for name,file_mode,_ in records('HEAD')]
    else: raise SystemExit('Expected public or source')
    tree=[]
    for name,file_mode,data in files:
        entry={'path':name,'mode':file_mode,'type':'blob'}
        oid=sha(data)
        if oid in existing: entry['sha']=oid
        else:
            try: entry['content']=data.decode('utf-8')
            except UnicodeDecodeError: raise SystemExit('New binary requires reviewed upload: '+name)
        tree.append(entry)
    print(json.dumps({'expected_main':old_main,'expected_parent':parent,'local_source_commit':git('rev-parse','HEAD').decode().strip(),
                      'tree_elements':tree},ensure_ascii=True))

if __name__=='__main__': main()
