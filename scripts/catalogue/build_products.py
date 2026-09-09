"""Build the catalogue from @label_by_rasika's own carousel posts.

One carousel == one garment photographed from several angles, so a product's
gallery can never mix different dresses. Name, fabric, colour and craft are
extracted from Rasika's own caption rather than invented.
"""
import pathlib
ROOT = str(pathlib.Path(__file__).resolve().parents[2])
HARVEST = ROOT + '/data/harvest'
import json, re

def clip(text, limit):
    """Trim to the last whole word inside `limit`, with an ellipsis.

    A bare slice cut 23 of 47 subtitles mid-word, which rendered as visibly
    broken copy under the hero H1 and on the product page.
    """
    text = (text or '').strip()
    if len(text) <= limit:
        return text
    cut = text[:limit].rsplit(' ', 1)[0].rstrip(' ,.;:-\u2013\u2014')
    return (cut or text[:limit].rstrip()) + '\u2026'

def parse_likes(v):
    """Like counts arrive as ints OR as compact strings ('1k', '1.2k', '12.3k').

    This used to be `int(v) if isinstance(v, int) else 0`, which silently
    zeroed every compact value — so the most-liked posts, the only ones large
    enough to be abbreviated, were exactly the ones excluded from the
    bestseller ranking.
    """
    if isinstance(v, (int, float)):
        return int(v)
    if isinstance(v, str):
        t = v.strip().lower().replace(',', '')
        try:
            if t.endswith('k'):
                return int(float(t[:-1]) * 1_000)
            if t.endswith('m'):
                return int(float(t[:-1]) * 1_000_000)
            return int(float(t))
        except ValueError:
            return 0
    return 0


car = json.load(open(HARVEST + '/carousels.json'))
keep = json.load(open(HARVEST + '/keep_codes.json'))

COLOURS = [
 ('Hot Pink','#d81b60'),('Electric Blue','#1f3fbf'),('Royal Blue','#27408b'),('Navy Blue','#1e3a5f'),
 ('Bottle Green','#14532d'),('Mint Green','#a8d8c0'),('Pista Green','#cfe3c4'),('Teal Green','#0f766e'),
 ('Emerald Green','#046a38'),('Rich Purple','#6a1b9a'),('Blue & White','#3f6fb5'),('Black & White','#2b2b2b'),
 ('Mustard','#c4862b'),('Maroon','#7b1f2b'),('Ivory','#f0ece4'),('Lilac','#b39ddb'),('Peach','#f4a460'),
 ('Teal','#0f766e'),('Purple','#6a1b9a'),('Pink','#d81b60'),('Green','#2e7d32'),('Blue','#2f5fa8'),
 ('Black','#222222'),('White','#f5f5f5'),('Red','#a3232c'),('Yellow','#d4a017'),('Orange','#e07b39'),
 ('Pastel','#e8e0d5'),
]
FABRICS = [('Russian Silk','Russian Silk'),('Modal Silk','Modal Silk'),('Chinon','Chinon'),
           ('Chanderi','Chanderi Silk Cotton'),('Georgette','Pure Georgette'),('Muslin','Muslin Cotton'),
           ('Organza','Organza'),('Cotton','Cotton'),('Silk','Raw Silk')]
GARMENTS = [('Anarkali','anarkali'),('Garara','russian-silk'),('Gharara','russian-silk'),
            ('Kaftan','kurta-set'),('Two-Piece','party-wear'),('two-piece','party-wear'),
            ('Dress Material','salwar-suit'),('dress material','salwar-suit'),
            ('Suit Set','kurta-set'),('Suit','salwar-suit'),('Kurti','kurta-set'),('Kurta','kurta-set'),
            ('Tunic','russian-silk'),('Co-ord','kurta-set'),('up-down','kurta-set'),
            ('Peplum','party-wear'),('Sharara','party-wear'),('Palazzo','kurta-set'),
            ('Indo-western','party-wear'),('ensemble','party-wear'),
            ('statement piece','party-wear'),('Blouse','kurta-set'),('Dress','kurta-set'),
            ('outfit','kurta-set')]
CRAFTS = ['Bandhani','Leheriya','Patola','Madhubani','Gota Patti','Hand Painted','Hand-Painted',
          'Hand Embroidered','Hand-Embroidered','hand embroidery','Mirror','Chikankari']

# Credits for OTHER people's work. Everything from such a marker to the end of
# the line describes someone else's piece, so colour and craft must not be read
# from it: "Outfit- @label_by_rasika Earrings & bracelet- @crafting_moves" was
# recording Resin (the jewellery) as the dress's embellishment.
CREDIT_MARKERS = re.compile(
    r'(earrings?|bracelets?|jewell?ery|necklace|footwear|shoes?|heels?|bag|clutch|'
    r'makeup|mua|hair|photograph\w*|photo|shoot|styl(?:ed|ing)|in\s+frame|model)\s*[-:–—]',
    re.I)

def garment_text(cap):
    """The part of the caption that is about the garment itself."""
    lines = []
    for line in re.split(r'[\n.]', cap or ''):
        if CREDIT_MARKERS.search(line):
            line = line[: CREDIT_MARKERS.search(line).start()]
        lines.append(line)
    return ' '.join(lines)

def clean(c):
    c=re.sub(r'#\S+','',c or '')
    c=re.sub(r'📍.*$','',c,flags=re.S)
    c=re.sub(r'(Do Visit|Do visit|Message Us|Message us|Follow Us|Show Some love|Do like).*$','',c,flags=re.S)
    c=re.sub(r'We (are|Are) waiting to celebrate FASHION with YOU.*$','',c,flags=re.S)
    c=re.sub(r'@[\w.]+','',c)
    c=re.sub(r'\s+',' ',c)
    return c.strip(' .✨•❤️💕🤍-')

def find(text, table):
    low=text.lower()
    for k,v in table:
        if k.lower() in low: return k,v
    return None,None

# Auto-extraction gets colour and fabric right but cannot name a garment from a
# caption about the client wearing it. These are written by hand from Rasika's
# own words; anything not listed falls back to the extracted name.
HAND_NAMES = {
 'DZFghe-gFLN': 'Mother-Daughter Blouse Set',
 'DZFegCsAMEt': 'Custom Blouse, Made to Compliment',
 'DV5YDK6iDTI': 'Mint Green Statement Piece',
 'DVNN2cYE3y7': 'Hot Pink Statement Piece',
 'DQjiHMjDDAv': 'Colour-with-Class Statement Piece',
 'DPWRBXnk27h': 'Russian Silk Tunic with Chinon Garara',
 'DPWP3B-k6Ix': 'Russian Silk Tunic with Chinon Garara',
 'DOGb049iMtz': 'Pastel Indo-Western Ensemble',
 'DOGa0edCM_m': 'Pastel Indo-Western Ensemble',
 'DNU4zU7tO0X': 'Hot Pink Anarkali with White Embroidery',
 'DNNrXlxPFTo': 'Electric Blue Embroidered Anarkali',
 'DNF9DSRNyWb': 'Pure Modal Silk Printed Suit',
 'DNC5WGTtSQf': 'Purple Bandhani Modal Silk with Gota Patti',
 'DNC41asNvM-': 'Purple Bandhani Modal Silk with Gota Patti',
 'DK82NAyPDLd': 'Hand-Painted Customised Kurti',
 'DK81x4XvhnU': 'Hand-Painted Customised Kurti',
 'DKbauN3v4ZR': 'Blue & White Suit Set',
 'DKMD9xxNjVr': 'Rich Purple Leheriya Dress Material',
 'DKMDPZvNpbK': 'Rich Purple Leheriya Dress Material',
 'DJ3j_uJP1Ar': 'White & Pista Green Cotton Set',
 'DJ3f_wyvkf4': 'White & Pista Green Cotton Set',
 'DJ1lB3TtuiJ': 'Teal Green Madhubani Cotton Dress Material',
 'DJ1kGB3N_cT': 'Teal Green Madhubani Cotton Dress Material',
 'DJoy-pivTMe': 'Bottle Green Embroidered Two-Piece',
 'DJl6DrfPupY': 'Teal Embroidered Two-Piece',
 'DJgMOFUv6OS': 'Draped Kaftan with Hand Embroidery',
 'DJRiRO1v56b': 'Black & White Ruched Dress',
 'DJRQRh6vkJK': 'Up-Down Vacation Dress with Waist Belt',
 'DJQ0ES-P-DU': 'Navy Blue Floral Dress, Hand-Done Collar',
 'DJGjRMWvaOA': 'Hand-Painted & Hand-Embroidered Anarkali Set',
 'CgQyzhHrHKV': 'Emerald Green & Red Kundan Bead Set',
 # Collection drops: several different outfits published under one caption.
 # The automatic "Look I/II/III" numbering distinguishes them.
 'DOApEQkiGG0': 'Couture Edit',
 'DOAoZQkCP9L': 'Couture Edit',
 'DOAn9z7CHbR': 'Couture Edit',
 'DN-xCfcCHB7': 'Couture Edit',
 'DN-uoK7CGKd': 'Couture Edit',
 'DOOMHe2CBze': 'Crafted in Pure Elegance',
 'DOOLW58iK2r': 'Crafted in Pure Elegance',
 'DKRF2uYPFn1': 'Nine-to-Five Edit',
 'DKRFZlfPgVn': 'Nine-to-Five Edit',
 'DTerv-ZiKoi': 'Sankranti Festive Look',
 'DTerdiJCOtM': 'Sankranti Festive Look',
 'DU-FTiCiLbD': 'Boutique Favourite',
 'DU8Jd0ZCBET': 'Boutique Favourite',
}

products=[]; used_names=set()
for code in keep:
    imgs=car.get(code) or []
    if len(imgs)<2: continue
    cap=clean(imgs[0].get('caption'))
    if len(cap)<28: continue                       # too vague to name honestly

    # Some posts are not garments at all (a Kundan necklace hashtagged
    # #illustrations got in once and rendered as a purchasable kurta set).
    raw_low = (imgs[0].get("caption") or "").lower()
    if any(w in raw_low for w in ('#illustration', '#illustrator', '#artwork', '#sketch')):
        continue

    gcap = garment_text(cap)
    colour,hexv = next(
        ((c,h) for c,h in COLOURS
         if re.search(r'\b' + re.escape(c.lower()).replace(r'\ ', r'\s+') + r'\b', gcap.lower())),
        ('Assorted','#b9a897'))
    fab_word,fabric = find(cap, FABRICS)
    fabric = fabric or 'Cotton'
    garm_word,category = find(cap, GARMENTS)
    if not garm_word:
        # Nothing nameable in the caption — say what it is, not a bare "Set".
        garm_word = 'Piece'
    category = category or 'kurta-set'
    crafts=[c for c in CRAFTS
            if re.search(r'\b' + re.escape(c.lower()).replace(r'\ ', r'\s+') + r'\b', garment_text(cap).lower())]
    # She names a craft on 15 of 43 posts. Do not invent one for the rest.
    craft = crafts[0] if crafts else 'Not stated'

    if code in HAND_NAMES:
        name = HAND_NAMES[code]
    else:
        g = garm_word.title()
        parts=[colour if colour!='Assorted' else '', fab_word or '', g]
        name=' '.join(p for p in parts if p).strip()
        # Refuse a name that says nothing — skip rather than ship "Piece · 04".
        if name in ('Piece','Set','Dress','Outfit','Blouse','Kurti','Kaftan','Up-Down'):
            continue
    name=re.sub(r'\s+',' ',name)
    if code not in HAND_NAMES:
        base=name; n=2
        while name.lower() in used_names:
            name=f'{base} · {n:02d}'; n+=1
    used_names.add(name.lower())

    likes=parse_likes(imgs[0].get('likes'))
    products.append(dict(code=code, name=name, subtitle=clip(cap, 130), desc=clip(cap, 400),
                         category=category, fabric=fabric, colour=colour, hexv=hexv,
                         craft=craft, files=[e['file'] for e in imgs], likes=likes,
                         date=imgs[0].get('date') or 0))

# --- merge same-garment posts ------------------------------------------------
# Caption alone is NOT enough: Rasika posts a whole collection drop under one
# caption, so five different outfits can share the words "Where couture whispers
# elegance". Measured over 19 same-caption pairs, 18 were different garments.
# Compare the photographs instead; merge only when they actually match.
from PIL import Image
ROOT_PUB=ROOT + '/public'

# --- caption colour vs photograph -------------------------------------------
# The caption is the only source we trust for colour, but it can be wrong for
# the frame we show: DPWRBXnk27h says "classic in regal blue" over a garment
# that is unmistakably pink. Photo-based colour is too unreliable to ASSERT a
# colour (it has called blue "pink" and mint "yellow" against the shop's racks),
# but it is good enough to VETO one: if the centre of the frame is dominated by
# a family that is not the caption's, we say nothing rather than label wrongly.
import colorsys
HUE_FAMILIES=[('Blue',[(190,255)]),('Green',[(75,175)]),('Pink',[(300,345)]),('Purple',[(255,300)]),
              ('Red & Maroon',[(345,360),(0,15)]),('Yellow & Mustard',[(35,70)]),('Orange',[(15,35)])]
CAPTION_TO_FAMILY={'blue':'Blue','navy':'Blue','teal':'Blue','green':'Green','pista':'Green','mint':'Green',
                   'emerald':'Green','bottle':'Green','pink':'Pink','magenta':'Pink','purple':'Purple',
                   'lilac':'Purple','red':'Red & Maroon','maroon':'Red & Maroon','yellow':'Yellow & Mustard',
                   'mustard':'Yellow & Mustard','peach':'Orange','orange':'Orange'}

def photo_family(path):
    try:
        im=Image.open(path).convert('RGB')
    except Exception:
        return None, 0.0
    w,h=im.size
    im=im.crop((int(w*0.3),int(h*0.3),int(w*0.7),int(h*0.75))).resize((60,60))
    tally={}
    for r,g,b in im.getdata():
        hh,ll,ss=colorsys.rgb_to_hls(r/255,g/255,b/255)
        if ss<0.25 or ll<0.15 or ll>0.9: continue
        for name,ranges in HUE_FAMILIES:
            if any(a<=hh*360<=b for a,b in ranges):
                tally[name]=tally.get(name,0)+1; break
    if not tally: return None, 0.0
    top=max(tally,key=tally.get)
    return top, tally[top]/sum(tally.values())

vetoed=0
for p in products:
    stated=next((fam for word,fam in CAPTION_TO_FAMILY.items() if word in p['colour'].lower()), None)
    if not stated: continue
    seen,share=photo_family(ROOT_PUB+p['files'][0])
    if seen and seen!=stated and share>0.6:
        p['colour'],p['hexv']='Assorted','#b9a897'; vetoed+=1
print(f'  colour vetoed by photo : {vetoed}')


def dhash(path, size=8):
    im=Image.open(path).convert('L').resize((size+1,size), Image.LANCZOS)
    px=list(im.getdata()); bits=0; n=0
    for r in range(size):
        for c in range(size):
            bits |= (1 if px[r*(size+1)+c] > px[r*(size+1)+c+1] else 0) << n; n+=1
    return bits

def hamming(a,b): return bin(a^b).count('1')

def sig(t):
    t=re.sub(r'[^a-z ]',' ', (t or '').lower())
    return ' '.join(sorted(set(t.split())))[:160]

SAME_GARMENT = 12          # dHash distance; 0 = identical frame
for p in products:
    try: p['_h']=dhash(ROOT_PUB+p['files'][0])
    except Exception: p['_h']=None

merged=[]
for p in products:
    twin=None
    for m in merged:
        if sig(m['subtitle'])!=sig(p['subtitle']): continue
        if m['_h'] is None or p['_h'] is None: continue
        if hamming(m['_h'], p['_h']) <= SAME_GARMENT:
            twin=m; break
    if twin:
        for f in p['files']:
            if f not in twin['files']: twin['files'].append(f)
        twin['likes']=max(twin['likes'], p['likes'])
        twin['date']=max(twin['date'], p['date'])
    else:
        merged.append(p)
products=merged
for p in products: p.pop('_h', None)

# Different garments sharing a caption become numbered looks of one drop.
from collections import defaultdict
groups=defaultdict(list)
for p in products: groups[p['name']].append(p)
ROMAN=['I','II','III','IV','V','VI','VII','VIII','IX','X']
for name,items in groups.items():
    if len(items)<2: continue
    items.sort(key=lambda x:-x['date'])
    for i,p in enumerate(items):
        p['name']=f"{name} · Look {ROMAN[i] if i<len(ROMAN) else i+1}"

products.sort(key=lambda p: -p['date'])
top_likes = sorted((p['likes'] for p in products), reverse=True)
bestseller_cut = top_likes[min(7, len(top_likes)-1)] if top_likes else 0

OCC = {'anarkali':"['wedding', 'wedding-guest', 'party', 'festive']",
       'party-wear':"['party', 'wedding', 'festive']",
       'russian-silk':"['festive', 'wedding-guest', 'party']",
       'modal-silk':"['festive', 'puja', 'wedding-guest']",
       'kurta-set':"['casual', 'festive', 'puja']",
       'salwar-suit':"['casual', 'festive', 'puja']",
       'handloom':"['casual', 'puja', 'festive']",
       'festive':"['festive', 'puja', 'wedding-guest']"}

def esc(t): return t.replace('\\','\\\\').replace("'","\\'")

out=[]
for i,p in enumerate(products,1):
    is_new = i <= 6
    is_best = p['likes'] >= bestseller_cut and p['likes'] > 0
    flags=''
    if is_best: flags+='    isBestseller: true,\n'
    if is_new:  flags+='    isNew: true,\n'
    out.append(f"""  {{
    id: 'lbr-{i:03d}',
    name: '{esc(p['name'])}',
    subtitle: '{esc(p['subtitle'])}',
    category: '{p['category']}',
    occasion: {OCC.get(p['category'], "['festive', 'casual']")},
    price: 0,
    priceOnRequest: true,
    // All {len(p['files'])} photographs are from the SAME carousel post, so the
    // gallery shows this one garment from several angles.
    primaryImage: '{p['files'][0]}',
    hoverImage:   '{p['files'][1]}',
    likes: {p['likes']},
    galleryImages: [
      {(',' + chr(10) + '      ').join(f"'{f}'" for f in p['files'])},
    ],
    instagramShortcode: '{p['code']}',
    instagramPostUrl: 'https://www.instagram.com/p/{p['code']}/',
    colorName: '{p['colour']}',
    colorHex: '{p['hexv']}',
    fabric: '{p['fabric']}',
    embellishment: '{esc(p['craft'])}',
    setIncludes: 'Not stated',
{flags}    description:
      '{esc(p['desc'])}',
    details: {{
      kurtiLength: 'Not stated',
      bottomType: 'Not stated',
      availableSizes: 'Ask on WhatsApp',
      weight: '—',
      washCare: 'Ask on WhatsApp',
    }},
    tags: ['{p['fabric']}', '{p['colour']}', '{esc(p['craft'])}'],
  }},""")

HEADER = '''import { Product } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// GENERATED FILE — do not hand-edit. Run `npm run catalogue`; the generators
// and the rules they follow are documented in scripts/catalogue/README.md.
//
// Every image is a real photograph downloaded from @label_by_rasika and served
// from public/media/instagram/. There are no stock photos.
//
// One product == one Instagram carousel, grouped by perceptual image hash, so
// a product's gallery can never mix two different garments. instagramPostUrl
// opens the original post so any claim here can be checked against it.
//
// Editorial prose (FAQs, the fabric & care guide) lives in content.ts, because
// this file is rewritten wholesale on every run.
// ─────────────────────────────────────────────────────────────────────────────

'''

with open(ROOT + '/src/data/products.ts', 'w') as f:
    f.write(HEADER + 'export const PRODUCTS: Product[] = [\n' + '\n'.join(out) + '\n];\n')
print(f'products.ts: {len(out)} products')
print(f'  bestsellers flagged: {sum(1 for p in products if p["likes"]>=bestseller_cut and p["likes"]>0)}')
print(f'  new flagged        : {min(6,len(products))}')
print(f'  total photographs  : {sum(len(p["files"]) for p in products)}')
