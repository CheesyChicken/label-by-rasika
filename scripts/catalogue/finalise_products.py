"""Post-processing applied after every catalogue regeneration.

Kept as one script because regenerating products.ts wipes these corrections,
and they were silently lost once already.
"""
import re

import pathlib
ROOT = str(pathlib.Path(__file__).resolve().parents[2])
P=f'{ROOT}/src/data/products.ts'

# 1. Fabric — only what Rasika actually states. Everything else is "Not stated".
STATED_FABRIC = {
 'DPWRBXnk27h':'Russian Silk','DPWP3B-k6Ix':'Russian Silk','DNF9DSRNyWb':'Modal Silk',
 'DNC5WGTtSQf':'Modal Silk Bandhani','DNC41asNvM-':'Modal Silk Bandhani',
 'DJ3j_uJP1Ar':'Cotton','DJ3f_wyvkf4':'Cotton','DJ1lB3TtuiJ':'Cotton','DJ1kGB3N_cT':'Cotton',
 'DJoy-pivTMe':'Chinon','DJl6DrfPupY':'Chinon',
}

# 2. NO PRICES.
#
#    There is nothing to anchor one to. Across 281 unique captions Rasika never
#    states a figure — the only two "money" mentions are the words "affordable
#    price". An earlier version put indicative per-category prices on the eight
#    most-liked pieces (₹3,200 kurta-set, ₹5,200 anarkali, and so on) on the
#    strength of a "₹3,999 order-value hint". That hint does not exist: it came
#    from a Whisper transcript of reel DbH_9WGAaQ1 that reads "Shoppa Rs 3.9999
#    & Aba…" — a mis-transcribed, long-expired FIRST-ANNIVERSARY BASKET offer,
#    not a garment price. The per-category numbers were not derived from it
#    either; they were invented outright.
#
#    Every piece is priceOnRequest until the boutique supplies real figures.
#    To add them, put {shortcode: price} in REAL_PRICES below — per garment,
#    from Rasika, never per category and never inferred.
REAL_PRICES: dict[str, int] = {}

s=open(P,encoding='utf-8').read()
head=s[:s.index('PRODUCTS: Product[] = [')]
body=s[s.index('PRODUCTS: Product[] = ['):]

fab=priced=0
for code in re.findall(r"instagramShortcode: '([^']+)'", body):
    a=body.index(f"instagramShortcode: '{code}'")
    start=body.rfind("\n  {\n    id: '", 0, a)
    nxt=body.find("\n  {\n    id: '", a)
    end=nxt if nxt!=-1 else body.find('\n];', a)
    blk=body[start:end]

    want=STATED_FABRIC.get(code,'Not stated')
    new=re.sub(r"fabric: '[^']*'", f"fabric: '{want}'", blk)
    new=re.sub(r"tags: \['[^']*'", f"tags: ['{want}'", new)
    if new!=blk: fab+=1

    # A price is applied ONLY when Rasika has given us that garment's figure.
    # Nothing is inferred from category, likes, fabric or anything else.
    if code in REAL_PRICES:
        new=new.replace('    price: 0,\n    priceOnRequest: true,\n',
                        f'    price: {REAL_PRICES[code]},\n')
        priced+=1

    body=body[:start]+new+body[end:]

open(P,'w',encoding='utf-8').write(head+body)
print(f'fabric normalised on {fab} products; real prices applied to {priced} (of {len(REAL_PRICES)} supplied)')
