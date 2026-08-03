import json, re, urllib.request, time

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
CH = "UCwRWz4olcoeTOFedX2918xQ"

html = open("chan.html", encoding="utf-8", errors="ignore").read()
KEY = re.search(r'"INNERTUBE_API_KEY":"([^"]+)"', html).group(1)
VER = re.search(r'"INNERTUBE_CLIENT_VERSION":"([^"]+)"', html).group(1)
VD = re.search(r'"visitorData":"([^"]+)"', html).group(1)
CTX = {"client": {"clientName": "WEB", "clientVersion": VER, "hl": "en", "gl": "US", "visitorData": VD}}


def post(payload):
    req = urllib.request.Request(
        f"https://www.youtube.com/youtubei/v1/browse?key={KEY}&prettyPrint=false",
        data=json.dumps(payload).encode(),
        headers={"User-Agent": UA, "Content-Type": "application/json",
                 "X-Youtube-Client-Name": "1", "X-Youtube-Client-Version": VER,
                 "Origin": "https://www.youtube.com", "Referer": "https://www.youtube.com/"})
    return json.loads(urllib.request.urlopen(req, timeout=30).read())


def find_all(o, key, out=None):
    if out is None: out = []
    if isinstance(o, dict):
        for k, v in o.items():
            if k == key: out.append(v)
            find_all(v, key, out)
    elif isinstance(o, list):
        for i in o: find_all(i, key, out)
    return out


def parse(node):
    vids = []
    for lv in find_all(node, "lockupViewModel"):
        vid = lv.get("contentId")
        if not vid or lv.get("contentType") != "LOCKUP_CONTENT_TYPE_VIDEO":
            continue
        meta = lv.get("metadata", {}).get("lockupMetadataViewModel", {})
        title = meta.get("title", {}).get("content")
        views = published = None
        for r in find_all(meta.get("metadata", {}), "metadataParts"):
            for p in r:
                t = p.get("text", {}).get("content")
                if not t: continue
                if "view" in t: views = t
                elif "ago" in t: published = t
        dur = None
        for b in find_all(lv.get("contentImage", {}), "thumbnailBadgeViewModel"):
            if re.match(r"^\d+:\d+", b.get("text", "") or ""): dur = b["text"]
        vids.append({"id": vid, "title": title, "views": views,
                     "published": published, "duration": dur})
    return vids


def toks(node):
    return [c["continuationEndpoint"]["continuationCommand"]["token"]
            for c in find_all(node, "continuationItemRenderer") if "continuationEndpoint" in c]


videos, seen = [], set()
# params: Videos tab
resp = post({"context": CTX, "browseId": CH, "params": "EgZ2aWRlb3PyBgQKAjoA"})
for v in parse(resp):
    if v["id"] not in seen: seen.add(v["id"]); videos.append(v)
print("initial", len(videos), flush=True)

t = toks(resp)
page = 0
while t and page < 40:
    resp = post({"context": CTX, "continuation": t[0]})
    new = [v for v in parse(resp) if v["id"] not in seen]
    for v in new: seen.add(v["id"]); videos.append(v)
    page += 1
    print(f"page {page}: +{len(new)} total {len(videos)}", flush=True)
    t = toks(resp)
    if not new: break
    time.sleep(0.5)

json.dump(videos, open("videos.json", "w"), indent=1)
print("TOTAL", len(videos))
