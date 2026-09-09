import pathlib
ROOT = str(pathlib.Path(__file__).resolve().parents[2])
HARVEST = ROOT + '/data/harvest'
import json, os
man = json.load(open(HARVEST + '/instagram.manifest.json'))
tr = json.load(open(HARVEST + '/reel.transcripts.json'))
root=ROOT + ''
out=[]
for e in man:
    if not os.path.exists(root+'/public'+e['file']):
        continue
    rec_t = tr.get(e['code']) or {}
    t = rec_t.get('text') or ''
    # Two things to screen out. Whisper mis-detects the language of short or
    # music-only clips and emits a few characters of the wrong script. And where
    # a reel is set to a licensed song rather than narration, it transcribes the
    # SONG LYRICS — which say nothing about the garment and are not ours to
    # republish. Keep a transcript only when it is substantial and actually
    # talks about the product or the shop.
    SPEECH_MARKERS = (
        'lbr', 'label by rasika', 'rasika', 'outfit', 'kurta', 'kurti', 'chikankari',
        'anarkali', 'suit', 'fabric', 'cotton', 'silk', 'organza',
        'embroider', 'dupatta', 'store', 'visit', 'collection',
        'size', 'occasion', 'festive', 'wedding', 'pimple gurav', 'pune', 'whatsapp',
        'order', 'available', 'design', 'stitch', 'wear', 'shop', 'customer', 'client',
    )

    # Reject anything time-limited or commercial.
    #
    # 'price', 'offer' and 'discount' were originally in SPEECH_MARKERS — i.e.
    # they were reasons to KEEP a transcript, which is exactly backwards. The
    # result was that nine of the twenty-nine shipped transcripts republished
    # HER OWN EXPIRED PROMOTIONS as current, under the heading "What Rasika says
    # in this reel": a full discount schedule ("flat 20% off ... 15% ... 10%"),
    # "today is the last day of this exclusive anniversary offer", "in just 5
    # days we have already sold out more than 120 pieces", and a garbled
    # anniversary basket figure. A customer reads a live 20% off and turns up
    # at the shop expecting it. Same harm as an invented coupon, except the
    # words are genuinely hers — just years out of date.
    #
    # These are also the transcripts a price could ever be scraped from, so
    # dropping them keeps the no-invented-prices rule intact at the source.
    STALE_COMMERCIAL = (
        'offer', 'discount', '% off', 'percent off', 'flat 20', 'flat 15', 'flat 10',
        'sale', 'sold out', 'last day', 'limited period', 'limited time', 'hurry',
        'coupon', 'free gift', 'rs.', 'rs ', 'rupees', 'price', 'anniversary',
        'giveaway', 'lucky draw', 'first 30', 'valid till', 'valid until',
    )

    low = t.lower()
    if t and (len(t) < 60
              or rec_t.get('language') not in ('en', 'hi', 'mr')
              or not any(k in low for k in SPEECH_MARKERS)
              or any(k in low for k in STALE_COMMERCIAL)):
        t = ''
    rec={'code':e['code'],'i':e['i'],'file':e['file'],
         'isVideo':bool(e.get('isVideo')),'isSidecar':bool(e.get('isSidecar')),
         'caption':' '.join((e.get('caption') or '').split()),
         'likes':e.get('likes'),'comments':e.get('comments'),
         'date':e.get('date'),'location':e.get('location')}
    if t: rec['transcript']=t
    out.append(rec)
out.sort(key=lambda r:(-(r.get('date') or 0), r['code'], r['i']))
json.dump(out, open(root+'/src/data/instagram.gallery.json','w'), ensure_ascii=False, indent=0)
photos=sum(1 for r in out if not r['isVideo']); reels=sum(1 for r in out if r['isVideo'])
withT=sum(1 for r in out if r.get('transcript'))
print(f'gallery.json: {len(out)} images ({photos} photo, {reels} reel covers), {withT} with transcript')
